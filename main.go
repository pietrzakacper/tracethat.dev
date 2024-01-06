package main

import (
	"context"
	"devtools-project/model"
	"devtools-project/view"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"sync"
	"time"
)

type Consumer struct {
	c chan<- model.Event // channel to propagate events to client
}
type Space struct {
	eventsLock *sync.Mutex
	events     []model.Event

	consumersLock *sync.Mutex
	consumers     map[string]Consumer // sessionId -> Consumer
}

func NewSpace() *Space {
	return &Space{
		eventsLock:    &sync.Mutex{},
		events:        []model.Event{},
		consumersLock: &sync.Mutex{},
		consumers:     make(map[string]Consumer),
	}
}

func (s *Space) Broadcast(e model.Event) {
	s.eventsLock.Lock()
	s.events = append(s.events, e)
	s.eventsLock.Unlock()

	for _, session := range s.consumers {
		session.c <- e
	}
}

func (s *Space) AddConsumer(sessionId string, c chan<- model.Event) {
	s.consumersLock.Lock()
	defer s.consumersLock.Unlock()

	if _, has := s.consumers[sessionId]; has {
		return
	}

	s.consumers[sessionId] = Consumer{c: c}

	go func() {
		// propagate historical events
		for _, e := range s.events {
			fmt.Printf("propagating historical event %+v\n", e)
			c <- e
		}
	}()
}

type Spaces map[string]*Space // spaceId -> Space
var lock = sync.RWMutex{}

func (s Spaces) AddProducer(token string, c <-chan model.Event) {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[token]; !has {
		s[token] = NewSpace()
	}

	space, _ := s[token]
	go func() {
		for {
			space.Broadcast(<-c)
		}
	}()
}

func (s Spaces) AddConsumer(token string, sessionId string, c chan<- model.Event) {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[token]; !has {
		s[token] = NewSpace()
	}

	space, _ := s[token]
	space.AddConsumer(sessionId, c)
}

func generateSessionId() string {
	return fmt.Sprintf("%d", rand.Intn(1000000))
}

func generateNewToken() string {
	return fmt.Sprintf("%d", rand.Uint64())
}

func main() {
	s := Spaces{}

	c := make(chan model.Event)

	s.AddProducer("123", c)

	go func() {
		for {
			time.Sleep(1 * time.Second)

			id := rand.Intn(100)
			e := model.Event{Status: "ok", CallId: fmt.Sprintf("call-%d", id), Name: "GetUser", Arguments: []any{id, "hello"}, Return: map[string]any{"name": "Kacper", "age": 24}, StartTs: time.Now(), EndTs: time.Now(), CallStack: []string{"GetUser", "GetUserById", "GetUserByIdFromDb"}}

			c <- e
		}
	}()

	fs := http.FileServer(http.Dir("./static"))

	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := strings.TrimPrefix(r.URL.Path, "/")

		if token == "" {
			token = r.URL.Query().Get("token")
		}

		// show generate token page
		if token == "" {
			view.Landing(generateNewToken()).Render(context.Background(), w)
		} else {
			sessionId := generateSessionId()
			view.Events(token, sessionId).Render(context.Background(), w)
		}

	}))

	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.Handle("/events", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		f, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
			return
		}
		fmt.Println("new /events connection")

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Transfer-Encoding", "chunked")

		eventsStream := make(chan model.Event)

		token := r.URL.Query().Get("token")
		sessionId := r.URL.Query().Get("sessionId")

		s.AddConsumer(token, sessionId, eventsStream)

		for {
			e := <-eventsStream
			fmt.Printf("Sending event: %+v\n", e)
			w.Write([]byte("data: "))
			view.Event(e).Render(context.Background(), w)
			w.Write([]byte("\n\n"))

			f.Flush()
		}
	}))

	fmt.Println("Listening on :3000")
	http.ListenAndServe(":3000", nil)
}
