import os 

class Config:
    server_url: str
    token: str | None

    def __init__(self):
        self.server_url = os.getenv('TT_SERVER_URL') or 'ws://localhost:3000'
        self.token = os.getenv('TT_TOKEN') or None

config = Config()

def load() -> Config:
    return config
