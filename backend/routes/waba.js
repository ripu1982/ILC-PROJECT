// routes/waba.js
import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import { pool } from "../db.js";

const router = express.Router();

const WABA_URL = process.env.WABA_API_URL;                       // message send API
const WABA_NUMBER = process.env.WABA_NUMBER;
const WABA_KEY = process.env.WABA_API_KEY;

const WORKFLOW_ID = process.env.WABA_WORKFLOW_ID || "";          // required for delivery
const DEFAULT_CAMPAIGN_ID = process.env.WABA_CAMPAIGN_ID || "";  // optional fallback

// -----------------------------
// UTIL: Clean mobile number
// -----------------------------
function cleanNumber(n) {
  return String(n || "").replace(/\D/g, "");
}

// -----------------------------
// UTIL: Save message record
// -----------------------------
async function saveMessageRecord({
  contact_id = null,
  from_type = "admin",
  from_number = null,
  to_number = null,
  message,
  message_type = "text",
  waba_message_id = null,
  status = "sent",
}) {
  try {
    await pool.query(
      `INSERT INTO messages 
      (contact_id, from_type, from_number, to_number, message, message_type, waba_message_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contact_id,
        from_type,
        from_number,
        to_number,
        message,
        message_type,
        waba_message_id,
        status,
      ]
    );
  } catch (err) {
    console.error("saveMessageRecord error:", err);
  }
}

// =======================================================
// 1️⃣ SEND SIMPLE TEXT MESSAGE
// =======================================================
router.post("/send", async (req, res) => {
  const { to, message, contact_id } = req.body;

  if (!to || !message)
    return res.status(400).json({ error: "to & message required" });

  const payload = {
    messaging_product: "whatsapp",
    to: cleanNumber(to),
    type: "text",
    text: { body: message },
  };

  try {
    const response = await axios.post(WABA_URL, payload, {
      headers: {
        Key: WABA_KEY,
        wabaNumber: WABA_NUMBER,
        workflowId: WORKFLOW_ID,
        campaignId: DEFAULT_CAMPAIGN_ID,
        "Content-Type": "application/json",
      },
    });

    const waba_message_id =
      response.data?.messages?.[0]?.id || response.data?.id || null;

    await saveMessageRecord({
      contact_id,
      from_number: WABA_NUMBER,
      to_number: cleanNumber(to),
      message,
      message_type: "text",
      waba_message_id,
    });

    // broadcast to UI
    const io = req.app.get("io");
    if (io && contact_id) {
      io.to(`contact_${contact_id}`).emit("message_sent", {
        contact_id,
        from_type: "admin",
        message,
        created_at: new Date().toISOString(),
      });
    }

    res.json({ success: true, provider: response.data });
  } catch (err) {
    res.status(500).json({
      error: "Failed to send message",
      detail: err.response?.data || err.message,
    });
  }
});

// =======================================================
// 2️⃣ SEND TEMPLATE MESSAGE (WITH VARIABLES)
// =======================================================
router.post("/template/send", async (req, res) => {
  const { to, templateName, variables = {}, contact_id } = req.body;

  if (!to || !templateName)
    return res.json({ error: "to & templateName required" });

  const templateParams = Object.values(variables).map((v) => ({ type: "text", text: v }));

  const payload = {
    messaging_product: "whatsapp",
    to: cleanNumber(to),
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: templateParams,
        },
      ],
    },
  };

  try {
    const response = await axios.post(WABA_URL, payload, {
      headers: {
        Key: WABA_KEY,
        wabaNumber: WABA_NUMBER,
        workflowId: WORKFLOW_ID,
        campaignId: DEFAULT_CAMPAIGN_ID,
        "Content-Type": "application/json",
      },
    });

    res.json({ success: true, provider: response.data });
  } catch (err) {
    res.status(500).json({
      error: "Template Send Failed",
      detail: err.response?.data || err.message,
    });
  }
});

// =======================================================
// 3️⃣ UPLOAD FILE (TO GET fileId)
// =======================================================

const upload = multer({ dest: "tmp/" });

router.post("/upload-file", upload.single("file"), async (req, res) => {
  if (!req.file) return res.json({ error: "File missing" });

  const form = new FormData();
  form.append("file", fs.createReadStream(req.file.path));

  try {
    const response = await axios.post(
      "https://voice.otechnonix.com/api/uploadFile",
      form,
      {
        headers: {
          key: WABA_KEY,
          ...form.getHeaders(),
        },
      }
    );

    fs.unlinkSync(req.file.path); // delete temp file

    res.json({
      success: true,
      provider: response.data,
    });
  } catch (err) {
    res.status(500).json({
      error: "File Upload Failed",
      detail: err.response?.data || err.message,
    });
  }
});

// =======================================================
// 4️⃣ CREATE CAMPAIGN (TO GET campaignId)
// =======================================================
router.post("/campaign/create", async (req, res) => {
  const { campaignName, templateName, fileId, mobilenoField = 2, variables = {} } =
    req.body;

  if (!campaignName || !templateName || !fileId)
    return res.json({ error: "campaignName, templateName & fileId required" });

  const payload = {
    campaignName,
    templateName,
    mobilenoField,
    fileId,
    variable: variables,
    countryCode: 91,
  };

  try {
    const response = await axios.post(
      "https://voice.otechnonix.com/REST/createCampaign",
      payload,
      {
        headers: {
          Key: WABA_KEY,
          wabaNumber: WABA_NUMBER,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, provider: response.data });
  } catch (err) {
    res.status(500).json({
      error: "Campaign Creation Failed",
      detail: err.response?.data || err.message,
    });
  }
});

export default router;
