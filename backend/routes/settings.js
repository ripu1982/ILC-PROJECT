import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// 🧾 General Settings
router.get("/general", (req, res) => {
  pool.query("SELECT * FROM organization_settings LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0] || {});
  });
});

router.post("/general", (req, res) => {
  const { name, timezone, description } = req.body;
  pool.query(
    `REPLACE INTO organization_settings (id, name, timezone, description) VALUES (1, ?, ?, ?)`,
    [name, timezone, description],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "General settings updated" });
    }
  );
});

// 🔌 Accounts
router.get("/accounts", (req, res) => {
  pool.query("SELECT * FROM connected_accounts", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

router.post("/accounts", (req, res) => {
  const { platform, account, status } = req.body;
  pool.query(
    "INSERT INTO connected_accounts (platform, account, status) VALUES (?, ?, ?)",
    [platform, account, status],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Account added" });
    }
  );
});

// 👥 Team Members
router.get("/team", (req, res) => {
  pool.query("SELECT * FROM team_members", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

router.post("/team", (req, res) => {
  const { name, email, role, status } = req.body;
  pool.query(
    "INSERT INTO team_members (name, email, role, status) VALUES (?, ?, ?, ?)",
    [name, email, role, status],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Team member added" });
    }
  );
});

// 🔔 Notifications
router.get("/notifications", (req, res) => {
  pool.query("SELECT * FROM notification_settings LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0] || {});
  });
});

router.post("/notifications", (req, res) => {
  const { email, campaigns, messages, reports } = req.body;
  pool.query(
    "REPLACE INTO notification_settings (id, email, campaigns, messages, reports) VALUES (1, ?, ?, ?, ?)",
    [email, campaigns, messages, reports],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Notification settings updated" });
    }
  );
});

// 🔐 Security (Password update)
router.post("/security", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  pool.query("SELECT password FROM users WHERE id = 1", async (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (!result.length) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, result[0].password);
    if (!isMatch) return res.status(400).json({ error: "Invalid current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    pool.query("UPDATE users SET password = ? WHERE id = 1", [hashed], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: "Password updated successfully" });
    });
  });
});

export default router;
