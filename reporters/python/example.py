import asyncio
from tracethat import tracethat

@tracethat
async def hello(name: str, greeting='Hello') -> str:
    await asyncio.sleep(1)
    return f'{greeting}, {name}!'

async def main():
    tracethat.log('yo', {'a': [1, 2, 3]})
    await hello(name='Kacper', greeting='Yo')

if __name__ == '__main__':
    asyncio.run(main())