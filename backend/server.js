import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import contactsRouter from "./routes/contacts.js";
import path from "path";
import composeRoutes from "./routes/composeRoutes.js";
import mediaLibraryRoutes from "./routes/mediaLibrary.js";
import settingsRoutes from "./routes/settings.js";
import bodyParser from "body-parser";
import { fetchFacebookPageDetails } from "./services/metaApi.js";
import facebookMessagesRouter from "./routes/facebookMessages.js";
import wabaRoutes from "./routes/waba.js";
import webhookRoutes from "./routes/webhook.js";
import messagesRoutes from "./routes/messages.js";
import http from "http";
import { Server as IOServer } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://13.201.76.47", "http://localhost:8080"], // your React app
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only in production (HTTPS)
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/compose", composeRoutes);
app.use("/api/media", mediaLibraryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/facebook", facebookMessagesRouter);
app.use("/api/waba", wabaRoutes);
app.use("/api/waba", webhookRoutes);
app.use("/api/messages", messagesRoutes);
app.get("/api/facebook/page-info", async (req, res) => {
  try {
    const info = await fetchFacebookPageDetails();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// create socket.io server
const io = new IOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("join_contact", (contact_id) => {
    socket.join(`contact_${contact_id}`);
    console.log("📌 Joined room:", `contact_${contact_id}`);
  });

  socket.on("leave_contact", (contact_id) => {
    socket.leave(`contact_${contact_id}`);
  });

  socket.on("join_admin_inbox", () => {
    socket.join("admin_inbox");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// make io available to routes
app.set("io", io);

// Health check
app.get("/", (req, res) => res.send("Backend + Socket.IO Running OK 🚀"));

// Start server
const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running at http://localhost:${PORT}`);
});
