# Webhook → .docx brief → Google Drive

`POST /webhook` with a JSON body builds a short Word brief and uploads it to a Drive folder.

## Google setup
1. Create a Google Cloud project and enable the **Google Drive API**.
2. Create a **service account** and download its JSON key to `service-account.json`.
3. In Drive, share the target folder with the service account's email (Editor). Copy the folder ID from its URL.
4. `copy .env.example .env` and fill in `WEBHOOK_SECRET`, `DRIVE_FOLDER_ID`, `GOOGLE_APPLICATION_CREDENTIALS`.

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
