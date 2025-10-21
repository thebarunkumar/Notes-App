# Server

This folder contains the Express.js backend for the Notes App.

Quick start (development):

1. Install dependencies

```powershell
cd "server";
npm install
```

2. Copy `.env.example` to `.env` and fill values.

3. Run server

```powershell
npm run dev
```

Notes:
- The server expects MongoDB; for local development use `MONGO_URI`.
- `SERVER_URL` is used to generate callback and uploaded file URLs.
