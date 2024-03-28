const { traceThat } = require("tracethat.dev");

async function hello(name) {
  await new Promise((res) => setTimeout(res, 100));
  return `Hello ${name}`;
}

traceThat(hello)(process.argv[2]);
