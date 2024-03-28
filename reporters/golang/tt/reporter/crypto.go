package reporter

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"io"
)

// Encrypt encrypts plaintext using AES-GCM with the supplied password.
func encrypt(plaintext string, password string) (string, error) {
    // Encode password as UTF-8
    pwUtf8 := []byte(password)
    // Hash the password
    pwHash := sha256.Sum256(pwUtf8)
    // Get 96-bit random iv
    iv := make([]byte, 12)
    if _, err := io.ReadFull(rand.Reader, iv); err != nil {
        return "", err
    }
    // Specify algorithm to use
    block, err := aes.NewCipher(pwHash[:])
    if err != nil {
        return "", err
    }
    // Create cipher instance
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    // Encrypt plaintext
    ciphertext := gcm.Seal(nil, iv, []byte(plaintext), nil)
    // Encode iv+ciphertext as base64
    encrypted := append(iv, ciphertext...)
    return base64.StdEncoding.EncodeToString(encrypted), nil
}
