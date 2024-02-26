package main

import (
	"devtools-project/controller"
	"devtools-project/model"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

func main() {
	s := controller.NewSpaces()

	fs := http.FileServer(http.Dir("./static"))

	http.Handle("/static/", http.StripPrefix("/static/", fs))

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	http.Handle("/api/report", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
			_, p, err := conn.ReadMessage()
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

			c <- e
		}
	}))

	http.Handle("/api/events", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
		w.Header().Set("Access-Control-Allow-Origin", "*")

		token := r.URL.Query().Get("token")
		sessionId := r.URL.Query().Get("sessionId")

		c := s.AddConsumer(token, sessionId)

		for {
			e := <-c
			j, err := json.Marshal(e)

			if err != nil {
				log.Println(err)
				continue
			}

			w.Write([]byte("data: "))
			w.Write(j)
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
