package main

import (
	"time"

	"github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"
)

func hello(name string) {
	defer tt.LogWithTime("hello", name)()
	time.Sleep(time.Second)
}

func main() {
	hello("world")
	tt.Wait()
}
