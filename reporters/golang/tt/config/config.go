package config

import (
	"sync"
)

type RuntimeConfig struct {
	Token     string
	ServerUrl string
	Enabled   bool
}

var runtimeConfig RuntimeConfig = RuntimeConfig{
	Token:     "",
	ServerUrl: "wss://tracethat.dev",
	Enabled: true,
}

var mutex sync.RWMutex

func DisableDevtools() {
	mutex.Lock()
	defer mutex.Unlock()
	runtimeConfig.Enabled = false
}

func SetServerUrl(url string) {
	mutex.Lock()
	defer mutex.Unlock()
	runtimeConfig.ServerUrl = url
}

func RegisterToken(token string) {
	mutex.Lock()
	defer mutex.Unlock()
	runtimeConfig.Token = token
}

func Load() RuntimeConfig {
	mutex.RLock()
	defer mutex.RUnlock()
	return runtimeConfig
}
