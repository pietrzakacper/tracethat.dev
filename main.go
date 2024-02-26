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

	"github.com/alecthomas/chroma/formatters/html"
	"github.com/alecthomas/chroma/lexers"
	"github.com/alecthomas/chroma/styles"

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
			hasEvents := s.HasEvents(token)
			instructionHtml := getInstructionHtml(token)
			sessionId := generateSessionId()
			view.Events(token, sessionId, instructionHtml, hasEvents).Render(context.Background(), w)
		}

	}))

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

func getInstructionHtml(token string) string {
	style := styles.Get("abap")
	if style == nil {
		style = styles.Fallback
	}
	formatter := html.New()

	rawInstruction := fmt.Sprintf(`
	import { traceThat, registerToken } from 'tracethat.dev'

	registerToken('%s')

	const hello = (name) => {
		return `+
		"`Hello ${name}!`"+
		`
	}

	traceThat(hello)('world')

		`, token)

	lexer := lexers.Get("javascript")
	iterator, err := lexer.Tokenise(nil, rawInstruction)

	strWriter := &strings.Builder{}
	err = formatter.Format(strWriter, style, iterator)

	if err != nil {
		panic(err)
	}

	return strWriter.String()
}
