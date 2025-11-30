// routes/waba.js
import express from "express";
import axios from "axios";
import { pool } from "../db.js";

const router = express.Router();

const WABA_URL = process.env.WABA_API_URL;
const WABA_NUMBER = process.env.WABA_NUMBER;
const WABA_KEY = process.env.WABA_API_KEY;

// Your template name
const TEMPLATE_NAME = "ilcpromo";

function cleanNumber(n) {
  if (!n) return "";
  return String(n).replace(/\D/g, "");
}

async function saveMessageRecord({
  contact_id = null,
  from_type = "admin",
  message,
  message_type = "text",
  status = "sent",
  waba_message_id = null,
  to_number = null,
  from_number = null
}) {
  try {
    await pool.query(
      `INSERT INTO messages (contact_id, from_type, from_number, to_number, message, message_type, waba_message_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [contact_id, from_type, from_number, to_number, message, message_type, waba_message_id, status]
    );
  } catch (err) {
    console.log("DB insert error", err);
  }
}

// Check if 24-hour session is active
async function isSessionActive(contact_id) {
  try {
    const [rows] = await pool.query(
      `SELECT created_at FROM messages
       WHERE contact_id = ? AND from_type = 'user'
       ORDER BY created_at DESC LIMIT 1`,
      [contact_id]
    );

    if (!rows.length) return false;

    const lastUserMessage = new Date(rows[0].created_at);
    const diffHours =
      (Date.now() - lastUserMessage.getTime()) / (1000 * 60 * 60);

    return diffHours < 24;
  } catch (e) {
    return false;
  }
}

// Send template message (to open session)
async function sendTemplate(to) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: "en" }
    }
  };

  const resp = await axios.post(WABA_URL, payload, {
    headers: {
      Key: WABA_KEY,
      wabaNumber: WABA_NUMBER,
      "Content-Type": "application/json"
    }
  });

  return resp.data;
}

// Send text message after session is open
async function sendText(to, message) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message }
  };

  const resp = await axios.post(WABA_URL, payload, {
    headers: {
      Key: WABA_KEY,
      wabaNumber: WABA_NUMBER,
      "Content-Type": "application/json"
    }
  });

  return resp.data;
}

// MAIN SEND ENDPOINT
router.post("/send", async (req, res) => {
  try {
    const { to, message, contact_id } = req.body;

    if (!to || !message)
      return res.status(400).json({ error: "to & message required" });

    const toClean = cleanNumber(to);

    // 1️⃣ Check if 24h session is active
    const sessionActive = await isSessionActive(contact_id);

    let templateResponse = null;

    // 2️⃣ If not active → send template first
    if (!sessionActive) {
      templateResponse = await sendTemplate(toClean);

      await saveMessageRecord({
        contact_id,
        from_type: "admin",
        to_number: toClean,
        from_number: WABA_NUMBER,
        message: `[TEMPLATE: ${TEMPLATE_NAME}]`,
        message_type: "template",
        waba_message_id:
          templateResponse?.messages?.[0]?.id || null,
        status: "sent"
      });
    }

    // 3️⃣ Now send normal text message
    const textResponse = await sendText(toClean, message);

    await saveMessageRecord({
      contact_id,
      from_type: "admin",
      to_number: toClean,
      from_number: WABA_NUMBER,
      message,
      message_type: "text",
      waba_message_id:
        textResponse?.messages?.[0]?.id || null,
      status: "sent"
    });

    // 4️⃣ Emit via socket.io
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

    res.json({
      success: true,
      templateSent: !sessionActive,
      provider: {
        template: templateResponse,
        text: textResponse
      }
    });
  } catch (err) {
    console.log("SEND ERROR", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

export default router;
