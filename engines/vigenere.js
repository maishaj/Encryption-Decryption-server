// backend/engines/vigenere.js

class VigenereEngine {
  /**
   * Instantiates the Vigenère engine with a key phrase.
   * Matches the router instantiation pattern: new VigenereEngine(secretKeyInput)
   * @param {string} key - The cryptographic key string.
   */
  constructor(key) {
    this.key = key ? key.toString() : "";
  }

  /**
   * Processes a standard plaintext or ciphertext string.
   * Handles character casing cleanly and ignores spaces/punctuation.
   * @param {string} text - The input payload text.
   * @param {boolean} isEncrypt - True for encryption, false for decryption.
   * @returns {string} The processed text string.
   */
  processText(text, isEncrypt) {
    if (!this.key || this.key.length === 0) return text;

    const direction = isEncrypt ? 1 : -1;
    let result = "";
    let keyIndex = 0;

    // Standard Vigenère shifts alphabet characters only (A-Z)
    const cleanKey = this.key.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanKey.length === 0) return text; // Safety fallback if key has no alpha chars

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const base = isUpperCase ? 65 : 97;

        const textVal = char.toUpperCase().charCodeAt(0) - 65;
        const keyVal = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;

        // Classical algebraic formula: (Text +/- Key) mod 26
        let shiftedVal = (textVal + direction * keyVal) % 26;
        if (shiftedVal < 0) shiftedVal += 26; // Adjust negative modulo behavior in JavaScript

        result += String.fromCharCode(shiftedVal + base);
        keyIndex++; // Only advance the key character position on processed alpha characters
      } else {
        result += char; // Let special symbols, metrics, and spacing pass straight through
      }
    }
    return result;
  }

  /**
   * Processes binary assets (images) using byte-level circular shifting.
   * Ensures the resulting encrypted payload can be transmitted as raw text.
   * @param {Buffer} buffer - The file buffer provided by multer.
   * @param {boolean} isEncrypt - True for encryption, false for decryption.
   * @returns {Buffer} The transformed file asset buffer.
   */
  processBuffer(buffer, isEncrypt) {
    if (!this.key || this.key.length === 0) return buffer;

    const direction = isEncrypt ? 1 : -1;
    const keyBuffer = Buffer.from(this.key, "utf-8");
    const outputBuffer = Buffer.alloc(buffer.length);

    for (let i = 0; i < buffer.length; i++) {
      const byteVal = buffer[i];
      const keyVal = keyBuffer[i % keyBuffer.length];

      // Byte-level modular space wrap (0 - 255) to secure arbitrary data structures
      let shiftedByte = (byteVal + direction * keyVal) % 256;
      if (shiftedByte < 0) shiftedByte += 256;

      outputBuffer[i] = shiftedByte;
    }
    return outputBuffer;
  }
}

module.exports = VigenereEngine;
