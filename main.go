package main

import (
	"devtools-project/controller"
	"devtools-project/metrics"
	"devtools-project/model"

	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

const inactivityDeadline = 30 * time.Second

func main() {
	s := controller.NewRooms()

	fs := http.FileServer(http.Dir("./frontend/dist"))

	metricsMux := http.NewServeMux()

	metricsMux.Handle("/metrics", promhttp.Handler())

	metricsServer := &http.Server{
		Addr:    ":9091",
		Handler: metricsMux,
	}
	go func() {
		if os.Getenv("DISABLE_METRICS") == "true" {
			return
		}

		err := metricsServer.ListenAndServe()

		if err != nil {
			log.Fatalf("failed to start metrics server: %v", err)
		}
	}()

	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			go func() {

				var ipStr string
				if ipStr = r.Header.Get("Fly-Client-Ip"); ipStr == "" {
					ipStr = r.RemoteAddr
				}
				city := "unknown"
				if ipInfoToken := os.Getenv("IP_INFO_TOKEN"); ipInfoToken != "" {
					client := ipinfo.NewClient(nil, nil, ipInfoToken)
					info, err := client.GetIPInfo(net.ParseIP(ipStr))
					if err == nil {
						city = info.City
						ipStr = info.City + " " + info.CountryFlag.Emoji
					}
				} else {
					fmt.Println("IP_INFO_TOKEN not set")
				}

				metrics.LandingRequest.With(prometheus.Labels{"city": city}).Add(1)

				defer tt.LogWithTime("landing visit from "+ipStr, map[string]any{
					"url":     r.URL,
					"headers": r.Header,
				})()
			}()
		}

		// if it's any path, but not a file, route to index.html
		if !strings.Contains(r.URL.Path, ".") {
			r.URL.Path = "/"
		}

		fs.ServeHTTP(w, r)
	}))

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	debugStats := map[string]int{}

	http.Handle("/api/report", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("new /api/report connection from %s \n", r.RemoteAddr)

		roomId := r.URL.Query().Get("roomId")

		debugToken := r.URL.Query().Get("debugToken")

		if roomId == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		c := make(chan model.Event)

		s.AddProducer(roomId, c, debugToken)

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

			if debugToken != "" {
				debugStats[debugToken]++
				fmt.Printf("[%s] total events read: %d\n", debugToken, debugStats[debugToken])
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
