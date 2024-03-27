import { traceThat } from 'tracethat.dev'

async function hello(name: string) {
    await new Promise((res) => setTimeout(res, 1000))
    return `Hello ${name}`
}

traceThat(hello)('world')