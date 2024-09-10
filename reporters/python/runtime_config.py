import os 

class Config:
    server_url: str
    token: str | None
    enabled: bool

    def __init__(self):
        self.server_url = os.getenv('TT_SERVER_URL') or 'ws://localhost:3000'
        self.token = os.getenv('TT_TOKEN') or None
        self.enabled = os.getenv('TT_DISABLE') != 'true'

config = Config()

def load() -> Config:
    return config

def registerToken(token: str) -> None:
    config.token = token

def setServerUrl(url: str) -> None:
    config.server_url = url

def disable() -> None:
    config.enabled = False