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

dotenv.config();

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:8080", // your React app
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
app.get("/api/facebook/page-info", async (req, res) => {
  try {
    const info = await fetchFacebookPageDetails();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Health check
app.get("/", (req, res) => res.send("Backend running..."));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
