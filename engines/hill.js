// backend/engines/playfair.js
const fs = require("fs");
const path = require("path");

const generateMatrix = (key) => {
  let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  let sanitizedKey = (key || "")
    .toUpperCase()
    .replace(/J/g, "I")
    .replace(/[^A-Z]/g, "");
  let finalChars = Array.from(new Set(sanitizedKey + alphabet));
  let matrix = [];
  for (let i = 0; i < 5; i++) matrix.push(finalChars.slice(i * 5, i * 5 + 5));
  return matrix;
};

const findPos = (matrix, char) => {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (matrix[r][c] === char) return { r, c };
    }
  }
  return { r: 0, c: 0 };
};

const prepareText = (text, mode) => {
  let cleaned = (text || "")
    .toUpperCase()
    .replace(/J/g, "I")
    .replace(/[^A-Z]/g, "");

  if (mode === "decrypt") return cleaned;

  let prepared = "";
  let i = 0;
  while (i < cleaned.length) {
    let char1 = cleaned[i];
    let char2 = cleaned[i + 1];

    if (!char2) {
      prepared += char1 + "X";
      i += 1;
    } else if (char1 === char2) {
      prepared += char1 + "X";
      i += 1;
    } else {
      prepared += char1 + char2;
      i += 2;
    }
  }
  return prepared;
};

const playfairCore = (text, key, mode, isBinaryPipeline = false) => {
  const matrix = generateMatrix(key);
  let result = "";
  let shift = mode === "encrypt" ? 1 : 4;

  // If handling files/buffers, use text directly without injecting text padding rules
  const processedText = isBinaryPipeline ? text : prepareText(text, mode);

  for (let i = 0; i < processedText.length; i += 2) {
    let a = processedText[i];
    let b = processedText[i + 1] || "X";
    let p1 = findPos(matrix, a);
    let p2 = findPos(matrix, b);

    if (p1.r === p2.r) {
      result +=
        matrix[p1.r][(p1.c + shift) % 5] + matrix[p2.r][(p2.c + shift) % 5];
    } else if (p1.c === p2.c) {
      result +=
        matrix[(p1.r + shift) % 5][p1.c] + matrix[(p2.r + shift) % 5][p2.c];
    } else {
      result += matrix[p1.r][p2.c] + matrix[p2.r][p1.c];
    }
  }
  return result;
};

// --- Custom Mapping Utilities for Safe File Encapsulation ---
const hexToAlpha = (hex) => {
  const map = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "E",
    5: "F",
    6: "G",
    7: "H",
    8: "K",
    9: "L",
    A: "M",
    B: "N",
    C: "O",
    D: "P",
    E: "Q",
    F: "R",
  };
  return hex
    .split("")
    .map((char) => map[char] || "")
    .join("");
};

const alphaToHex = (alpha) => {
  const map = {
    A: "0",
    B: "1",
    C: "2",
    D: "3",
    E: "4",
    F: "5",
    G: "6",
    H: "7",
    K: "8",
    L: "9",
    M: "A",
    N: "B",
    O: "C",
    P: "D",
    Q: "E",
    R: "F",
  };
  return alpha
    .split("")
    .map((char) => map[char] || "")
    .join("");
};

class PlayfairCipher {
  constructor(key) {
    this.key = key;
  }

  // Handles normal messages/strings cleanly
  processText(text, isEncrypt) {
    return playfairCore(
      text,
      this.key,
      isEncrypt ? "encrypt" : "decrypt",
      false,
    );
  }

  // Handles file uploads, images, and documents safely via buffers
  processBuffer(buffer, isEncrypt) {
    if (isEncrypt) {
      // 1. Map raw file hex directly to your unique 16-character alphabet
      const hexData = buffer.toString("hex").toUpperCase();
      const alphaData = hexToAlpha(hexData);

      // 2. Interleave 'X' markers systematically to secure repeating pairs
      let interleavedData = "";
      for (let i = 0; i < alphaData.length; i++) {
        interleavedData += alphaData[i] + "X";
      }

      // 3. Encrypt the continuous protected string matrix stream
      const encrypted = playfairCore(
        interleavedData,
        this.key,
        "encrypt",
        true,
      );
      return Buffer.from(encrypted, "utf-8");
    } else {
      // 1. Read string token data and clear out non-alphabet fragments
      const encryptedText = buffer
        .toString("utf-8")
        .trim()
        .replace(/[^A-Z]/g, "");
      const decryptedAlpha = playfairCore(
        encryptedText,
        this.key,
        "decrypt",
        true,
      );

      // 2. Strip out our systematic interleaved 'X' padding markers safely
      let cleanAlpha = "";
      for (let i = 0; i < decryptedAlpha.length; i += 2) {
        cleanAlpha += decryptedAlpha[i];
      }

      // 3. Translate symbols back into binary hexadecimal array sequences
      const hexData = alphaToHex(cleanAlpha);
      return Buffer.from(hexData, "hex");
    }
  }
}

