import "dotenv/config";
import { timingSafeEqual } from "node:crypto";
import express from "express";
import { briefName, buildBrief } from "./report.js";
import { uploadDocx } from "./drive.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

function secretOk(provided) {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected || typeof provided !== "string") return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/webhook", async (req, res) => {
  if (!secretOk(req.get("x-webhook-secret"))) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const payload = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !Object.keys(payload).length) {
    return res.status(400).json({ error: "JSON object body required" });
  }

  try {
    const buffer = await buildBrief(payload);
    const file = await uploadDocx(buffer, briefName(payload));
    res.json({ fileId: file.id, webViewLink: file.webViewLink });
  } catch (err) {
    console.error("webhook failed:", err);
    res.status(502).json({ error: "failed to generate or upload report" });
  }
});

// Invalid JSON from express.json lands here.
app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "invalid JSON" });
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`webhook listening on :${port}`));
