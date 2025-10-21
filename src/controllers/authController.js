// src/controllers/authController.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// ---------------- REGISTER ----------------
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // validasi input sederhana
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    // cek apakah email sudah digunakan
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user baru
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "Registrasi berhasil!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error saat register:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi!" });
    }

    // cek user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    const user = result.rows[0];

    // bandingkan password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Password salah!" });
    }

    // buat token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login berhasil!",
      token,
    });
  } catch (error) {
    console.error("Error saat login:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
