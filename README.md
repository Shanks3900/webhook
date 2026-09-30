# Webhook → .docx brief → Google Drive

`POST /webhook` with a JSON body builds a short Word brief and uploads it to a Drive folder.

## Google setup (OAuth as your account)
Service accounts have no storage quota, so on personal Gmail uploads fail with `storageQuotaExceeded`. Upload as yourself instead.

1. Google Cloud project → enable the **Google Drive API**.
2. **Google Auth Platform → Branding/Audience**: user type External, add yourself as a test user, then set **Publishing status → In production** (otherwise the refresh token expires after 7 days; the "unverified app" warning is fine for personal use).
3. **Clients → Create client → Desktop app**. Copy the client ID and secret.
4. Get a refresh token (once, locally):
   ```
   $env:GOOGLE_CLIENT_ID="..."; $env:GOOGLE_CLIENT_SECRET="..."; node scripts/get-token.js
   ```
   Open the printed URL, approve, and copy the `GOOGLE_REFRESH_TOKEN=...` line.
5. Copy the target folder's ID from its Drive URL.
6. Set `WEBHOOK_SECRET`, `DRIVE_FOLDER_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` in `.env` (or in your host's environment settings).

Workspace users with a Shared Drive can instead use a service account via `GOOGLE_CREDENTIALS_JSON`.

## Run
```
npm install
npm start
```

## Call it
```
curl -X POST http://localhost:3000/webhook \
  -H "X-Webhook-Secret: change-me" \
  -H "Content-Type: application/json" \
  -d '{"title":"Weekly Sales","owner":"Ops","items":[{"region":"East","total":1200},{"region":"West","total":950}]}'
```
Response: `{"fileId":"...","webViewLink":"https://docs.google.com/..."}`

Payload: `title` (optional), `items` (array of objects or scalars → table/bullets), every other top-level key → Details table.

## Test
`npm test` (checks the generated .docx buffer; does not touch Drive).
