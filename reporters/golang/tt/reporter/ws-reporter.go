package reporter

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"crypto/sha256"

	"github.com/gorilla/websocket"
	"github.com/pietrzakacper/tracethat.dev/reporters/golang/tt/config"
)

type Reporter interface {
	open() error
	registerEvent(payload interface{}) error
}

func sendRegisterEventMessage(ws *websocket.Conn, payload interface{}) error {
	msg, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	encryptedMsg, err := encrypt(string(msg), config.Load().Token)
	if err != nil {
		return err
	}
	
	return ws.WriteMessage(websocket.TextMessage, []byte(encryptedMsg))
}

type webSocketReporter struct {
	ws             *websocket.Conn
	connected      bool
	connectedMutex *sync.RWMutex

	timeOfCleanup atomic.Pointer[time.Time]
}

var instance *webSocketReporter

func GetWebSocketReporterInstance() *webSocketReporter {
	if instance != nil {
		return instance
	}

	r := &webSocketReporter{
		connectedMutex: &sync.RWMutex{},
		timeOfCleanup:  atomic.Pointer[time.Time]{},
	}

	go r.cleanupIdleConnection()

	instance = r
	return r
}

func (r *webSocketReporter) Open() error {
	r.connectedMutex.Lock()
	defer r.connectedMutex.Unlock()

	if r.connected {
		return nil
	}

	if config.Load().Token == "" {
		time.Sleep(100 * time.Millisecond)
	}

	token := config.Load().Token
	if token == "" {
		log.Println("[tracethat.dev] Couldn't open a socket, no token provided")
		return fmt.Errorf("no token provided")
	}

	h := sha256.New()
	h.Write([]byte(token))
	roomId := fmt.Sprintf("%x", h.Sum(nil))

	url := config.Load().ServerUrl + "/api/report?roomId=" + roomId

	ws, _, err := websocket.DefaultDialer.Dial(url, nil)

	if err != nil {
		return err
	}

	r.ws = ws
	r.connected = true

	return nil
}

func (r *webSocketReporter) RegisterEvent(payload interface{}) error {
	r.connectedMutex.RLock()
	defer r.connectedMutex.RUnlock()

	if !r.connected {
		log.Println("Couldn't open a socket, failed to send an event")
		return fmt.Errorf("socket not connected")
	}

	err := sendRegisterEventMessage(r.ws, payload)
	if err != nil {
		log.Printf("cleanup - register event err: %v\n", err)
		go r.cleanup()
		return err
	}

	go r.scheduleCleanup()

	return nil
}

// time of inactivity to close the connection
const cleanupTimeout = 30 * time.Second

func (r *webSocketReporter) scheduleCleanup() {
	t := time.Now().Add(cleanupTimeout)
	r.timeOfCleanup.Store(&t)
}

func (r *webSocketReporter) cleanupIdleConnection() {
	ticker := time.NewTicker(time.Second)
	for {
		<-ticker.C

		v := r.timeOfCleanup.Load()

		if v == nil {
			continue
		}

		if time.Now().After(*v) {
			r.timeOfCleanup.Store(nil)
			r.cleanup()
		}
	}
}

func (r *webSocketReporter) cleanup() {
	r.connectedMutex.Lock()
	defer r.connectedMutex.Unlock()
	if r.ws != nil {
		r.ws.Close()
		r.connected = false
		r.ws = nil
	}
}
