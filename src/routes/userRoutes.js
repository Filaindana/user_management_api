// src/routes/userRoutes.js
import express from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  uploadAvatar,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Semua route di bawah ini dilindungi JWT
router.get("/", verifyToken, getUsers);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.post("/avatar", verifyToken, upload.single("file"), uploadAvatar);

export default router;
