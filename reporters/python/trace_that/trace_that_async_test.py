import unittest
import asyncio
from trace_that.trace_that_impl import create_trace_that

class MemoryReporter:
    def __init__(self):
        self.messages = []

    def send(self, msg: str) -> None:
        self.messages.append(msg)

class TestTraceThatAsync(unittest.IsolatedAsyncioTestCase):        
    async def test_report_return_value(self):
        reporter = MemoryReporter()
        trace_that = create_trace_that(reporter)

        @trace_that
        async def hello(name: str) -> str:
            await asyncio.sleep(0.1)
            return f'Hello, {name}!'
        
        return_value = await hello('John')

        self.assertEqual(return_value, 'Hello, John!')

        ok_msg = next(m for m in reporter.messages if m['status'] == 'ok')
        self.assertIsNotNone(ok_msg)
        self.assertEqual(ok_msg['details']['return'], 'Hello, John!')

if __name__ == "__main__":
    unittest.main()