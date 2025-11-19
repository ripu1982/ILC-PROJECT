import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js"; // ✅ using your existing pool

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mov",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

// 📍 GET all media assets
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM media_assets ORDER BY uploadedAt DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

// 📍 POST upload media (single file)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { originalname, mimetype, size, filename } = req.file;
    const { tags = "[]" } = req.body;

    const type = mimetype.startsWith("image")
      ? "image"
      : mimetype.startsWith("video")
      ? "video"
      : "document";

    const url = `/uploads/${filename}`;
    const fileSizeMB = `${(size / 1024 / 1024).toFixed(2)} MB`;

    await pool.query(
      "INSERT INTO media_assets (name, type, url, size, uploadedAt, tags) VALUES (?, ?, ?, ?, NOW(), ?)",
      [originalname, type, url, fileSizeMB, tags]
    );

    res.json({ message: "Upload successful", file: { name: originalname, url, type } });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// 📍 DELETE media by ID
router.delete("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT url FROM media_assets WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });

    const filePath = path.join(process.cwd(), rows[0].url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query("DELETE FROM media_assets WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
