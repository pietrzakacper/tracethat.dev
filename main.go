package main

import (
	"devtools-project/controller"
	"devtools-project/model"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"
)

const inactivityDeadline = 30 * time.Second

func main() {
	s := controller.NewRooms()

	fs := http.FileServer(http.Dir("./frontend/dist"))

	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			var ip string
			if ip = r.Header.Get("Fly-Client-Ip"); ip == "" {
				ip = r.RemoteAddr
			}
			defer tt.LogWithTime("landing visit from "+ip, r.URL, r.Header)()
		}
		fs.ServeHTTP(w, r)
	}))

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
			select {

			case e := <-c:
				payload := [...][]byte{[]byte("data: "), []byte(e), []byte("\n\n")}

				for _, p := range payload {
					_, err := w.Write(p)
					if err != nil {
						return
					}
				}

				f.Flush()

			case <-r.Context().Done():
				return

			case <-time.After(inactivityDeadline):
				return
			}

		}
	}))

	portFromEnv := os.Getenv("PORT")

	if portFromEnv == "" {
		portFromEnv = "3000"
	}

	host := "0.0.0.0"
	if os.Getenv("LOCAL") == "true" {
		host = "localhost"
	}

	l, err := net.Listen("tcp", host+":"+portFromEnv)

	if err != nil {
		log.Fatalf(err.Error())
	}

	tt.Config.SetServerUrl("ws://localhost:" + portFromEnv)
	tt.Config.RegisterToken("trace-that-landing")

	fmt.Println("Listening on :" + portFromEnv)

	if err := http.Serve(l, nil); err != nil {
		log.Fatalf(err.Error())
	}
}
