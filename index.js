const express = require('express')
const cors=require('cors')
const multer = require('multer'); // For file handling
const crypto = require('crypto'); // Built-in Node crypto
const fs = require('fs');         // To handle file streams
require('dotenv').config() 
const app = express()
const port = process.env.PORT || 3000;


// Playfair Cipher
const playfairRoutes = require('./routes/playfairRoutes');


//Middleware
app.use(cors());
app.use(express.json());

// Playfair Cipher
app.use('/api/playfair', playfairRoutes);


// Configure Multer for file uploads (storing in 'uploads' folder)
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Encryption-Decryption is listening on port ${port}`)
})
