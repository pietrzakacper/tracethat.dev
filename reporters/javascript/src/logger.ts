import { runtimeConfig } from "./runtime-config"

export const log = (message: string) => {
    if(runtimeConfig.verbose) {
        console.log(message)
    }
}