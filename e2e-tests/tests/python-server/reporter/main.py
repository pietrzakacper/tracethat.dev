import time
import sys
from trace_that import trace_that

@trace_that
def hello(name: str, greeting='Hello') -> str:
    time.sleep(1)
    return f'{greeting} {name}'

def main():
    hello(sys.argv[1])

if __name__ == '__main__':
    main()