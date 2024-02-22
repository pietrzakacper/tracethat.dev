function padStart(value: number, length: number) {
  return value.toString().padStart(length, "0");
}

export function formatTime(date: Date) {
  const hours = padStart(date.getHours(), 2);
  const minutes = padStart(date.getMinutes(), 2);
  const seconds = padStart(date.getSeconds(), 2);
  const milliseconds = padStart(date.getMilliseconds(), 3);

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function formatDuration(duration: number) {
  return duration.toFixed(3) + "s";
}
