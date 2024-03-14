import { traceThat } from './trace-that'

import { disableDevtools, setServerUrl, registerToken } from './runtime-config'

const TT = {
    disableDevtools,
    setServerUrl,
    registerToken
}

declare global {
    interface Window {
        traceThat: typeof traceThat,
        TT: typeof TT
    }
}

window.traceThat = traceThat
window.TT = TT
