import asyncio
from trace_that import trace_that

@trace_that
async def hello(name: str, greeting='Hello') -> str:
    await asyncio.sleep(1)
    return f'{greeting}, {name}!'

async def main():
    await hello(name='Kacper', greeting='Yo')

if __name__ == '__main__':
    asyncio.run(main())