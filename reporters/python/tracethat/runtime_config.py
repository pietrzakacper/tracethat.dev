import os 
from typing import Optional

class Config:
    server_url: str
    token: Optional[str]
    enabled: bool

    def __init__(self):
        self.server_url = os.getenv('TT_SERVER_URL') or 'wss://tracethat.dev'
        self.token = os.getenv('TT_TOKEN') or None
        self.enabled = os.getenv('TT_DISABLE') != 'true'

config = Config()

def load() -> Config:
    return config

def register_token(token: str) -> None:
    config.token = token

def set_server_url(url: str) -> None:
    config.server_url = url

def disable() -> None:
    config.enabled = False