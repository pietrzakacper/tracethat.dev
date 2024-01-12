import { registerToken, traceThat } from 'tracethat.dev'

registerToken('123')

const ping = (address) => {
    return new Promise((resolve, reject) => {
        const start = Date.now()
        const req = require('http').get(address, res => {
            const end = Date.now()
            console.log(`Ping ${address} took ${end - start}ms`)
            resolve(end - start)
        })
        req.on('error', reject)
    })

}

async function main() {
    while (true) {
        await new Promise(res => setTimeout(res, 1000))
        await traceThat(ping)('http://www.google.com').catch(console.error)
        traceThat('lolz', () => 1)()
    }
}

main().catch(console.error)