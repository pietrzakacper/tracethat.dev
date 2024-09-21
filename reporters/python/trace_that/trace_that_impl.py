from typing import Callable, TypeVar, Type, Any
from typing_extensions import ParamSpec
import time
import uuid
import inspect
from trace_that.ws_reporter import WebSocketReporter

T = TypeVar('T')
R = TypeVar('R')
P = ParamSpec('P')

class TraceThat:
    def __init__(self, trace_that_fn: Callable[[Callable[P, R]], Callable[P,R]], log: Callable[[str, Any], None]):
        self.trace_that_fn = trace_that_fn
        self.log = log

    def __call__(self, func: Callable[P, R]) -> Callable[P, R]:
        return self.trace_that_fn(func)

class Reporter:
    def send(self, msg: str) -> None:
        pass

def create_trace_that(reporter: Type[Reporter]):
    def trace_that(func: Callable[P, R]) -> Callable[P, R]:
        def before(*args: P.args, **kwargs: P.kwargs) -> None:
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
            
            return name, start_time, call_id
        
        def on_error(name: str, start_time: int, call_id: str, e: Exception) -> None:
            reporter.send({
                'status': 'error',
                'callId': call_id,
                'name': name,
                'startEpochMs': start_time,
                'endEpochMs': int(time.time() * 1000),
                'details': {
                    'exception': str(e),
                }
            })
            # sleep to wait for reporter to flush the error, before possible crash
            time.sleep(0.1)
        
        def after(name: str, start_time: int, call_id: str, return_value: R) -> None:
            reporter.send({
                'status': 'ok',
                'callId': call_id,
                'name': name,
                'startEpochMs': start_time,
                'endEpochMs': int(time.time() * 1000),
                'details': {
                    'return': return_value,
                }
            })
            
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            name, start_time, call_id = before(*args, **kwargs)

            try:
                return_value = func(*args, **kwargs)
                        
            except Exception as e:
                on_error(name, start_time, call_id, e)
                raise e

            if inspect.isawaitable(return_value):
                async def awaiter():
                    awaited_return_value = await return_value
                    after(name, start_time, call_id, awaited_return_value)
                    return awaited_return_value
                return awaiter()
            
            after(name, start_time, call_id, return_value)
            
            return return_value

        return wrapper
    
    return trace_that

def create_log(reporter: Type[Reporter]):
    def log(name: str, msg: any) -> None:
        call_id = uuid.uuid4().hex
        start_time = int(time.time() * 1000)
        reporter.send({
            'status': 'ok',
            'callId': call_id,
            'name': name,
            'startEpochMs': start_time,
            'endEpochMs': start_time,
            'details': msg
        })
        
    return log

reporter = WebSocketReporter()
log = create_log(reporter)
trace_that_fun = create_trace_that(reporter)

trace_that = TraceThat(trace_that_fun, log)
