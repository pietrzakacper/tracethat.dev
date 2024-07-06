const { traceThat } = require("tracethat.dev");

const COUNT = process.argv[3] || 1;

async function count() {
  await new Promise((res) => setTimeout(res, 100));
  return "Hello";
}

for (let i = 1; i <= COUNT; i++) {
    traceThat(`count ${i}`, count)();
}