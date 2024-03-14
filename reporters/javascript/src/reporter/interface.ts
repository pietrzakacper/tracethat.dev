export interface Reporter {
    open(): Promise<void>;

    registerEvent(payload: any):Promise<void>;
}