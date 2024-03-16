package tt

import (
	"encoding/json"
	"fmt"
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

type P = map[string]any

func Log(eventName string, payload P) {
	p, err := json.Marshal(payload)
	fmt.Printf("Sending %s\n", string(p))

	if err != nil {
		log.Fatal(err)
	}

	reporter := reporter.GetWebSocketReporterInstance()

	err = reporter.Open()
	if err != nil {
		log.Fatal(err)
	}

	err = reporter.RegisterEvent(event{
		Name:         eventName,
		Status:       "ok",
		CallId:       uuid.New().String(),
		StartEpochMs: time.Now().UnixMilli(),
		EndEpochMs:   time.Now().UnixMilli(),
		Details:      payload,
	})

	if err != nil {
		log.Fatal(err)
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
