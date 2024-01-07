package main

import (
	"context"
	"devtools-project/model"
	"devtools-project/view"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
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

func (s Spaces) AddConsumer(token string, sessionId string) <-chan model.Event {
	lock.Lock()
	defer lock.Unlock()

	if _, has := s[token]; !has {
		s[token] = NewSpace()
	}

	space, _ := s[token]

	c := make(chan model.Event)
	space.AddConsumer(sessionId, c)

	return c
}

func generateSessionId() string {
	return fmt.Sprintf("%d", rand.Intn(1000000))
}

func generateNewToken() string {
	return fmt.Sprintf("%d", rand.Uint64())
}

func main() {
	s := Spaces{}

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

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	http.Handle("/report", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")

		if token == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		c := make(chan model.Event)

		s.AddProducer(token, c)

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		for {
			messageType, p, err := conn.ReadMessage()
			if err != nil {
				log.Println(err)
				return
			}

			e := model.Event{}
			err = json.Unmarshal(p, &e)

			if err != nil {
				log.Println(err)
				return
			}

			fmt.Printf("event received %+v\n", e)
			c <- e

			fmt.Printf("received message %v %v %v\n", messageType, string(p), err)
		}
	}))

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

		token := r.URL.Query().Get("token")
		sessionId := r.URL.Query().Get("sessionId")

		c := s.AddConsumer(token, sessionId)

		for {
			e := <-c
			w.Write([]byte("data: "))
			view.Event(e).Render(context.Background(), w)
			w.Write([]byte("\n\n"))

			f.Flush()
		}
	}))

	fmt.Println("Listening on :3000")
	http.ListenAndServe(":3000", nil)
}
