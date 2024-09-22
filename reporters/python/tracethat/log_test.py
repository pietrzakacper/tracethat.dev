from tracethat.tracethat_impl import create_log
import unittest

class MemoryReporter:
    def __init__(self):
        self.messages = []

    def send(self, msg: str) -> None:
        self.messages.append(msg)

class TestLog(unittest.TestCase):
    def test_log(self):
        reporter = MemoryReporter()
        log = create_log(reporter)
        log('hello', {'a': 1})
        
        ok_msg = next(m for m in reporter.messages if m['status'] == 'ok')
        self.assertIsNotNone(ok_msg)
        self.assertEqual(ok_msg['name'], 'hello')
        self.assertEqual(ok_msg['details'], {'payload': {'a': 1}})
        
if __name__ == '__main__':    
    unittest.main()