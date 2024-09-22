import unittest
from tracethat.json_marhsaller import marshall_to_json
import json

class TestJsonMarshaller(unittest.TestCase):
    def test_circular_ref(self):
        class A:
            def __init__(self, name: str, other: 'A' = None):
                self.name = name
                self.other = other
        
        a = A('John')
        a.other = a
        
        result = marshall_to_json(a)
        
        parsed_result = json.loads(result)
        
        self.assertEqual(parsed_result["name"], "John")
        self.assertEqual(parsed_result["other"], "<circular reference>")    
            
if __name__ == '__main__':
    unittest.main()