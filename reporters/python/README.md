## Installation

```bash
pip install tracethat
```

## Usage

```python
from tracethat import tracethat

@tracethat
async def hello(name: str) -> str:
    await asyncio.sleep(1)
    return f'Hello, {name}!'

async def main():
    await hello(name='John')
```

You wiil need to register a token to use the reporter. You can do it by setting the `TT_TOKEN` environment variable:

```bash
TT_TOKEN=your_token python3 main.py
```

or by calling `register_token` function:

```python
from tracethat import register_token

register_token('your_token')
```
