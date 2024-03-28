package tt

import (
	"log"
	"sync"
	"sync/atomic"
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
	Rank         int64       `json:"rank"`
}

var wg sync.WaitGroup

func Wait() {
	wg.Wait()
}

var rankCounter atomic.Int64

func Log(eventName string, payload ...interface{}) {
	if !config.Config.Load().Enabled {
		return
	}

	if payload == nil {
		payload = make([]interface{}, 0)
	}

	reporter := reporter.GetWebSocketReporterInstance()

	wg.Add(1)
	rank := rankCounter.Add(1)
	go func() {
		defer wg.Done()
		err := reporter.RegisterEvent(event{
			Name:         eventName,
			Status:       "ok",
			CallId:       uuid.New().String(),
			StartEpochMs: time.Now().UnixMilli(),
			EndEpochMs:   time.Now().UnixMilli(),
			Details:      payload,
			Rank:         rank,
		})

		if err != nil {
			log.Printf("Couldn't send event tracethat.dev %v", err)
		}
	}()
}

func LogWithTime(eventName string, payload ...interface{}) func() {
	if !config.Config.Load().Enabled {
		return func() {}
	}

	if payload == nil {
		payload = make([]interface{}, 0)
	}
	reporter := reporter.GetWebSocketReporterInstance()
	callId := uuid.New().String()
	startEpochMs := time.Now().UnixMilli()

	wg.Add(1)
	rank := rankCounter.Add(1)
	go func() {
		defer wg.Done()
		err := reporter.RegisterEvent(event{
			Name:         eventName,
			Status:       "running",
			CallId:       callId,
			StartEpochMs: startEpochMs,
			Details:      payload,
			Rank:         rank,
		})

		if err != nil {
			log.Printf("Couldn't send event tracethat.dev %v", err)
		}
	}()

	return func() {
		wg.Add(1)
		rank := rankCounter.Add(1)
		endEpochMs := time.Now().UnixMilli()

		go func() {
			defer wg.Done()
			err := reporter.RegisterEvent(event{
				Name:         eventName,
				Status:       "ok",
				CallId:       callId,
				StartEpochMs: startEpochMs,
				EndEpochMs:   endEpochMs,
				Details:      payload,
				Rank:         rank,
			})

			if err != nil {
				log.Printf("Couldn't send event tracethat.dev %v", err)
			}
		}()
	}
}

var Config = &config.Config
