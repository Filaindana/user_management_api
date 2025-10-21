import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default cloudinary;

// Tes Cloudinary (bisa kamu hapus nanti)
cloudinary.api
  .ping()
  .then((res) => console.log("✅ Cloudinary connected:", res))
  .catch((err) => console.error("❌ Cloudinary error:", err.message));
