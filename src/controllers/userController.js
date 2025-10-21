// src/controllers/userController.js
import pool from "../config/db.js";
import { uploadToCloudinary } from "../middleware/upload.js";
import bcrypt from "bcryptjs";
import validator from "validator";

// ---------------- GET ALL USERS ----------------
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, avatar_url, updated_at FROM users"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error saat mengambil user:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// ---------------- UPDATE USER (hanya bisa update profil sendiri) ----------------
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // id dari URL
    const userIdFromToken = req.user.id; // id dari token JWT

    // hanya boleh update profil sendiri
    if (parseInt(id) !== parseInt(userIdFromToken)) {
      return res
        .status(403)
        .json({ message: "Kamu tidak bisa mengedit profil orang lain!" });
    }

    const { username, email, password } = req.body;

    // validasi input
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: "Format email tidak valid!" });
    }
    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password minimal harus 6 karakter!" });
    }

    // hash password baru kalau diisi
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // ambil data lama user
    const oldUser = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    if (oldUser.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    // update data
    const updatedUser = await pool.query(
      `UPDATE users 
       SET username=$1, 
           email=$2, 
           password=COALESCE($3, password), 
           updated_at=NOW() 
       WHERE id=$4 
       RETURNING id, username, email, role, avatar_url, updated_at`,
      [
        username || oldUser.rows[0].username,
        email || oldUser.rows[0].email,
        hashedPassword,
        id,
      ]
    );

    res.json({
      message: "Profil berhasil diupdate!",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Error saat update user:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// ---------------- DELETE USER ----------------
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userIdFromToken = req.user.id;

    // hanya boleh hapus akun sendiri (opsional)
    if (parseInt(id) !== parseInt(userIdFromToken)) {
      return res.status(403).json({
        message: "Kamu tidak memiliki izin untuk menghapus user ini!",
      });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    res.json({ message: "User berhasil dihapus!" });
  } catch (error) {
    console.error("Error saat hapus user:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// ---------------- UPLOAD AVATAR ----------------
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah!" });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    const avatarUrl = result.secure_url;

    await pool.query(
      "UPDATE users SET avatar_url=$1, updated_at=NOW() WHERE id=$2",
      [avatarUrl, req.user.id]
    );

    res.json({ message: "Avatar berhasil diunggah!", avatarUrl });
  } catch (error) {
    console.error("Error upload avatar:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
