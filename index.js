import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();

// agar bisa membaca data JSON dari body request
app.use(express.json());

// keamanan: hanya izinkan akses dari domain tertentu
app.use(
  cors({
    origin: ["http://localhost:3000"], // ubah sesuai domain frontend kamu
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// tambahkan HTTP security headers
app.use(helmet());

// routing utama
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server berjalan dengan aman ✅");
});

// jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
