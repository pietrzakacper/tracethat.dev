export const getMemoryReport = () => {
  const { rss, heapUsed, heapTotal } = process.memoryUsage();

  const format = (n: number) => (n / 1024 ** 2).toFixed(2) + "MB";

  return {
    rss: format(rss),
    heapTotal: format(heapTotal),
    heapUsed: format(heapUsed),
  };
};
