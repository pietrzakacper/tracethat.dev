package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/a-h/templ"
)

type Event struct {
	Status    string // ok, error, in-progress
	CallId    string
	Name      string
	Arguments []any
	Return    any
	startTs   time.Time
	endTs     time.Time
	callStack []string
}

func (e Event) toJSON() string {
	val, _ := json.Marshal(e)
	return string(val)
}

func main() {
	component := index()

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", templ.Handler(component))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

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

		for i := 0; i < 20; i++ {
			w.Write([]byte("data: "))

			id := rand.Intn(100)
			e := Event{Status: "ok", CallId: fmt.Sprintf("call-%d", id), Name: "GetUser", Arguments: []any{1, "hello"}, Return: map[string]any{"name": "Kacper", "age": 24}, startTs: time.Now(), endTs: time.Now(), callStack: []string{"GetUser", "GetUserById", "GetUserByIdFromDb"}}
			event(e).Render(context.Background(), w)

			w.Write([]byte("\n\n"))
			f.Flush()
		}
	}))

	fmt.Println("Listening on :3000")
	http.ListenAndServe(":3000", nil)
}
