package controller

import (
	"devtools-project/metrics"
	"devtools-project/model"
	"encoding/json"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"math/rand"
)

type consumer struct {
	c chan model.Event // channel to propagate events to consumer
}

const maxMemoryPerRoom = 1024 * 1024 // 1MB
const reduceMemoryPerRoomThreshold = maxMemoryPerRoom * 0.6
const maxRoomInactivity = 1 * time.Hour
const inactivityCheckInterval = 5 * time.Minute

type room struct {
	roomId     string
	eventsLock *sync.Mutex
	events     []model.Event

	lastActivity *atomic.Value // time.Time

	consumersLock *sync.RWMutex
	consumers     map[string]consumer // sessionId -> Consumer

	debugToken string
	debugStats map[string]map[string]bool
	debugLock  *sync.Mutex
}

type rooms map[string]*room // roomId -> Room
var lock = sync.RWMutex{}

func NewRooms() rooms {
	rooms := rooms{}

	// periodically go over all rooms and remove inactive ones
	go func() {
		for {
			time.Sleep(inactivityCheckInterval)
			rooms.removeInactiveRooms()
		}
	}()

	return rooms
}

func (s rooms) AddProducer(roomId string, c <-chan model.Event, debugToken string) {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[roomId]; !has {
		s[roomId] = newRoom(roomId)
	}

	room := s[roomId]

	metrics.ActiveRooms.Set(float64(len(s)))

	if debugToken != "" {
		room.debugToken = debugToken
	}

	go func() {
		for {
			room.broadcast(<-c)
		}
	}()
}

func (s rooms) AddConsumer(roomId string, sessionId string) <-chan model.Event {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[roomId]; !has {
		s[roomId] = newRoom(roomId)
	}

	room := s[roomId]

	return room.addConsumer(sessionId)
}

func (s rooms) HasEvents(roomId string) bool {
	lock.Lock()
	defer lock.Unlock()
	if _, has := s[roomId]; !has {
		return false
	}

	room := s[roomId]

	room.eventsLock.Lock()
	defer room.eventsLock.Unlock()

	return len(room.events) > 0
}

func (s rooms) removeInactiveRooms() {
	lock.Lock()
	defer lock.Unlock()

	for roomId, room := range s {
		activity := room.lastActivity.Load().(time.Time)
		if time.Since(activity) > maxRoomInactivity {
			fmt.Printf("Purging inactive room %s\n", roomId)
			metrics.EventsInMemory.Sub(float64(len(room.events)))
			delete(s, roomId)
		}
	}

	metrics.ActiveRooms.Set(float64(len(s)))
}

func newRoom(roomId string) *room {
	lastActivity := &atomic.Value{}
	lastActivity.Store(time.Now())

	return &room{
		roomId:        roomId,
		eventsLock:    &sync.Mutex{},
		events:        []model.Event{},
		lastActivity:  lastActivity,
		consumersLock: &sync.RWMutex{},
		consumers:     make(map[string]consumer),
		debugLock:     &sync.Mutex{},
	}
}

func (s *room) logEventDebug(e model.Event, debugToken string) {
	if debugToken == "" {
		return
	}

	jsonStr, err := decrypt(string(e), debugToken)

	if err != nil {
		fmt.Printf("Error decrypting event: %s\n", err)
		return
	}

	eventJson := struct {
		Status string `json:"status"`
		CallId string `json:"callId"`
		Name   string `json:"name"`
	}{}
	err = json.Unmarshal([]byte(jsonStr), &eventJson)

	if err != nil {
		fmt.Printf("Error unmarshalling event: %s\n", err)
		return
	}

	fmt.Printf("=== %v\n", eventJson)

	s.debugLock.Lock()
	defer s.debugLock.Unlock()

	if s.debugStats == nil {
		s.debugStats = make(map[string]map[string]bool)
	}

	if _, ok := s.debugStats[eventJson.CallId]; !ok {
		s.debugStats[eventJson.CallId] = make(map[string]bool)
	}

	s.debugStats[eventJson.CallId][eventJson.Status] = true

	agg := make(map[string]int)
	for _, stats := range s.debugStats {
		for k := range stats {
			agg[k]++
		}
	}

	fmt.Printf("stats are: %v\n", agg)
}

func printDebugMsg(msg string, debugToken string, args ...any) {
	if debugToken != "" {
		fmt.Printf("[%s]", debugToken)
		fmt.Printf(msg, args...)
	}
}

func (s *room) broadcast(e model.Event) {
	callId := fmt.Sprintf("[%07x] ", rand.Intn(0x10000000))

	printDebugMsg(callId+"Broadcasting event to room %s\n", s.debugToken, s.roomId)
	s.logEventDebug(e, s.debugToken)

	s.saveEvent(e)

	s.consumersLock.RLock()
	defer s.consumersLock.RUnlock()

	printDebugMsg(callId+"There are %d consumers\n", s.debugToken, len(s.consumers))

	for sessionId, session := range s.consumers {
		go func(sessionId string, session consumer) {
			select {
			case session.c <- e:
				printDebugMsg(callId+"Just broadcasted to: %s\n", s.debugToken, sessionId)
				return
			case <-time.After(time.Second):
				printDebugMsg(callId+"Broadcasting event timed out: %s\n", s.debugToken, sessionId)
				// if the consumer doesn't consume the event within ten seconds, remove it
				s.consumersLock.Lock()
				delete(s.consumers, sessionId)
				s.consumersLock.Unlock()
			}
		}(sessionId, session)
	}
}

func (s *room) saveEvent(e model.Event) {
	s.registerActivity()

	s.eventsLock.Lock()
	defer s.eventsLock.Unlock()

	s.events = append(s.events, e)

	metrics.EventsInMemory.Add(1)

	totalEventsSize := 0
	for _, e := range s.events {
		totalEventsSize += len(e)
	}

	if totalEventsSize > maxMemoryPerRoom {
		metrics.RoomMemoryLimitReached.Inc()
		fmt.Printf("Total events size: %d bytes is higher than the allowed limit of %d bytes\n", totalEventsSize, maxMemoryPerRoom)

		newEventsStartIndex := 0
		for index, e := range s.events {
			newEventsStartIndex = index
			totalEventsSize -= len(e)
			metrics.EventsInMemory.Sub(1)

			if float64(totalEventsSize) <= reduceMemoryPerRoomThreshold {
				break
			}
		}

		// remove old events that are already consumed
		s.events = s.events[newEventsStartIndex:]
	}
}

func (s *room) registerActivity() {
	s.lastActivity.Store(time.Now())
}

func (s *room) propagateHistoricalEvents(c chan<- model.Event) {
	s.eventsLock.Lock()
	defer s.eventsLock.Unlock()

	for _, e := range s.events {
		c <- e
	}
}

func (s *room) addConsumer(sessionId string) <-chan model.Event {
	s.registerActivity()
	s.consumersLock.Lock()
	defer s.consumersLock.Unlock()

	if v, has := s.consumers[sessionId]; has {
		// only add consumer and propagate history if the session is new
		// this prevents sending duplicated events to the same session
		return v.c
	}

	c := make(chan model.Event)

	s.consumers[sessionId] = consumer{c: c}

	go s.propagateHistoricalEvents(c)

	return c
}
