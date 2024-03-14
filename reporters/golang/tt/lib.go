package tt

import (
	"encoding/json"
	"fmt"
)

func Log(eventName string, payload ...interface{}) {
	p, err := json.Marshal(payload)
	fmt.Printf("val: %v \n err: %v\n", string(p), err)
}
