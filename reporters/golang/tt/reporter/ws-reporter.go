package tt

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
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
	return ws.WriteMessage(websocket.TextMessage, msg)
}

type webSocketReporter struct {
	ws             *websocket.Conn
	connected      bool
	connectedMutex *sync.RWMutex
}

var instance *webSocketReporter

func GetWebSocketReporterInstance() *webSocketReporter {
	if instance != nil {
		return instance
	}
	r := &webSocketReporter{
		connectedMutex: &sync.RWMutex{},
	}
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

	if config.Load().Token == "" {
		log.Println("[tracethat.dev] Couldn't open a socket, no token provided")
		return fmt.Errorf("no token provided")
	}

	h := sha256.New()
	h.Write([]byte(config.Load().Token))
	roomId := fmt.Sprintf("%x", h.Sum(nil))

	url := config.Load().ServerUrl + "/api/report?roomId=" + roomId
	fmt.Println(url)
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
		return err
	}

	return nil
}
