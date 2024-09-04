export interface Reporter {
  registerEvent(payload: any): Promise<void>;
}
