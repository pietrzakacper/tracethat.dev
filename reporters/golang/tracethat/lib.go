package tt

import "fmt"

func Log(msg string, payload ...interface{}) {
	fmt.Printf(msg, payload...)
}
