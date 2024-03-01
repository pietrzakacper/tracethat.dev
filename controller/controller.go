package controller

import (
	"devtools-project/model"
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

type consumer struct {
	c chan<- model.Event // channel to propagate events to consumer
}

const maxEventsPerRoom = 1000
const maxRoomInactivity = 1 * time.Hour
const inactivityCheckInterval = 5 * time.Minute

type room struct {
	roomId     string
	eventsLock *sync.Mutex
	events     []model.Event

	lastActivity *atomic.Value // time.Time

	consumersLock *sync.Mutex
	consumers     map[string]consumer // sessionId -> Consumer
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

func (s rooms) AddProducer(roomId string, c <-chan model.Event) {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[roomId]; !has {
		s[roomId] = newRoom(roomId)
	}

	room := s[roomId]
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

	c := make(chan model.Event)
	room.addConsumer(sessionId, c)

	return c
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
			delete(s, roomId)
		}
	}
}

func newRoom(roomId string) *room {
	lastActivity := &atomic.Value{}
	lastActivity.Store(time.Now())

	return &room{
		roomId:        roomId,
		eventsLock:    &sync.Mutex{},
		events:        []model.Event{},
		lastActivity:  lastActivity,
		consumersLock: &sync.Mutex{},
		consumers:     make(map[string]consumer),
	}
}

func (s *room) broadcast(e model.Event) {
	s.saveEvent(e)

	for _, session := range s.consumers {
		session.c <- e
	}
}

func (s *room) saveEvent(e model.Event) {
	s.registerActivity()

	s.eventsLock.Lock()
	defer s.eventsLock.Unlock()

	s.events = append(s.events, e)
	if len(s.events) > maxEventsPerRoom {
		fmt.Printf("Limiting events to %d for room %s\n", maxEventsPerRoom, s.roomId)
		offset := len(s.events) - maxEventsPerRoom
		// remove events old events that are already consumed
		s.events = s.events[offset:]
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

func (s *room) addConsumer(sessionId string, c chan<- model.Event) {
	s.registerActivity()
	s.consumersLock.Lock()
	defer s.consumersLock.Unlock()

	if _, has := s.consumers[sessionId]; has {
		// only add consumer and propagate history if the session is new
		// this prevents sending duplicated events to the same session
		return
	}

	s.consumers[sessionId] = consumer{c: c}

	go s.propagateHistoricalEvents(c)
}
