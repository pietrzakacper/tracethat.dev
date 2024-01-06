package model

import "time"

type Event struct {
	Status    string // ok, error, in-progress
	CallId    string
	Name      string
	Arguments []any
	Return    any
	StartTs   time.Time
	EndTs     time.Time
	CallStack []string
}
