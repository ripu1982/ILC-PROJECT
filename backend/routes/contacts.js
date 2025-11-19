import express from "express";
import { pool } from "../db.js"; // <-- your MySQL pool from "../db.js"; // <-- your MySQL pool connection
const router = express.Router();

// ✅ GET all contacts
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contacts ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST - Add new contact
router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    tags,
    channel,
    consent,
    dnd,
    location,
    notes,
    vip,
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO contacts 
        (name, email, phone, tags, channel, consent, dnd, location, notes, vip, lastContact, interactions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)`,
      [
        name,
        email,
        phone,
        JSON.stringify(tags || []),
        channel,
        consent ? 1 : 0,
        dnd ? 1 : 0,
        location,
        notes,
        vip ? 1 : 0,
      ]
    );

    const [newContact] = await pool.query(
      "SELECT * FROM contacts WHERE id = ?",
      [result.insertId]
    );

    res.json(newContact[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving contact" });
  }
});

export default router;
