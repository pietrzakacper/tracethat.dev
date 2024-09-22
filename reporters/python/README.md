## Installation

```bash
pip install tracethat
```

## Example

```python
from tracethat import tracethat, register_token

register_token('your_token')

@tracethat
async def hello(name: str) -> str:
    await asyncio.sleep(1)
    return f'Hello, {name}!'

async def main():
    await hello(name='John')

if __name__ == '__main__':
    asyncio.run(main())
```

## Reference

### tracethat

`tracethat` is a decorator that wraps a function and logs its execution. It takes a function as an argument and returns a wrapped function. It accepts both sync and async functions.

```python
@tracethat
def hello(name: str) -> str:
    return f'Hello, {name}!'
```

### tracethat.log

`tracethat.log` is a function that logs a message. It accepts a string as an argument and an optional payload.

```python
tracethat.log('hello', {'name': 'John'})
```

### register_token

You will need to register your token before using the reporter. You can do this by calling the `register_token` function and passing your token as an argument.

```python
from tracethat import register_token

register_token('your_token')
```

or by setting the `TT_TOKEN` environment variable.

```bash
TT_TOKEN=your_token python3 main.py
```
