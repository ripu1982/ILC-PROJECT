// routes/facebookMessages.js
import express from "express";
import { getPageConversations, getConversationMessages, sendReplyToConversation } from "../services/metaApi.js"; // path to your metaapi
const router = express.Router();

// GET /facebook/conversations
router.get("/conversations", async (req, res) => {
  try {
    const convs = await getPageConversations();
    // normalize results for frontend
    const items = (convs.data || []).map(c => ({
      id: c.id,
      snippet: c.snippet || "",
      updated_time: c.updated_time,
      unread_count: c.unread_count || 0,
      // pick first sender name
      senders: c.senders?.data || []
    }));
    res.json({ data: items });
  } catch (err) {
    console.error("GET /facebook/conversations error", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET /facebook/conversations/:id/messages
router.get("/conversations/:id/messages", async (req, res) => {
  const convId = req.params.id;
  try {
    const msgs = await getConversationMessages(convId);
    // return messages array
    res.json({ data: msgs.data || [] });
  } catch (err) {
    console.error("GET /facebook/conversations/:id/messages error", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /facebook/conversations/:id/reply
router.post("/conversations/:id/reply", async (req, res) => {
  const convId = req.params.id;
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "missing message" });

  try {
    const result = await sendReplyToConversation(convId, { messageText: message });
    res.json({ ok: true, result });
  } catch (err) {
    console.error("POST /facebook/conversations/:id/reply error", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
