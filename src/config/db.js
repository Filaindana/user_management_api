// src/config/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// buat koneksi ke database PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // kalau kamu pakai database lokal (bukan cloud), bisa juga langsung:
  // host: 'localhost',
  // user: 'postgres',
  // password: 'passwordmu',
  // database: 'namadatabase',
  // port: 5432,
});

export default pool;
