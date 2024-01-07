package model

type Event struct {
	Name         string `json:"name"`
	Status       string `json:"status"` // ok, error, in-progress
	CallId       string `json:"callId"`
	StartEpochMs int    `json:"startEpochMs"`
	EndEpochMs   int    `json:"endEpochMs"`

	Details map[string]any `json:"details"`
}
