import { Readable } from "node:stream";
import { google } from "googleapis";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function uploadDocx(buffer, name) {
  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) throw new Error("DRIVE_FOLDER_ID is not set");

  // Hosted: key contents in GOOGLE_CREDENTIALS_JSON. Local: key file via GOOGLE_APPLICATION_CREDENTIALS.
  const json = process.env.GOOGLE_CREDENTIALS_JSON;
  const auth = new google.auth.GoogleAuth({
    ...(json && { credentials: JSON.parse(json) }),
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  const drive = google.drive({ version: "v3", auth });

  const { data } = await drive.files.create({
    requestBody: { name, parents: [folderId] },
    media: { mimeType: DOCX_MIME, body: Readable.from(buffer) },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });
  return data;
}
