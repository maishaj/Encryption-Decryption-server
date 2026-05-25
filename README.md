# CryptoSphere: Web-Based Encryption & Decryption Tool

A full-stack, secure web application designed to demonstrate the implementation and practical execution of classical and modern cryptographic algorithms. The platform supports safe, real-time file encapsulation (including text, images, and documents) using both symmetric and asymmetric cryptosystems.

## 🔗 Repository Links
* **Frontend Client:** [Encryption-Decryption-client](https://github.com/maishaj/Encryption-Decryption-client)
* **Backend Server:** [Encryption-Decryption-server](https://github.com/maishaj/Encryption-Decryption-server)

---

## 👥 Core Development Team & Contributions

This project was engineered as a collaborative effort. Below are the core cryptographic module distributions and their respective engineers:

| Module | Contributor | Registration No. | GitHub Profile |
| :--- | :--- | :--- | :--- |
| **RSA Cipher** | Kazi Maisha Jannath | 2021331502 | [@maishaj](https://github.com/maishaj) |
| **Caesar Cipher** | Kazi Nisah Maryam | 2021331533 | — |
| **Playfair Cipher** | Samina Meherin Toma | 2021331563 | [@Mehrin555](https://github.com/Mehrin555) |
| **Hill Cipher** | Shajeda Sultana | 2021331559 | [@SSLiza](https://github.com/SSLiza) |
| **Vigenère Cipher** | Ananya Prova Debnath | 2021331519 | [@aprova303](https://github.com/aprova303) |

---

## 🛠️ Cryptographic Engines

### 1. Caesar Cipher
* **Implementation:** A monoalphabetic substitution cipher mapped across alphabet values.
* **Key Constraint:** Operates under a strict deterministic constraint where the key value $K = 3$. Any deviations are safely rejected by the constructor guardrails.
* **Capability:** Processes standalone text strings as well as byte-level image transformations using continuous mathematical 8-bit stream shifting.

### 2. Playfair Cipher
* **Implementation:** A polyalphabetic substitution cipher utilizing a dynamic $5 \times 5$ matrix generated from a variable passphrase.
* **Text Pipeline:** Systematically drops invalid characters, normalizes `J -> I`, and handles repeating digraphs through deterministic `X` padding.
* **Binary Pipeline:** Leverages a unique custom 16-character alphabetic transposition matrix to process incoming raw hex arrays of binary files, safely mapping them back without structure bloating.

### 3. Hill Cipher
* **Implementation:** A polygraphic substitution cipher utilizing linear algebra matrices ($2 \times 2$ or $3 \times 3$) for advanced character group block transpositions.
* **Mathematics:** Requires modular matrix inversion arithmetic modulo 26 for decryption pipelines.

### 4. Vigenère Cipher
* **Implementation:** A polyalphabetic substitution cipher leveraging a keyword to cycle through shifting intervals via a algebraic Vigenère square matrix representation.

### 5. RSA Cipher
* **Implementation:** A modern asymmetric public-key cryptosystem leveraging the computational hardness of large prime factorization.
* **Capability:** Securely generates paired key components ($e, d, n$), handling mathematical modular exponentiation safely across variable workloads.

---

## 🧰 Tech Stack

### Frontend (Client)
* **Framework:** React via Vite (for rapid hot-reloading and highly optimized production builds)
* **Styling:** Tailwind CSS (featuring a clean, responsive UI layout)
* **State Management & Requests:** Axios for unified asynchronous HTTP backend streaming, coupled with `react-hot-toast` for smooth error and success flash updates.

### Backend (Server)
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Middleware Extensions:** `cors` for API route access handling, and `multer` utilizing memory buffering (`multer.memoryStorage()`) to receive file arrays without storing lingering files on serverless disk boundaries.

---

## 🚀 Installation & Local Setup

To run this project locally, clone both repositories and run the following startup sequences:

### 1. Backend Server Setup
```bash
git clone [https://github.com/maishaj/Encryption-Decryption-server.git](https://github.com/maishaj/Encryption-Decryption-server.git)
cd Encryption-Decryption-server
npm install
npm start