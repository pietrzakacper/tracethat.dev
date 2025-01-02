import unittest
from tracethat.tracethat_impl import create_tracethat

class MemoryReporter:
    def __init__(self):
        self.messages = []

    def send(self, msg: str) -> None:
        self.messages.append(msg)

class TestTraceThat(unittest.TestCase):
    def test_return_value_unchanged(self):
        tracethat = create_tracethat(MemoryReporter())

        @tracethat
        def hello(name: str) -> str:
            return f'Hello, {name}!'
        
        self.assertEqual(hello('John'), 'Hello, John!')

    def test_report_arguments(self):
        reporter = MemoryReporter()
        tracethat = create_tracethat(reporter)

        @tracethat
        def hello(name: str) -> str:
            return f'Hello, {name}!'
        
        hello('John')
        
        running_msg = next(m for m in reporter.messages if m['status'] == 'running')
        self.assertIsNotNone(running_msg)
        self.assertEqual(running_msg['details']['args'], ['John'])

    def test_report_return_value(self):
        reporter = MemoryReporter()
        tracethat = create_tracethat(reporter)

        @tracethat
        def hello(name: str) -> str:
            return f'Hello, {name}!'
        
        hello('John')
        
        ok_msg = next(m for m in reporter.messages if m['status'] == 'ok')
        self.assertIsNotNone(ok_msg)
        self.assertEqual(ok_msg['details']['return'], 'Hello, John!')
    
    def test_report_callstack(self):
        reporter = MemoryReporter()
        tracethat = create_tracethat(reporter)

        @tracethat
        def hello(name: str) -> str:
            return f'Hello, {name}!'
        
        def will_call_hello():
            hello('John')

        will_call_hello()
        
        running_msg = next(m for m in reporter.messages if m['status'] == 'running')
        self.assertIsNotNone(running_msg)

        callstack = running_msg['details']['callStack']
        self.assertIsInstance(callstack, list)

        parent_frame = next(f for f in callstack if 'will_call_hello' in f)
        self.assertIsNotNone(parent_frame)

    def test_timestamps(self):
        reporter = MemoryReporter()
        tracethat = create_tracethat(reporter)

        @tracethat
        def hello(name: str) -> str:
            return f'Hello, {name}!'
        
        hello('John')
        
        running_msg = next(m for m in reporter.messages if m['status'] == 'running')
        self.assertIsNotNone(running_msg)
        self.assertIsInstance(running_msg['startEpochMs'], int)

        ok_msg = next(m for m in reporter.messages if m['status'] == 'ok')
        self.assertIsNotNone(ok_msg)
        self.assertIsInstance(ok_msg['startEpochMs'], int)
        self.assertIsInstance(ok_msg['endEpochMs'], int)

    def test_exceptions(self):
        reporter = MemoryReporter()
        tracethat = create_tracethat(reporter)

        @tracethat
        def hello():
            raise Exception('Oops')
        
        propagated_exception = None
        try:
            hello()
        except Exception as e:
            propagated_exception = e
            pass

        self.assertIsNotNone(propagated_exception)
        self.assertTrue('Oops' in str(propagated_exception))

        error_msg = next(m for m in reporter.messages if m['status'] == 'error')
        self.assertIsNotNone(error_msg)
        self.assertTrue('Oops' in error_msg['details']['exception'])

if __name__ == '__main__':
    unittest.main()