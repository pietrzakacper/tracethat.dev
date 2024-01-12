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

const maxEventsPerSpace = 1000
const maxSpaceInactivity = 1 * time.Hour
const inactivityCheckInterval = 5 * time.Minute

type space struct {
	token      string
	eventsLock *sync.Mutex
	events     []model.Event

	lastActivity *atomic.Value // time.Time

	consumersLock *sync.Mutex
	consumers     map[string]consumer // sessionId -> Consumer
}

type spaces map[string]*space // spaceId -> Space
var lock = sync.RWMutex{}

func NewSpaces() spaces {
	spaces := spaces{}

	// periodically go over all spaces and remove inactive ones
	go func() {
		for {
			time.Sleep(inactivityCheckInterval)
			spaces.removeInactiveSpaces()
		}
	}()

	return spaces
}

func (s spaces) AddProducer(token string, c <-chan model.Event) {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[token]; !has {
		s[token] = newSpace(token)
	}

	space, _ := s[token]
	go func() {
		for {
			space.broadcast(<-c)
		}
	}()
}

func (s spaces) AddConsumer(token string, sessionId string) <-chan model.Event {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[token]; !has {
		s[token] = newSpace(token)
	}

	space, _ := s[token]

	c := make(chan model.Event)
	space.addConsumer(sessionId, c)

	return c
}

func (s spaces) removeInactiveSpaces() {
	lock.Lock()
	defer lock.Unlock()

	for token, space := range s {
		activity := space.lastActivity.Load().(time.Time)
		if time.Since(activity) > maxSpaceInactivity {
			fmt.Printf("Purging inactive space %s\n", token)
			delete(s, token)
		}
	}
}

func newSpace(token string) *space {
	lastActivity := &atomic.Value{}
	lastActivity.Store(time.Now())

	return &space{
		token:         token,
		eventsLock:    &sync.Mutex{},
		events:        []model.Event{},
		lastActivity:  lastActivity,
		consumersLock: &sync.Mutex{},
		consumers:     make(map[string]consumer),
	}
}

func (s *space) broadcast(e model.Event) {
	s.saveEvent(e)

	for _, session := range s.consumers {
		session.c <- e
	}
}

func (s *space) saveEvent(e model.Event) {
	s.registerActivity()

	s.eventsLock.Lock()
	defer s.eventsLock.Unlock()

	s.events = append(s.events, e)
	if len(s.events) > maxEventsPerSpace {
		fmt.Printf("Limiting events to %d for space %s\n", maxEventsPerSpace, s.token)
		offset := len(s.events) - maxEventsPerSpace
		// remove events old events that are already consumed
		s.events = s.events[offset:]
	}
}

func (s *space) registerActivity() {
	s.lastActivity.Store(time.Now())
}

func (s *space) propagateHistoricalEvents(c chan<- model.Event) {
	s.eventsLock.Lock()
	defer s.eventsLock.Unlock()

	for _, e := range s.events {
		c <- e
	}
}

func (s *space) addConsumer(sessionId string, c chan<- model.Event) {
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
