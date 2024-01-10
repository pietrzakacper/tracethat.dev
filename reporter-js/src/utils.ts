export function generateId() {
  return (Math.random() * 10 ** 16).toString(32);
}

export function sleep(ms: number) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}
