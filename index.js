// // backend/index.js
// const express = require("express");
// const cors = require("cors");
// const cryptoRoutes = require("./routes/cryptoRoutes");

// const app = express();
// const PORT = 3000; 

// // Enable cross-origin resource sharing for frontend port access
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Map routers
// app.use("/api", cryptoRoutes);

// app.listen(PORT, () => {
//   console.log(`Crypto API backend core spinning live at http://localhost:${PORT}`);
// });

// backend/index.js
const express = require("express");
const cors = require("cors");
const cryptoRoutes = require("./routes/cryptoRoutes");

const app = express();

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Map routers
app.use("/api", cryptoRoutes);


if (process.env.NODE_ENV !== "production") {
  const PORT = 3000; 
  app.listen(PORT, () => {
    console.log(`Crypto API backend core spinning live at http://localhost:${PORT}`);
  });
}

module.exports = app;