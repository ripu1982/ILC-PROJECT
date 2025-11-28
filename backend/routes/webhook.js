// routes/webhook.js
import express from "express";
import { pool } from "../db.js";
import axios from "axios";
import { processRating } from "../lib/gmb.js"; // we'll create this
const router = express.Router();

function cleanNumber(n) { return n ? String(n).replace(/\D/g,'') : n; }

async function saveIncoming({ contact_id=null, from_number, to_number, message, raw }) {
  try {
    await pool.query(
      `INSERT INTO messages (contact_id, from_type, from_number, to_number, message, message_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contact_id, 'user', from_number, to_number, message, 'text', 'received']
    );
  } catch (err) {
    console.error("saveIncoming error:", err);
  }
}

// You must adapt to your provider's webhook payload structure.
// The Postman file suggests provider sends messages array. We'll try to be defensive.
router.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;
    // Try a few common shapes
    const messages = payload.messages || payload?.data?.messages || (Array.isArray(payload) ? payload : null);

    // Simple fallback: if API sends a single message object
    const entries = Array.isArray(messages) ? messages : (payload && payload.message ? [payload.message] : []);

    for (const msg of entries) {
      const from = msg.from || msg?.sender || msg?.msisdn || msg?.fromNumber || msg?.source;
      const text = (msg.text && msg.text.body) || msg.body || msg?.message || (typeof msg === 'string' ? msg : null);
      const to = msg.to || msg?.recipient || msg?.toNumber || null;
      const cleanedFrom = cleanNumber(from);
      const cleanedTo = cleanNumber(to);

      // try to find contact by phone (contacts.phone stored with formatting maybe)
      let contact_id = null;
      try {
        const [rows] = await pool.query("SELECT id FROM contacts WHERE REPLACE(REPLACE(REPLACE(phone,'+',''), ' ', '' , '-') , '(', '') LIKE ?", [`%${cleanedFrom}%`]);
        if (rows && rows.length) contact_id = rows[0].id;
      } catch (e) {
        // ignore
      }

      await saveIncoming({
        contact_id,
        from_number: cleanedFrom,
        to_number: cleanedTo,
        message: typeof text === "object" ? JSON.stringify(text) : text,
        raw: JSON.stringify(msg)
      });

      // If the message text looks like a rating (e.g., "5" or "5 stars" or "⭐5"):
      const textNormalized = (text || "").toString().trim().toLowerCase();
      const ratingMatch = textNormalized.match(/\b([1-5])\b/);
      if (ratingMatch) {
        const rating = Number(ratingMatch[1]);
        if (rating >= 4) {
          // trigger google my business review push
          try {
            await processRating({ rating, contact_id, from: cleanedFrom });
          } catch (err) {
            console.error("GMB push failed:", err);
          }
        }
      }

      // emit to admin UI via socket.io rooms (admins join room `contact_${id}`)
      try {
        const io = req.app.get("io");
        if (io) {
          // if contact_id known, emit to that room; otherwise broadcast to `admin_inbox` for unlinked messages
          if (contact_id) {
            io.to(`contact_${contact_id}`).emit("message_received", {
              contact_id,
              from: cleanedFrom,
              text,
              created_at: new Date().toISOString()
            });
          } else {
            io.to("admin_inbox").emit("unmatched_message", {
              from: cleanedFrom,
              text,
              raw: msg
            });
          }
        }
      } catch (e) { /* ignore */ }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.sendStatus(500);
  }
});

export default router;
