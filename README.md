# tracethat.dev
*No-setup remote debugging for any app*  
***Use it yourself at [tracethat.dev](https://tracethat.dev)
![](./docs/demo.gif)***

## Developing locally
### Golang Server
1. Do only once before first build
```bash
# Install go from official webiste
go mod tidy # install deps
```

2. Do on every build/change
```bash
go ./... # Runs the server
```

### JavaScript Reporter
```bash
cd reporter-js
npm i # run only once
npm run build # build on each change
# Run the example using locally build reporter and local server
SERVER_URL=ws://localhost:3000/api/report TOKEN=123 npx tsx example/ping.ts
```

## Contributing
This project is meant to be built by the community.
Please refer to the list of `Issues` but don't limit yourself to it.
If you have an idea/bugfix I'm open for any kind of contributions.
Feel free to contact me on [LinkedIn](https://www.linkedin.com/in/kacper-pietrzak/) in case you want to help. 
