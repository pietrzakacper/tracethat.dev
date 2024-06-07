module example

go 1.21.7

require github.com/pietrzakacper/tracethat.dev/reporters/golang/tt v0.0.0-20240314133434-59df19a52e98

require (
	github.com/google/uuid v1.6.0 // indirect
	github.com/gorilla/websocket v1.5.1 // indirect
	golang.org/x/net v0.17.0 // indirect
)

replace github.com/pietrzakacper/tracethat.dev/reporters/golang/tt => ../tt
