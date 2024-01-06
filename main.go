package main

import (
	"context"
	"devtools-project/model"
	"devtools-project/view"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

type Session = struct {
	c chan model.Event // channel to propagate events to client
}
type Space = struct {
	events   []model.Event
	sessions map[string]Session // sessionId -> Session
}

type Spaces = map[string]Space // spaceId -> Space

func generateSessionId() string {
	return fmt.Sprintf("%d", rand.Intn(1000000))
}

func generateNewToken() string {
	return fmt.Sprintf("%d", rand.Uint64())
}

func main() {

	fs := http.FileServer(http.Dir("./static"))

	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := strings.TrimPrefix(r.URL.Path, "/")

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
		fmt.Println("hello")

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Transfer-Encoding", "chunked")

		for i := 0; i < 20; i++ {
			w.Write([]byte("data: "))

			time.Sleep(1 * time.Second)

			id := rand.Intn(100)
			e := model.Event{Status: "ok", CallId: fmt.Sprintf("call-%d", id), Name: "GetUser", Arguments: []any{1, "hello"}, Return: map[string]any{"name": "Kacper", "age": 24}, StartTs: time.Now(), EndTs: time.Now(), CallStack: []string{"GetUser", "GetUserById", "GetUserByIdFromDb"}}
			view.Event(e).Render(context.Background(), w)
			w.Write([]byte("\n\n"))

			f.Flush()
		}

		for {
			time.Sleep(1 * time.Second)
			w.Write([]byte("\n\n"))

		}

	}))

	fmt.Println("Listening on :3000")
	http.ListenAndServe(":3000", nil)
}
