import cors from "cors";
import express from "express";
import { googleTranslate } from "@context-translate/core";
import { checkRateLimit } from "./rateLimit.js";

const PORT = Number(process.env.PORT ?? 8787);
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY ?? "";
const corsOrigins = (process.env.CORS_ORIGINS ?? "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();
app.use(express.json({ limit: "32kb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsOrigins.includes("*")) return callback(null, true);
      const allowed = corsOrigins.some(
        (pattern) => origin.startsWith(pattern) || origin === pattern,
      );
      callback(null, allowed);
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "context-translate-api" });
});

app.post("/v1/translate", async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({
      error: "Server missing GOOGLE_TRANSLATE_API_KEY",
      code: "SERVER_CONFIG",
    });
  }

  const deviceId = String(req.header("x-device-id") ?? "").trim();
  if (!deviceId) {
    return res.status(400).json({
      error: "Missing X-Device-Id header",
      code: "MISSING_DEVICE",
    });
  }

  const { allowed, remaining } = checkRateLimit(deviceId);
  if (!allowed) {
    return res.status(429).json({
      error: "Daily translation limit reached for this device",
      code: "RATE_LIMIT",
    });
  }

  const text = String(req.body?.text ?? "").trim();
  const targetLanguage = String(req.body?.targetLanguage ?? "hi").trim();
  const sourceLanguage = String(req.body?.sourceLanguage ?? "auto").trim();

  if (!text) {
    return res.status(400).json({
      error: "No text provided",
      code: "EMPTY_TEXT",
    });
  }

  if (text.length > 5000) {
    return res.status(400).json({
      error: "Text too long (max 5000 characters)",
      code: "TEXT_TOO_LONG",
    });
  }

  try {
    const result = await googleTranslate(
      API_KEY,
      text,
      targetLanguage,
      sourceLanguage === "auto" ? undefined : sourceLanguage,
    );

    res.setHeader("X-RateLimit-Remaining", String(remaining));
    return res.json({
      translatedText: result.translatedText,
      detectedSourceLanguage: result.detectedSourceLanguage,
      targetLanguage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    const isAuth =
      message.toLowerCase().includes("api key") ||
      message.includes("403") ||
      message.includes("401");
    return res.status(isAuth ? 502 : 500).json({
      error: message,
      code: "API_ERROR",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Context Translate API listening on http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn(
      "WARNING: GOOGLE_TRANSLATE_API_KEY is not set. Translation will fail.",
    );
  }
});
