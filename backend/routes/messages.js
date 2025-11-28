// routes/messages.js
import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// GET /api/messages?contact_id=123
router.get("/", async (req, res) => {
  const contact_id = req.query.contact_id;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE contact_id = ? ORDER BY created_at ASC",
      [contact_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch messages" });
  }
});

export default router;
