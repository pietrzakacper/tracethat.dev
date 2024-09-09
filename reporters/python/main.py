import asyncio
from typing import Callable, TypeVar, Type, ParamSpec
from aiohttp import ClientSession

import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import json
import time
from hashlib import sha256
import uuid
import threading
import queue
import inspect

def encrypt(plaintext, password):
    # Encode password as bytes
    pw_bytes = password.encode('utf-8')
    
    # Hash the password using SHA-256
    pw_hash = sha256(pw_bytes).digest()
    
    # Generate a random 12-byte IV
    iv = os.urandom(12)
    
    # Create the AES-GCM cipher
    cipher = Cipher(algorithms.AES(pw_hash), modes.GCM(iv))
    encryptor = cipher.encryptor()
    
    # Encrypt the plaintext
    ciphertext = encryptor.update(plaintext.encode('utf-8')) + encryptor.finalize()
    
    # Concatenate the IV and ciphertext, then encode as base64
    encrypted = base64.b64encode(iv + ciphertext + encryptor.tag).decode('utf-8')
    
    return encrypted

TT_SERVER_URL = os.getenv('TT_SERVER_URL') or 'ws://localhost:3000'
TT_TOKEN =  os.getenv('TT_TOKEN') or '123'

class WebSocketReporter:
    def __init__(self):
        self.queue = queue.Queue()
        self.connected = False

    def connect(self):
        if self.connected:
            return
        self.connected = True

        room_id = sha256(TT_TOKEN.encode('utf-8')).hexdigest()

        async def run():
            session = ClientSession()
            async with session.ws_connect(f'{TT_SERVER_URL}/api/report?roomId={room_id}') as ws:
                while True:
                    msg = self.queue.get()
                    encrypted_msg = encrypt(json.dumps(msg), TT_TOKEN)
                    await ws.send_str(encrypted_msg)

        threading.Thread(target=lambda: asyncio.run(run()), daemon=False).start()
        
    def send(self, msg: str):
        self.connect()
        self.queue.put(msg)
    

class Reporter:
    def send(self, msg: str) -> None:
        pass

T = TypeVar('T')
R = TypeVar('R')
P = ParamSpec('P')

def created_trace_that(reporter: Type[Reporter]):
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
            return 
        return wrapper
    
    return trace_that


trace_that = created_trace_that(WebSocketReporter())

def hello(name: str, greeting='Hello') -> str:
    time.sleep(1)
    return f'{greeting}, {name}!'

async def main():
    fn = trace_that(hello)
    fn(name='Kacper', greeting='Hi')
if __name__ == '__main__':
    asyncio.run(main())