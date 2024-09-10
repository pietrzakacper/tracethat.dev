from typing import Callable, TypeVar, Type, ParamSpec

import time
import uuid
import inspect
from ws_reporter import WebSocketReporter

class Reporter:
    def send(self, msg: str) -> None:
        pass

T = TypeVar('T')
R = TypeVar('R')
P = ParamSpec('P')

def create_trace_that(reporter: Type[Reporter]):
    def trace_that(func: Callable[P, R]) -> Callable[P, R]:
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            name = func.__name__ if hasattr(func, '__name__') else '(anonymous)'
            start_time = int(time.time() * 1000)
            call_id = uuid.uuid4().hex
            call_stack = [f'{f.function} {f.filename}:{f.lineno}' for f in inspect.stack()][1:]
            
            reporter.send({
                'status': 'running',
                'callId': call_id,
                'name': name,
                'startEpochMs': start_time,
                'details': {
                    'args': args,
                    'kwargs': kwargs,
                    'callStack': call_stack,
                }
            })

            return_value = func(*args, **kwargs)
            end_time = int(time.time() * 1000)

            reporter.send({
                'status': 'ok',
                'callId': call_id,
                'name': name,
                'startEpochMs': start_time,
                'endEpochMs': end_time,
                'details': {
                    'return': return_value,
                }
            })
            return return_value
        return wrapper
    
    return trace_that


trace_that = create_trace_that(WebSocketReporter())