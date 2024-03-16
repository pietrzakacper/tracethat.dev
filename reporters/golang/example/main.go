package main

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"
)

func main() {
	tt.RegisterToken("123")
	if token := os.Getenv("TOKEN"); token != "" {
		tt.RegisterToken(token)
	}

	if serverUrl := os.Getenv("SERVER_URL"); serverUrl != "" {
		tt.SetServerUrl(serverUrl)
	}

	for {
		time.Sleep(500 * time.Millisecond)
		tt.Log(fmt.Sprintf("event-%d", rand.Int()), tt.P{
			"hello":     "world",
			"some-data": 123,
		})
	}
}
