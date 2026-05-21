// backend/routes/cryptoRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const PlayfairCipher = require("../engines/playfair");
const HillCipher = require("../engines/hill");
const VigenereEngine = require("../engines/vigenere");

// Hold files cleanly in memory buffers
const upload = multer({ storage: multer.memoryStorage() });

router.post("/:algorithm/:action", upload.single("file"), async (req, res) => {
  try {
    const { algorithm, action } = req.params;

    // Extract properties safely from req.body
    const inputType = req.body.inputType || "text";
    const key = req.body.key || "";
    const text = req.body.text || "";

    // 1. Path Safety Validations
    if (action !== "encrypt" && action !== "decrypt") {
      return res
        .status(400)
        .json({ error: "Invalid action parameters. Use encrypt or decrypt." });
    }

    const algoLower = algorithm.toLowerCase();

    // 2. Playfair Core Route Execution
    if (algoLower === "playfair") {
      if (!key.trim()) {
        return res
          .status(400)
          .json({ error: "Symmetric Secret Key String is required." });
      }

      const cipher = new PlayfairCipher(key.toString());

      if (inputType === "text") {
        if (!text.trim()) {
          return res
            .status(400)
            .json({ error: "Input payload text string is empty." });
        }
        const result = cipher.processText(
          text.toString(),
          action === "encrypt",
        );
        return res.json({ result });
      }

      if (inputType === "image") {
        if (!req.file) {
          return res.status(400).json({
            error: "Multi-part binary asset file not found in request.",
          });
        }
        const isEncrypt = action === "encrypt";
        const processedBuffer = cipher.processBuffer(
          req.file.buffer,
          isEncrypt,
        );
        res.setHeader("Content-Type", isEncrypt ? "text/plain" : "image/png");
        return res.send(processedBuffer);
      }
    }

    // 3. RSA Asymmetric Keypair Execution Route
    if (algoLower === "rsa") {
      const publicKeyInput = req.body.publicKey || "";
      const privateKeyInput = req.body.privateKey || "";
      const isEncrypt = action === "encrypt";

      if (isEncrypt && !publicKeyInput.trim()) {
        return res.status(400).json({
          error:
            "A valid Public Key Component (e, n) is required for RSA Encryption.",
        });
      }
      if (!isEncrypt && !privateKeyInput.trim()) {
        return res.status(400).json({
          error:
            "A valid Private Key Component (d, n) is required for RSA Decryption.",
        });
      }

      // Instantiate the cryptographic engine
      const RsaEngine = require("../engines/rsa");
      const cipher = new RsaEngine(publicKeyInput, privateKeyInput);

      // Text Processing Block
      if (inputType === "text") {
        if (!text.trim()) {
          return res
            .status(400)
            .json({ error: "Input payload text string is empty." });
        }
        const result = cipher.processText(text.toString(), isEncrypt);
        return res.json({ result });
      }

      // Image / Binary Buffer Processing Block
      if (inputType === "image") {
        if (!req.file) {
          return res.status(400).json({
            error: "Multi-part binary asset file not found in request.",
          });
        }
        const processedBuffer = cipher.processBuffer(
          req.file.buffer,
          isEncrypt,
        );
        res.setHeader("Content-Type", isEncrypt ? "text/plain" : "image/png");
        return res.send(processedBuffer);
      }
    }

    // 4. Hill Core Route Execution
    if (algoLower === "hill") {
      if (!key.trim()) {
        return res
          .status(400)
          .json({ error: "Hill Matrix Secret Key String is required." });
      }

      // Instantiate the engine with the sanitized key string
      const cipher = new HillCipher(key.toString());

      // Text Processing Module
      if (inputType === "text") {
        if (!text.trim()) {
          return res
            .status(400)
            .json({ error: "Input payload text string is empty." });
        }
        const result = cipher.processText(
          text.toString(),
          action === "encrypt",
        );
        return res.json({ result });
      }

      // File Buffer Processing Module
      if (inputType === "image") {
        if (!req.file) {
          return res.status(400).json({
            error: "Multi-part binary asset file not found in request.",
          });
        }
        const isEncrypt = action === "encrypt";
        const processedBuffer = cipher.processBuffer(
          req.file.buffer,
          isEncrypt,
        );
        res.setHeader("Content-Type", isEncrypt ? "text/plain" : "image/png");
        return res.send(processedBuffer);
      }
    }

    // 5. Vigenere Cipher Execution Route
    if (algoLower === "vigenere") {
      // Fallback to global 'key' if 'vigenereKey' is not explicitly provided by the frontend
      const secretKeyInput = req.body.vigenereKey || key || "";
      const isEncrypt = action === "encrypt";

      if (!secretKeyInput.trim()) {
        return res.status(400).json({
          error:
            "A valid alphabetic Key string is required for Vigenere execution.",
        });
      }

      // Instantiate the Vigenere engine
      const VigenereEngine = require("../engines/vigenere");
      const cipher = new VigenereEngine(secretKeyInput);

      // Text Processing Block
      if (inputType === "text") {
        // FIXED: Uses .trim() to catch empty or whitespace-only inputs correctly
        if (!text.trim()) {
          return res.status(400).json({
            error: "Input payload text string is empty.",
          });
        }
        const result = cipher.processText(text.toString(), isEncrypt);
        return res.json({ result });
      }

      // Image / Binary Buffer Processing Block
      if (inputType === "image") {
        if (!req.file) {
          return res.status(400).json({
            error: "Multi-part binary asset file not found in request.",
          });
        }
        const processedBuffer = cipher.processBuffer(
          req.file.buffer,
          isEncrypt,
        );

        // Dynamic header setup to support raw text output for encrypted byte buffers
        res.setHeader("Content-Type", isEncrypt ? "text/plain" : "image/png");
        return res.send(processedBuffer);
      }
    }

    // 6. Caesar Cipher Execution Route
    if (algoLower === "caesar") {
      const CaesarEngine = require("../engines/caesar");
      let cipher;

      // Intercept initialization validation errors safely
      try {
        cipher = new CaesarEngine(key);
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }

      const isEncrypt = action === "encrypt";

      if (inputType === "text") {
        if (!text.trim()) {
          return res
            .status(400)
            .json({ error: "Input payload text string is empty." });
        }
        const result = cipher.processText(text.toString(), isEncrypt);
        return res.json({ result });
      }

      if (inputType === "image") {
        if (!req.file) {
          return res.status(400).json({
            error: "Multi-part binary asset file not found in request.",
          });
        }
        const processedBuffer = cipher.processBuffer(
          req.file.buffer,
          isEncrypt,
        );
        res.setHeader("Content-Type", isEncrypt ? "text/plain" : "image/png");
        return res.send(processedBuffer);
      }
    }

    return res
      .status(404)
      .json({ error: "Cryptosystem schema type unrecognized." });
  } catch (error) {
    console.error("🔥 CRITICAL BACKEND PIPELINE CRASH:", error);
    return res
      .status(500)
      .json({ error: `Internal System Error: ${error.message}` });
  }
});

module.exports = router;
