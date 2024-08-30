package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var LandingRequest = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "tracethat_landing",
	Help: "The total number of tracethat requests to landing page",
}, []string{"city"})

var ActiveRooms = promauto.NewGauge(prometheus.GaugeOpts{
	Name: "tracethat_rooms",
	Help: "The total number of active rooms",
})

var EventsInMemory = promauto.NewGauge(prometheus.GaugeOpts{
	Name: "tracethat_events",
	Help: "The total number of events from all active rooms",
})
