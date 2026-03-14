const fs = require("fs");
const path = require("path");

const generateMatrix = (key) => {
  let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  let sanitizedKey = key
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

const playfairCore = (text, key, mode) => {
  const matrix = generateMatrix(key);
  let result = "";
  let shift = mode === "encrypt" ? 1 : 4;

  for (let i = 0; i < text.length; i += 2) {
    let a = text[i];
    let b = text[i + 1] || "X";
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

// Maps Hex (0-F) to 16 unique letters that NEVER include 'J'
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
    .map((char) => map[char])
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
    .map((char) => map[char])
    .join("");
};

exports.encrypt = (req, res) => {
  try {
    const { key } = req.body;
    const hexData = fs
      .readFileSync(req.file.path)
      .toString("hex")
      .toUpperCase();
    const alphaData = hexToAlpha(hexData);

    const encrypted = playfairCore(alphaData, key, "encrypt");
    const outPath = path.join("uploads", `enc_${req.file.originalname}.txt`);
    fs.writeFileSync(outPath, encrypted);

    res.download(outPath, () => {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    });
  } catch (err) {
    res.status(500).send("Enc Error");
  }
};

exports.decrypt = (req, res) => {
  try {
    const { key } = req.body;
    const encryptedText = fs
      .readFileSync(req.file.path, "utf8")
      .trim()
      .replace(/[^A-Z]/g, "");

    let decryptedAlpha = playfairCore(encryptedText, key, "decrypt");

    // Remove the 'X' padding if it was added to make the string even
    // but only if it's not part of the hex mapping
    if (decryptedAlpha.length % 2 !== 0 || decryptedAlpha.endsWith("X")) {
      // In this specific mapping, 'X' is not used, so we can safely trim it
      decryptedAlpha = decryptedAlpha.replace(/X/g, "");
    }

    const hexData = alphaToHex(decryptedAlpha);
    const fileBuffer = Buffer.from(hexData, "hex");

    const outPath = path.join(
      "uploads",
      `dec_${req.file.originalname.replace(".txt", "")}`,
    );
    fs.writeFileSync(outPath, fileBuffer);

    res.download(outPath, () => {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    });
  } catch (err) {
    res.status(500).send("Dec Error");
  }
};
