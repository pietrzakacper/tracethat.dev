package controller

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"errors"
)

// Decrypt decrypts ciphertext using AES-GCM with the supplied password.
func decrypt(encryptedString string, password string) (string, error) {
	// Decode the base64 encrypted string
	encrypted, err := base64.StdEncoding.DecodeString(encryptedString)
	if err != nil {
		return "", err
	}

	// Check if the encrypted data is long enough to contain the IV
	if len(encrypted) < 12 {
		return "", errors.New("ciphertext too short")
	}

	// Extract the IV from the first 12 bytes
	iv := encrypted[:12]
	ciphertext := encrypted[12:]

	// Hash the password
	pwUtf8 := []byte(password)
	pwHash := sha256.Sum256(pwUtf8)

	// Create the AES cipher
	block, err := aes.NewCipher(pwHash[:])
	if err != nil {
		return "", err
	}

	// Create the GCM instance
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Decrypt the ciphertext
	plaintext, err := gcm.Open(nil, iv, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
