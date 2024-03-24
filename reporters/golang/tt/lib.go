package tt

import (
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/pietrzakacper/tracethat.dev/reporters/golang/tt/config"
	reporter "github.com/pietrzakacper/tracethat.dev/reporters/golang/tt/reporter"
)

type event struct {
	Name         string      `json:"name"`
	Status       string      `json:"status"`
	CallId       string      `json:"callId"`
	StartEpochMs int64       `json:"startEpochMs"`
	EndEpochMs   int64       `json:"endEpochMs"`
	Details      interface{} `json:"details"`
}

func Log(eventName string, payload ...interface{}) {
	if !config.Load().Enabled {
		return
	}

	if payload == nil {
		payload = make([]interface{}, 0)
	}

	reporter := reporter.GetWebSocketReporterInstance()

	// @TODO add a way to block process from exiting
	go func() {
		err := reporter.RegisterEvent(event{
			Name:         eventName,
			Status:       "ok",
			CallId:       uuid.New().String(),
			StartEpochMs: time.Now().UnixMilli(),
			EndEpochMs:   time.Now().UnixMilli(),
			Details:      payload,
		})

		if err != nil {
			log.Printf("Couldn't send event tracethat.dev %v", err)
			return
		}
	}()
}

func LogWithTime(eventName string, payload ...interface{}) func() {
	if !config.Load().Enabled {
		return func() {}
	}

	if payload == nil {
		payload = make([]interface{}, 0)
	}
	reporter := reporter.GetWebSocketReporterInstance()
	callId := uuid.New().String()
	startEpochMs := time.Now().UnixMilli()

	go func() {
		err := reporter.RegisterEvent(event{
			Name:         eventName,
			Status:       "running",
			CallId:       callId,
			StartEpochMs: startEpochMs,
			Details:      payload,
		})

		if err != nil {
			log.Printf("Couldn't send event tracethat.dev %v", err)
		}
	}()

	return func() {
		go func() {
			err := reporter.RegisterEvent(event{
				Name:         eventName,
				Status:       "ok",
				CallId:       callId,
				StartEpochMs: startEpochMs,
				EndEpochMs:   time.Now().UnixMilli(),
				Details:      payload,
			})

			if err != nil {
				log.Printf("Couldn't send event tracethat.dev %v", err)
			}
		}()
	}
}

func DisableDevtools() {
	config.DisableDevtools()
}

func SetServerUrl(url string) {
	config.SetServerUrl(url)
}

func RegisterToken(token string) {
	config.RegisterToken(token)
}
