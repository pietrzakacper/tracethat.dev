export function generateId() {
  return (Math.random() * 10 ** 16).toString(32);
}

export function sleep(ms: number) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

export function stringify(data: any) {
  const cache: any[] = [];
  return JSON.stringify(data, (key, value) => {
    if (typeof value === "object" && value !== null) {
      // Duplicate reference found, discard key
      if (cache.includes(value)) return;

      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
}