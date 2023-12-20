package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/a-h/templ"
)

type Event struct {
	name string
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

			e := Event{name: "Yo From The Server!"}
			event(e).Render(context.Background(), w)

			w.Write([]byte("\n\n"))
			f.Flush()
		}
	}))

	fmt.Println("Listening on :3000")
	http.ListenAndServe(":3000", nil)
}
