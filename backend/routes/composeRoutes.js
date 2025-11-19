import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "../db.js"; // <-- your MySQL pool from "../db.js";
import { postToFacebookPage, postToInstagramBusiness } from "../services/metaApi.js"; // services we will define

const router = express.Router();

// File upload storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const isVideo = file.mimetype.startsWith("video");
    const folder = isVideo ? "uploads/videos" : "uploads/images";
    cb(null, folder);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload endpoint
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const url = `/uploads/${req.file.mimetype.startsWith("video") ? "videos" : "images"}/${req.file.filename}`;
  res.json({ url, type: req.file.mimetype.startsWith("video") ? "video" : "image" });
});

// Create / publish post endpoint
router.post("/", async (req, res) => {
  const { text, mediaUrls, platforms, scheduleDate, scheduleTime } = req.body;

  if (!text && (!mediaUrls || mediaUrls.length === 0)) {
    return res.status(400).json({ message: "Post content is empty" });
  }

  try {
    // Save to DB
    const [result] = await pool.query(
      `INSERT INTO posts (text, media, platforms, schedule_date, schedule_time, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        text,
        JSON.stringify(mediaUrls || []),
        JSON.stringify(platforms || []),
        scheduleDate || null,
        scheduleTime || null,
        scheduleDate ? "scheduled" : "published"
      ]
    );
    const postId = result.insertId;

    // Optionally post now if no scheduleDate
    if (!scheduleDate) {
      for (const p of platforms) {
        if (p === "facebook") {
          await postToFacebookPage({ text, mediaUrls });
        } else if (p === "instagram") {
          await postToInstagramBusiness({ text, mediaUrls });
        }
        // Handle whatsapp/google similarly or mark unsupported
      }
      // You may update status in DB to “published”
      await pool.query(`UPDATE posts SET status = ? WHERE id = ?`, ["published", postId]);
    }

    res.json({ id: postId, text, mediaUrls, platforms, scheduleDate, scheduleTime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch recent posts
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM posts ORDER BY id DESC LIMIT 10");
    const parsed = rows.map(r => ({
      ...r,
      media: JSON.parse(r.media),
      platforms: JSON.parse(r.platforms)
    }));
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
