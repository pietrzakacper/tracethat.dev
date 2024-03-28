export class ProcessExitBlocker {
  private static _instance: ProcessExitBlocker;
  private counter = 0;
  private exitCb?: () => void;

  static get instance() {
    if (!this._instance) {
      this._instance = new ProcessExitBlocker();
    }
    return this._instance;
  }

  private scheduleInterval() {
    let intervalRef = setInterval(() => {
      if (this.counter === 0) {
        this.exitCb?.();
        // unblock process from exiting
        clearInterval(intervalRef);
      }
    }, 100);
  }

  public addPending(n: number) {
    if (this.counter === 0) {
      this.scheduleInterval();
    }

    this.counter += n;
  }

  public resolvePending() {
    this.counter = Math.max(0, this.counter - 1);
  }

  public onShouldExit(cb: () => void) {
    this.exitCb = cb;
  }
}
