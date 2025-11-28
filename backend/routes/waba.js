// routes/waba.js
import express from "express";
import axios from "axios";
import { pool } from "../db.js"; // your DB pool
const router = express.Router();

const WABA_URL = process.env.WABA_API_URL;
const WABA_NUMBER = process.env.WABA_NUMBER;
const WABA_KEY = process.env.WABA_API_KEY;

function cleanNumber(n) {
  if (!n) return "";
  return String(n).replace(/\D/g, "");
}

async function saveMessageRecord({
  contact_id=null, from_type='admin', from_number=null, to_number=null,
  message, message_type='text', waba_message_id=null, status='sent'
}) {
  try {
    await pool.query(
      `INSERT INTO messages (contact_id, from_type, from_number, to_number, message, message_type, waba_message_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [contact_id, from_type, from_number, to_number, message, message_type, waba_message_id, status]
    );
  } catch (err) {
    console.error("saveMessageRecord error:", err);
  }
}

// POST /api/waba/send
router.post("/send", async (req, res) => {
  const { to, message, contact_id } = req.body;
  if (!to || !message) return res.status(400).json({ error: "to & message required" });

  const toClean = cleanNumber(to);

  const payload = {
    to: toClean,
    type: "text",
    recipient_type: "individual",
    text: { body: message }
  };

  try {
    const resp = await axios.post(WABA_URL, payload, {
      headers: {
        wabaNumber: WABA_NUMBER,
        Key: WABA_KEY,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    // attempt to extract provider message id (varies by provider)
    const waba_message_id = resp.data?.messageId || resp.data?.id || null;

    await saveMessageRecord({
      contact_id: contact_id || null,
      from_type: "admin",
      from_number: WABA_NUMBER,
      to_number: toClean,
      message,
      message_type: "text",
      waba_message_id,
      status: "sent"
    });

    // emit to socket.io so admin UI sees the message immediately
    try {
      const io = req.app.get("io");
      if (io && contact_id) {
        io.to(`contact_${contact_id}`).emit("message_sent", {
          contact_id,
          from_type: "admin",
          message,
          to: toClean,
          created_at: new Date().toISOString()
        });
      }
    } catch (e) { /* ignore */ }

    res.json({ success: true, provider: resp.data });
  } catch (err) {
    console.error("WABA send error:", err?.response?.data || err.message);
    await saveMessageRecord({
      contact_id: contact_id || null,
      from_type: "admin",
      from_number: WABA_NUMBER,
      to_number: toClean,
      message,
      message_type: "text",
      waba_message_id: null,
      status: "failed"
    });
    res.status(500).json({ error: "Failed to send message", detail: err?.response?.data || err.message });
  }
});

export default router;
