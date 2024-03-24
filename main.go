package main

import (
	"devtools-project/controller"
	"devtools-project/model"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

const inactivityDeadline = 30 * time.Second

func main() {
	s := controller.NewRooms()

	fs := http.FileServer(http.Dir("./frontend/dist"))

	http.Handle("/", fs)

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	http.Handle("/api/report", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("new /api/report connection from %s \n", r.RemoteAddr)

		roomId := r.URL.Query().Get("roomId")

		if roomId == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		c := make(chan model.Event)

		s.AddProducer(roomId, c)

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}

		inactivityTimer := time.AfterFunc(inactivityDeadline, func() {
			conn.Close()
		})

		for {
			_, p, err := conn.ReadMessage()
			if err != nil {
				log.Println(err)
				return
			}

			c <- model.Event(p)
			inactivityTimer.Reset(inactivityDeadline)
		}
	}))

	http.Handle("/api/events", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("new /api/events connection from %s \n", r.RemoteAddr)

		f, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Transfer-Encoding", "chunked")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		roomId := r.URL.Query().Get("roomId")
		sessionId := r.URL.Query().Get("sessionId")

		c := s.AddConsumer(roomId, sessionId)

		for {
			e := <-c

			w.Write([]byte("data: "))
			w.Write([]byte(e))
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
