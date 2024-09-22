import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from hashlib import sha256
import os

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