// backend/engines/caesar.js
const fs = require("fs");
const path = require("path");

class CaesarCipher {
  constructor(key) {
    // Force the key constraint strictly to 3
    const parsedKey = parseInt(key, 10);
    if (parsedKey !== 3) {
      throw new Error("Invalid key: The Caesar engine strictly requires a key value of 3.");
    }
    this.key = 3;
  }

  // --- Core Character Math Rules ---
  _shiftChar(char, shift) {
    const code = char.charCodeAt(0);
    
    // Uppercase letters (A-Z)
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
    }
    // Lowercase letters (a-z)
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
    }
    // Pass non-alphabet characters through unaltered (spaces, punctuation, etc.)
    return char;
  }

  // --- Text Pipeline Engine ---
  processText(text, isEncrypt) {
    if (!text) return "";
    // If decrypting, shift left by 3 (or right by 23)
    const activeShift = isEncrypt ? this.key : -this.key;
    
    return text
      .split("")
      .map((char) => this._shiftChar(char, activeShift))
      .join("");
  }

  // --- Binary Pipeline Engine (Handles Images and Files Safely) ---
  processBuffer(buffer, isEncrypt) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Input must be a valid Node.js Buffer object.");
    }

    // Allocate a new clean buffer of identical length for memory efficiency
    const resultBuffer = Buffer.alloc(buffer.length);
    const activeShift = isEncrypt ? this.key : -this.key;

    for (let i = 0; i < buffer.length; i++) {
      // Pull raw byte values directly (0 to 255 range)
      const rawByte = buffer[i];
      
      // Perform byte-level shifting, handling circular wrap-around boundaries
      let shiftedByte = (rawByte + activeShift) % 256;
      if (shiftedByte < 0) shiftedByte += 256;

      resultBuffer[i] = shiftedByte;
    }

    return resultBuffer;
  }
}

module.exports = CaesarCipher;