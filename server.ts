import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import https from "https";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;

  if (!MONGODB_URI) {
    console.warn(
      "MONGODB_URI is not defined. Database features will be unavailable.",
    );
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  displayName: String,
});

const User = mongoose.model("User", userSchema);

// Razorpay Lazy Initialization
let razorpay: any = null;
const getRazorpay = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined");
    }
    console.log(
      `Initializing Razorpay with Key ID starting with: ${keyId.substring(0, 8)}...`,
    );
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
};

// API Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    await connectToDatabase();
    if (!isConnected) {
      return res
        .status(503)
        .json({
          error:
            "Database connection not available. Please configure MONGODB_URI in settings.",
        });
    }
    const { email, password, role, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({
          error:
            "This email is already registered. Please use a different email or sign in.",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role,
      displayName,
    });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          error:
            "This email is already registered. Please use a different email or sign in.",
        });
    }
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    await connectToDatabase();
    if (!isConnected) {
      return res
        .status(503)
        .json({
          error:
            "Database connection not available. Please configure MONGODB_URI in settings.",
        });
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({
      token,
      user: {
        uid: user._id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const rzp = getRazorpay();
    const options = {
      amount: Math.round(amount * 100), // Amount in smallest currency unit (paise for INR)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await rzp.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error("Razorpay error:", JSON.stringify(error, null, 2));

    // Handle Razorpay authentication errors specifically
    const errorCode = error.code || error.error?.code;
    const errorDesc = error.description || error.error?.description;

    if (
      errorCode === "BAD_REQUEST_ERROR" &&
      errorDesc?.includes("Authentication failed")
    ) {
      return res.status(401).json({
        error:
          "Razorpay authentication failed. Troubleshooting steps:\n1. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Settings > Secrets.\n2. Ensure Key ID starts with 'rzp_test_' for test mode or 'rzp_live_' for live mode.\n3. Verify you haven't swapped the Secret and the ID.\n4. Ensure both Key and Secret belong to the same environment (Test vs Live).",
      });
    }

    res
      .status(500)
      .json({
        error:
          error.message ||
          error.error?.description ||
          "Failed to create Razorpay order",
      });
  }
});

app.post("/api/razorpay/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ error: "Missing required payment details" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      return res.status(500).json({ error: "Razorpay secret not configured" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ status: "ok", message: "Payment verified successfully" });
    } else {
      res.status(400).json({ status: "error", message: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("Verification error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notifications/telegram", async (req, res) => {
  try {
    const { message } = req.body;
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn(
        "Telegram configuration is missing (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID). Telegram notification logged to console.",
      );
      console.log("--- MOCK TELEGRAM NOTIFICATION ---");
      console.log(`Message: ${message}`);
      console.log("----------------------------------");
      return res.json({
        status: "mock_sent",
        message: "Telegram message logged to console (Bot not configured)",
      });
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const telegramReq = https.request(url, options, (telegramRes) => {
      let responseBody = "";
      telegramRes.on("data", (chunk) => {
        responseBody += chunk;
      });
      telegramRes.on("end", () => {
        if (telegramRes.statusCode === 200) {
          res.json({ status: "ok", message: "Telegram message sent" });
        } else {
          console.error("Telegram API error:", responseBody);
          res
            .status(500)
            .json({ error: "Telegram API error", details: responseBody });
        }
      });
    });

    telegramReq.on("error", (error) => {
      console.error("Telegram request error:", error);
      res.status(500).json({ error: error.message });
    });

    telegramReq.write(data);
    telegramReq.end();
  } catch (error: any) {
    console.error("Telegram error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
