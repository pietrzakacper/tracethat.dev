import asyncio
import time
from trace_that import trace_that

@trace_that
def hello(name: str, greeting='Hello') -> str:
    time.sleep(1)
    return f'{greeting}, {name}!'

async def main():
    hello(name='Kacper', greeting='Yo')

if __name__ == '__main__':
    asyncio.run(main())