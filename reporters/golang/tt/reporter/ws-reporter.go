package reporter

import (
	"encoding/json"
	"errors"
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

func (r *webSocketReporter) sendRegisterEventMessage(payload interface{}) error {
	msg, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	encryptedMsg, err := encrypt(string(msg), config.Load().Token)
	if err != nil {
		return err
	}

	r.wsMutex.Lock()
	defer r.wsMutex.Unlock()

	if r.ws == nil {
		return errors.New("socket closed")
	}

	r.ws.SetWriteDeadline(time.Now().Add(3 * time.Second))

	return r.ws.WriteMessage(websocket.TextMessage, []byte(encryptedMsg))
}

type webSocketReporter struct {
	ws      *websocket.Conn
	wsMutex *sync.Mutex

	inactivityTimer *time.Timer
}

var instance *webSocketReporter

func GetWebSocketReporterInstance() *webSocketReporter {
	if instance != nil {
		return instance
	}

	r := &webSocketReporter{
		wsMutex:         &sync.Mutex{},
		inactivityTimer: nil,
	}

	instance = r
	return r
}

const inactivityDeadline = 30 * time.Second

func (r *webSocketReporter) open() error {
	r.wsMutex.Lock()
	defer r.wsMutex.Unlock()

	if r.ws != nil {
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

	return nil
}

func (r *webSocketReporter) RegisterEvent(payload interface{}) error {
	impl := func() error {
		err := r.open()

		if err != nil {
			return err
		}

		err = r.sendRegisterEventMessage(payload)

		if err != nil {
			log.Printf("cleanup - register event err: %v\n", err)
			r.cleanup()
			return err
		}

		if r.inactivityTimer == nil {
			r.inactivityTimer = time.AfterFunc(inactivityDeadline, func() {
				r.cleanup()
			})
		} else {
			r.inactivityTimer.Reset(inactivityDeadline)
		}

		return nil
	}

	err := impl()

	if err == nil {
		return nil
	}

	err = impl()

	return err
}

func (r *webSocketReporter) cleanup() {
	r.wsMutex.Lock()
	defer r.wsMutex.Unlock()

	if r.ws != nil {
		r.ws.Close()
		r.ws = nil
	}
}
