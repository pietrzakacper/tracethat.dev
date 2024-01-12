# syntax=docker/dockerfile:1
FROM golang:1.21.4

WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

COPY *.go  ./
COPY view/ ./view
COPY static/ ./static
COPY model/ ./model

RUN go install github.com/a-h/templ/cmd/templ@latest
RUN templ generate

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/trace-that

ENV PORT 8080
EXPOSE 8080

# Run
CMD ["/app/bin/trace-that"]