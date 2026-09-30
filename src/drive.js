import { Readable } from "node:stream";
import { google } from "googleapis";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// OAuth as a real user (required for personal Gmail: service accounts have no storage quota).
// Falls back to a service account, which only works with Shared Drives.
function getAuth() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (GOOGLE_REFRESH_TOKEN) {
    const oauth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    oauth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    return oauth;
  }
  const json = process.env.GOOGLE_CREDENTIALS_JSON;
  return new google.auth.GoogleAuth({
    ...(json && { credentials: JSON.parse(json) }),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

export async function uploadDocx(buffer, name) {
  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) throw new Error("DRIVE_FOLDER_ID is not set");

  const drive = google.drive({ version: "v3", auth: getAuth() });

  const { data } = await drive.files.create({
    requestBody: { name, parents: [folderId] },
    media: { mimeType: DOCX_MIME, body: Readable.from(buffer) },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });
  return data;
}
