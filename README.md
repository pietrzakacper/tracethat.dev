# tracethat.dev

_No-setup remote debugging for any app_  
**_Use it yourself at [tracethat.dev](https://tracethat.dev)
![](./docs/demo.gif)_**

## Developing locally

For now only Unix/MacOS are supported for local development

### Global dependencies

- go (https://go.dev/doc/install) - tested with `go1.21.7`
- bun (https://bun.sh/docs/installation) - tested with `1.0.29`
- node/npm (https://nodejs.org/en/download) - tested with `v20.11.0`

### Golang Server

In `./`:

```bash
go mod tidy # install dependencies
go run ./... # re-run the server on each change
```

### React Frontend

In `./frontend`

```bash
bun install # install dependencies
bun run dev # Run Vite server with hot-reloading
```

### JavaScript Reporter

In `./reporters/javascript`

```bash
bun install # install dependencies
bun run build # build on each change
# Run the example using locally built reporter and local server
TT_SERVER_URL=ws://localhost:3000 TT_TOKEN=123 npx tsx example/index.ts
```

### Golang Reporter

In `./reporters/golang`

```bash
go mod tidy # install dependencies
cd example
# Run the example using locally built reporter and local server
TT_SERVER_URL=ws://localhost:3000 TT_TOKEN=123 go run ./...
```

### E2E tests

In `e2e-tests` directory:

```bash
bunx playwright install
bun install # install dependencies
bun run test # run tests
```

## Contributing

This project is meant to be built by the community.
Please refer to the list of `Issues` but don't limit yourself to it.
If you have an idea/bugfix I'm open for any kind of contributions.
Feel free to contact me on [LinkedIn](https://www.linkedin.com/in/kacper-pietrzak/) in case you want to help.
