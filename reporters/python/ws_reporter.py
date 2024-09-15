from hashlib import sha256
from aiohttp import ClientSession
import json
import threading
import queue
from crypto import encrypt
import asyncio
import runtime_config

class WebSocketReporter:
    def __init__(self):
        self.queue = queue.Queue()
        self.connected = False

    def connect(self):
        if self.connected:
            return

        token = runtime_config.load().token

        if not token:
            print('[trace_that] No token provided, skipping connection')
            return

        self.connected = True

        room_id = sha256(token.encode('utf-8')).hexdigest()

        async def run():
            session = ClientSession()
            async with session.ws_connect(f'{runtime_config.load().server_url}/api/report?roomId={room_id}') as ws:
                while True:
                    try:
                        msg = self.queue.get(timeout=1)
                        encrypted_msg = encrypt(json.dumps(msg), token)
                        await ws.send_str(encrypted_msg)
                    except queue.Empty:
                        self.connected = False
                        break

        threading.Thread(target=lambda: asyncio.run(run()), daemon=False).start()
        
    def send(self, msg: str):
        self.connect()
        self.queue.put(msg)
    