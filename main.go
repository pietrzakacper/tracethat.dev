package main

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/a-h/templ"
)

type Event struct {
	Status        string // ok, error, in-progress
	CallId        string
	Name          string
	ArgumentsJson string
	ReturnJson    string
	startTs       time.Time
	endTs         time.Time
	callStack     []string
}

func main() {
	component := index()

	http.Handle("/", templ.Handler(component))

	http.Handle("/events", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		f, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
			return
		}
		fmt.Println("hello")

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Transfer-Encoding", "chunked")

		for {
			time.Sleep(1 * time.Second)

			w.Write([]byte("data: "))

			id := rand.Intn(100)
			e := Event{Status: "ok", CallId: fmt.Sprintf("call-%d", id), Name: "GetUser", ArgumentsJson: fmt.Sprintf(`{"id": %d}`, id), ReturnJson: fmt.Sprintf(`{"id": %d, "name": "Alice"}`, id), startTs: time.Now(), endTs: time.Now(), callStack: []string{"GetUser", "GetUserById", "GetUserByIdFromDb"}}
			event(e).Render(context.Background(), w)

			w.Write([]byte("\n\n"))
			f.Flush()
		}
	}))

	fmt.Println("Listening on :3000")
	http.ListenAndServe(":3000", nil)
}
