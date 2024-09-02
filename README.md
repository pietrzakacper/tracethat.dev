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

### JavaScript Reporter

In `./reporters/javascript`

```bash
bun install # install dependencies
bun run build # build on each change
cd example && bun install && cd .. # install example's dependencies
# Run the example using locally built reporter and local server
TT_SERVER_URL=ws://localhost:3000 TT_TOKEN=123 bun example/index.ts
```

### React Frontend

Make sure you've built the JavaScript Reporter before as it's a local dependency.

In `./frontend`

```bash
bun install # install dependencies
cp .env.example .env # set env variables
bun run dev # Run Vite server with hot-reloading
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
bun install # install dependencies
bunx playwright install
bun run test # run tests
```

## Troubleshooting

### "The service was stopped" when building the frontend

If you get the following error when building the frontend using `bun run build`

```bash
bun run build
$ tsc && bunx --bun vite build
failed to load config from /Users/kacper/Projects/tracethat.dev/frontend/vite.config.ts
error during build:
Error: The service was stopped
    at <anonymous> (/Users/kacper/Projects/tracethat.dev/frontend/node_modules/esbuild/lib/main.js:1084:29)
    at <anonymous> (/Users/kacper/Projects/tracethat.dev/frontend/node_modules/esbuild/lib/main.js:704:9)
```

Make sure the the frontend dev server isn't running.

### "Cannot find module "tracethat.dev" when running e2e tests or examples

Make sure that whatever package you run has installed dependencies using `bun install`.  
Even though tracethat.dev is a local dependency a proper symbolic link needs to be made for that to work (it's done automatically when running `bun install`)

## Contributing

This project is meant to be built by the community.
Please refer to the list of `Issues` but don't limit yourself to it.
If you have an idea/bugfix I'm open for any kind of contributions.
Feel free to contact me on [LinkedIn](https://www.linkedin.com/in/kacper-pietrzak/) in case you want to help.
