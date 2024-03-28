package config

import (
	"os"
	"sync"
)

type RuntimeConfig struct {
	token     string
	serverUrl string
	enabled   bool
	verbose   bool
}

type RuntimeConfigView struct {
	Token     string
	ServerUrl string
	Enabled   bool
	Verbose   bool
}

var Config RuntimeConfig = RuntimeConfig{
	token:     "",
	serverUrl: "wss://tracethat.dev",
	enabled:   true,
	verbose:   false,
}

func init() {
	mutex.Lock()
	defer mutex.Unlock()

	if token := os.Getenv("TT_TOKEN"); token != "" {
		Config.token = token
	}

	if serverUrl := os.Getenv("TT_SERVER_URL"); serverUrl != "" {
		Config.serverUrl = serverUrl
	}

	if disable := os.Getenv("TT_DISABLE"); disable == "true" {
		Config.enabled = false
	}

	if verbose := os.Getenv("TT_VERBOSE"); verbose == "true" {
		Config.verbose = true
	}
}

var mutex sync.RWMutex

func (r *RuntimeConfig) RegisterToken(token string) {
	mutex.Lock()
	defer mutex.Unlock()
	r.token = token
}

func (r *RuntimeConfig) SetServerUrl(url string) {
	mutex.Lock()
	defer mutex.Unlock()
	r.serverUrl = url
}

func (r *RuntimeConfig) Disable() {
	mutex.Lock()
	defer mutex.Unlock()
	r.enabled = false
}

func (r *RuntimeConfig) EnableVerbose() {
	mutex.Lock()
	defer mutex.Unlock()
	r.verbose = true
}

func (r *RuntimeConfig) Load() RuntimeConfigView {
	mutex.RLock()
	defer mutex.RUnlock()
	return RuntimeConfigView{
		Token:     r.token,
		ServerUrl: r.serverUrl,
		Enabled:   r.enabled,
		Verbose:   r.verbose,
	}
}
