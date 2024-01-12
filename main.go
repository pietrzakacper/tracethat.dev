package main

import (
	"context"
	"devtools-project/controller"
	"devtools-project/model"
	"devtools-project/view"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/websocket"
)

func generateSessionId() string {
	return fmt.Sprintf("%d", rand.Intn(1000000))
}

func generateNewToken() string {
	return fmt.Sprintf("%d", rand.Uint64())
}

func main() {
	s := controller.NewSpaces()

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

	portFromEnv := os.Getenv("PORT")

	if portFromEnv == "" {
		portFromEnv = "3000"
	}

	fmt.Println("Listening on :" + portFromEnv)
	http.ListenAndServe(":"+portFromEnv, nil)
}
