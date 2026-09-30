// One-time helper: run locally to get a Google refresh token.
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-token.js
import http from "node:http";
import { google } from "googleapis";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  process.exit(1);
}

const PORT = 53682;
const redirect = `http://localhost:${PORT}`;
const oauth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirect);

const url = oauth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // forces a refresh token to be issued
  scope: ["https://www.googleapis.com/auth/drive"],
});

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get("code");
  if (!code) return res.end("Waiting for Google redirect...");
  try {
    const { tokens } = await oauth.getToken(code);
    res.end("Done. You can close this tab and return to the terminal.");
    console.log("\nGOOGLE_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
  } catch (err) {
    res.end("Failed, see terminal.");
    console.error(err.message);
  }
  server.close();
});

server.listen(PORT, () => console.log("Open this URL in your browser:\n\n" + url + "\n"));
