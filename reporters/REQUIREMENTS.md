Each reporter should implement these sets of requirements (if the language allows it).

1. Should expose a function for tracing a function/arbitrary data
When designing the reporter interface we should prioritize narrow interface surface e.g. few methods (ideally only one) and few configuration options (ideally none).
E.g. JS reporter allows us to wrap any function with `traceThat`
```javascript
import { traceThat } from 'tracethat.dev'

traceThat((x) => `Hello ${x}`)('world')
```
and Go reporter requires calling `tt.LogWithTime(name, params...)`, note that it also returns another function that will be run using `defer` to measure run time 
```go
package main

import "github.com/pietrzakacper/tracethat.dev/reporters/golang/tt"

func hello(x string) {
  defer tt.LogWithTime("hello", x)()
}

func main() {
    hello("world")
}
```

2. Should report events in a unified form
```typescript
type TraceEvent = {
    name: string;
    status: "error" | "ok" | "running";
    callId: string;
    startEpochMs: number;
    endEpochMs?: number | undefined;
    details?: any;
}
```

3. Should allow flexibile configuration 
Different configuration options should be accessible via both functions and env variables. If both are used at once, functions should always take precendence.

* token - (default: "") function: `registerToken`, env var: `TT_TOKEN=<token>`
* enabled - (default: true) function: `disableDevtools`, env var: `TT_DISABLE=true`
* serverUrl - (default: wss://tracethat.dev) function `setServerUrl`, env var `TT_SERVER_URL=<url>`
* verbose - (default: false) function `enableVerbose`, env var `TT_VERBOSE=true`

4. Should close the connection to the server after 30s of inactivity
Depending on the type of server that the reporter is connecting to, it might be problematic to maintain a long stale connection with the server. Due to various DDOS mitigations etc. servers might choose to silently close the socket on their side.
This is why we need to make sure we don't use connection that went stale and we do that by closing a connection on our side after 30s of no events sent.
The next event sent after closing the socket should obviously make a new connection to the server.

5. Should encrypt the data before sending it to the server 

6. Should have automated tests confirming all the requirements and any language specific functionality