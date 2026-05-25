const parseKeyComponent = (keyStr) => {
  if (!keyStr) return null;
  try {
    // If user inputs keys formatted cleanly as JSON strings
    if (keyStr.trim().startsWith("{")) {
      const parsed = JSON.parse(keyStr);
      const firstKey = Object.keys(parsed)[0];
      const secondKey = Object.keys(parsed)[1];
      return {
        exp: BigInt(parsed[firstKey]),
        mod: BigInt(parsed[secondKey]),
      };
    }
    // Fallback parsing for simple comma-separated key strings: "65537, 281023841"
    const parts = keyStr.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      return { exp: BigInt(parts[0]), mod: BigInt(parts[1]) };
    }
  } catch (e) {
    console.error("Failed to safely parse RSA key parameters:", e);
  }
  throw new Error(
    "Invalid RSA component formatting. Use 'exponent, modulus' layout structure.",
  );
};

// Standard modular exponentiation helper utilizing BigInt computation logic: (base^exp) % mod
const expMod = (base, exp, mod) => {
  let res = BigInt(1);
  base = BigInt(base) % mod;
  while (exp > BigInt(0)) {
    if (exp % BigInt(2) === BigInt(1)) res = (res * base) % mod;
    base = (base * base) % mod;
    exp = exp / BigInt(2);
  }
  return res;
};

class RsaCipher {
  constructor(publicKeyStr, privateKeyStr) {
    this.publicKey = publicKeyStr ? parseKeyComponent(publicKeyStr) : null;
    this.privateKey = privateKeyStr ? parseKeyComponent(privateKeyStr) : null;
  }

  /**
   * Transforms strings safely using math block streams
   */
  processText(text, isEncrypt) {
    if (isEncrypt) {
      if (!this.publicKey) throw new Error("Public key component missing.");
      const { exp, mod } = this.publicKey;

      // Convert standard text characters into UTF-8 numerical arrays
      const bytes = Buffer.from(text, "utf-8");
      const encryptedValues = [];

      // Compute math structures byte-by-byte for baseline safety against modulus size bounds
      for (let i = 0; i < bytes.length; i++) {
        const cipherValue = expMod(BigInt(bytes[i]), exp, mod);
        encryptedValues.push(cipherValue.toString());
      }
      // Return space-delimited cipher strings for streamlined UI parsing
      return encryptedValues.join(" ");
    } else {
      if (!this.privateKey) throw new Error("Private key component missing.");
      const { exp, mod } = this.privateKey;

      const cleanText = text
        .replace(/^\ufeff/, "") // Removes hidden UTF-8 BOM characters if present
        .replace(/\s+/g, " ") // Standardizes all spaces/newlines to a single space
        .trim(); // Trims trailing edge white-spaces

      const tokens = cleanText.split(" ");
      const decryptedBytes = Buffer.alloc(tokens.length);

      for (let i = 0; i < tokens.length; i++) {
        if (!tokens[i]) continue;
        const plainValue = expMod(BigInt(tokens[i]), exp, mod);
        decryptedBytes[i] = Number(plainValue);
      }
      return decryptedBytes.toString("utf-8");
    }
  }

  /**
   * Processes image blobs cleanly into transportable text maps and reconstructs binary arrays
   */
  processBuffer(buffer, isEncrypt) {
    if (isEncrypt) {
      if (!this.publicKey) throw new Error("Public key component missing.");
      const { exp, mod } = this.publicKey;

      const cipherValues = [];
      for (let i = 0; i < buffer.length; i++) {
        const cipherValue = expMod(BigInt(buffer[i]), exp, mod);
        cipherValues.push(cipherValue.toString());
      }
      // Stream raw cipher text back into the system workspace, comma-separated
      const outputString = cipherValues.join(",");
      return Buffer.from(outputString, "utf-8");
    } else {
      if (!this.privateKey) throw new Error("Private key component missing.");
      const { exp, mod } = this.privateKey;

      // FIX 1: Convert the incoming file buffer to a string first so we can parse it
      const rawText = buffer.toString("utf-8");

      // FIX 2: Clean up hidden characters and split explicitly by COMMA to match encryption
      const cleanText = rawText.replace(/^\ufeff/, "").trim();
      const tokens = cleanText.split(",");

      const plainBuffer = Buffer.alloc(tokens.length);

      for (let i = 0; i < tokens.length; i++) {
        if (!tokens[i].trim()) continue;

        // Compute math structures safely using BigInt computation logic
        const plainValue = expMod(BigInt(tokens[i].trim()), exp, mod);
        plainBuffer[i] = Number(plainValue);
      }

      // FIX 3: Return the raw binary array block back to the route handler
      return plainBuffer;
    }
  }
}

module.exports = RsaCipher;
