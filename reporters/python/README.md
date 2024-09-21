## Installation

```bash
pip install trace_that
```

## Usage

```python
from trace_that import trace_that

@trace_that
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
from trace_that import register_token

register_token('your_token')
```
