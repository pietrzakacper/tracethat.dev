# syntax=docker/dockerfile:1
FROM golang:1.21.7

WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

COPY *.go  ./
COPY static/ ./static
COPY model/ ./model
COPY controller/ ./controller
COPY metrics/ ./metrics
COPY frontend/dist ./frontend/dist

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/trace-that

ENV PORT 8080
EXPOSE 8080

# Run
CMD ["/app/bin/trace-that"]
