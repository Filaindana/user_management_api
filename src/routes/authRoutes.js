// src/routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// endpoint register dan login
router.post("/register", register);
router.post("/login", login);

export default router;