module.exports = PlayfairCipher;

// Hill Cipher

// backend/engines/hill.js

// Standard Greatest Common Divisor helper
const gcd = (a, b) => {
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
};

// Modular inverse finder using Extended Euclidean Algorithm
const modInverse = (a, m) => {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return 1;
};

// Computes the determinant of a 3x3 matrix
const getDeterminant3x3 = (matrix) => {
  return (
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
  );
};

// Computes the adjugate and modular inverse matrix for a 3x3 matrix
const invertMatrix3x3 = (matrix, mod) => {
  const det = ((getDeterminant3x3(matrix) % mod) + mod) % mod;
  const invDet = modInverse(det, mod);

  const inv = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  inv[0][0] =
    ((matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) * invDet) %
    mod;
  inv[0][1] =
    (-(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]) * invDet) %
    mod;
  inv[0][2] =
    ((matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invDet) %
    mod;

  inv[1][0] =
    (-(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) * invDet) %
    mod;
  inv[1][1] =
    ((matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invDet) %
    mod;
  inv[1][2] =
    (-(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]) * invDet) %
    mod;

  inv[2][0] =
    ((matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]) * invDet) %
    mod;
  inv[2][1] =
    (-(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0]) * invDet) %
    mod;
  inv[2][2] =
    ((matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) * invDet) %
    mod;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      inv[r][c] = (inv[r][c] + mod) % mod;
    }
  }
  return inv;
};

class HillCipher {
  constructor(keyString) {
    this.keyString = keyString || "KEY";
  }

  // Generates a verified invertible 3x3 matrix based on user key string
  getMatrix(mod) {
    let base = [
      [6, 24, 1],
      [13, 16, 10],
      [20, 17, 15],
    ];

    let shift = 0;
    for (let i = 0; i < this.keyString.length; i++) {
      shift += this.keyString.charCodeAt(i);
    }

    for (let attempt = 0; attempt < 256; attempt++) {
      let testMatrix = base.map((row) =>
        row.map((val) => (val + shift + attempt) % mod),
      );

      let det = getDeterminant3x3(testMatrix);
      det = ((det % mod) + mod) % mod;

      // CRITICAL FIX: Matrix is only modularly invertible if gcd(det, modulus) === 1
      if (det !== 0 && gcd(det, mod) === 1) {
        return testMatrix;
      }
    }
    return base;
  }

  // Text Processing (Modulo 26)
  processText(text, isEncrypt) {
    const mod = 26;
    let matrix = this.getMatrix(mod);
    if (!isEncrypt) matrix = invertMatrix3x3(matrix, mod);

    let cleaned = text.toUpperCase().replace(/[^A-Z]/g, "");

    while (cleaned.length % 3 !== 0) {
      cleaned += "X";
    }

    let result = "";
    for (let i = 0; i < cleaned.length; i += 3) {
      const vec = [
        cleaned.charCodeAt(i) - 65,
        cleaned.charCodeAt(i + 1) - 65,
        cleaned.charCodeAt(i + 2) - 65,
      ];

      for (let r = 0; r < 3; r++) {
        let sum = 0;
        for (let c = 0; c < 3; c++) {
          sum += matrix[r][c] * vec[c];
        }
        result += String.fromCharCode((sum % mod) + 65);
      }
    }
    return result;
  }

  // File Buffer Handling (Modulo 256)
  processBuffer(buffer, isEncrypt) {
    const mod = 256;
    let matrix = this.getMatrix(mod);
    if (!isEncrypt) matrix = invertMatrix3x3(matrix, mod);

    const dataLength = buffer.length;
    const paddingSize = dataLength % 3 === 0 ? 0 : 3 - (dataLength % 3);

    let processedBuffer;
    if (isEncrypt) {
      processedBuffer = Buffer.alloc(dataLength + paddingSize);
      buffer.copy(processedBuffer);
    } else {
      processedBuffer = Buffer.from(buffer);
    }

    const targetLength = processedBuffer.length;
    const outBuffer = Buffer.alloc(targetLength);

    for (let i = 0; i < targetLength; i += 3) {
      const vec = [
        processedBuffer[i],
        processedBuffer[i + 1],
        processedBuffer[i + 2],
      ];

      for (let r = 0; r < 3; r++) {
        let sum = 0;
        for (let c = 0; c < 3; c++) {
          sum += matrix[r][c] * vec[c];
        }
        outBuffer[i + r] = ((sum % mod) + mod) % mod;
      }
    }

    return outBuffer;
  }
}

module.exports = HillCipher;