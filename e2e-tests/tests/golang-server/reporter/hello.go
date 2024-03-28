package main

import (
	"fmt"
	"os"
	"time"

	"github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"
)

func hello(name string) {
	defer tt.LogWithTime("hello", fmt.Sprintf("hello %s", name))()
	time.Sleep(100 * time.Millisecond)
}

func main() {
	hello(os.Args[1])

	tt.Wait()
}
