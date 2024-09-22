from hashlib import sha256
from aiohttp import ClientSession
import threading
import queue
from tracethat.crypto import encrypt
import asyncio
import tracethat.runtime_config as runtime_config
from tracethat.json_marhsaller import marshall_to_json

class WebSocketReporter:
    def __init__(self):
        self.queue = queue.Queue()
        self.connected = False
        self.lock = threading.Lock()

    def connect(self):
        with self.lock:
            if self.connected:
                return

            token = runtime_config.load().token

            if not token:
                print('[tracethat] No token provided, skipping connection')
                return

            self.connected = True

        room_id = sha256(token.encode('utf-8')).hexdigest()

        async def run():
            session = ClientSession()
            async with session.ws_connect(f'{runtime_config.load().server_url}/api/report?roomId={room_id}') as ws:
                while True:
                    try:
                        msg = self.queue.get(timeout=1)
                        encrypted_msg = encrypt(marshall_to_json(msg), token)
                        await ws.send_str(encrypted_msg)
                    except queue.Empty:
                        break
                    except Exception as e:
                        print(f'[tracethat] Error while sending message: {e}')
                        break
            await session.close()
            with self.lock:
                self.connected = False

        threading.Thread(target=lambda: asyncio.run(run()), daemon=False).start()
        
    def send(self, msg: str):
        self.connect()
        self.queue.put(msg)
    