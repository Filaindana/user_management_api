// src/middleware/upload.js
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

// simpan file di memori (bukan di folder lokal)
const storage = multer.memoryStorage();

// buat middleware multer
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
    } else {
      cb(null, true);
    }
  },
});

// fungsi helper upload ke Cloudinary
export const uploadToCloudinary = (buffer, folder = "avatars") => {
  return new Promise((resolve, reject) => {
    const upload_stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    // kirim file buffer ke Cloudinary
    streamifier.createReadStream(buffer).pipe(upload_stream);
  });
};
