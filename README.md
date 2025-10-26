# Notes App

A full-stack Notes / Todo application with user authentication (email verification & Google OAuth), password reset via OTP, file uploads for notes, and a React + Vite frontend with Redux for state management.

This README documents project structure, setup, environment variables, running the project, API endpoints, authentication flow, development notes, and troubleshooting.

## Table of Contents

- Project overview
- Tech stack
- Repository structure
- Environment variables
- Setup & run (development)
- Scripts
- API endpoints (backend)
- Authentication flow
- Frontend overview
- File uploads
- Validation & error handling
- Email verification & OTP
- Deployment notes
- Troubleshooting
- Next steps / improvements

## Project overview

The project consists of two main parts:

1. `server/` - Express.js backend (Node.js + MongoDB) exposing REST APIs for user management and todos.
2. `client/` - React frontend built with Vite that interacts with the backend APIs and provides a UI for signup, login, creating todos with optional images, and password reset.

Features
- Register / login with email & password
- Google OAuth sign-in
- Email verification via token sent to user email
- Password reset via OTP emailed to user
- JWT-based authentication for protected routes
- Create, read, update, delete todos (with optional image upload)
- Multer for image uploads (stored in `uploads/`)
- Simple session model to prevent duplicate sessions

## Tech stack

- Frontend: React 19, Vite, React Router, Redux Toolkit, Redux Persist, Axios, Tailwind (partial), Sonner for toasts
- Backend: Node.js (ES modules), Express, MongoDB/Mongoose, Passport.js (Google OAuth), JWT, Nodemailer (Gmail), Multer, Yup for request validation

## Repository structure

Key folders and files:

- `client/` - React app
  - `src/` - application source
    - `App.jsx` - routes and top-level router
    - `main.jsx` - app entry and redux provider
    - `redux/` - redux slice & store
    - `pages/` - Signup, Login, Home, CreateTodo, ForgotPassword, VerifyOTP, ChangePassword, AuthSuccess
    - `components/` - Navbar, ProtectedRoute, UI components
- `server/` - Express backend
  - `index.js` - server entry
  - `config/` - `database.js`, `passport.js`
  - `controllers/` - `user.controller.js`, `todo.controller.js`
  - `models/` - `user.model.js`, `todo.model.js`, `session.model.js`
  - `routes/` - `auth.route.js`, `user.route.js`, `todo.route.js`
  - `middleware/` - authentication, multer, registration token verifier
  - `emailVerify/` - `verifyMail.js`, `sendOtpMail.js`, email template
  - `uploads/` - directory used by multer to store uploaded images


## Environment variables

Create a `.env` file at the `server/` root and set the following variables (example values shown):


## Server environment example

PORT=8000
MONGO_URI=mongodb://mongo:27017/notes-app
SECRET_KEY=your_jwt_secret
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MAIL_USER=your.email@gmail.com
MAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret  

Notes:
- `MAIL_USER` and `MAIL_PASS` are used by Nodemailer to send verification and OTP emails. For Gmail, use an App Password if 2FA is enabled.
- `GOOGLE_CLIENT_*` values are required for Google OAuth. 
- For local development, set callback URL to `http://localhost:8000/auth/google/callback`
- For production (Vercel), add `https://notes-app-server-puce.vercel.app/auth/google/callback` to authorized redirect URIs in Google Cloud Console.
- When deploying to Vercel, set `SERVER_URL` environment variable to your full server URL (e.g., `https://notes-app-server-puce.vercel.app`)

## Setup & run (development)

Prerequisites
- Node.js (16+ recommended)
- npm (or yarn)
- MongoDB running locally or a MongoDB Atlas URI

Install dependencies

Open two terminals (one for backend and one for frontend).

Backend (server):

```powershell
cd "c:\Users\Desktop\Full Stact App\Notes App\server";
npm install
```

Frontend (client):

```powershell
cd "c:\Users\Desktop\Full Stact App\Notes App\client";
npm install
```

Run the apps

Backend:

```powershell
cd "c:\Users\Desktop\Full Stact App\Notes App\server";
npm run dev
```

Frontend:

```powershell
cd "c:\Users\Desktop\Full Stact App\Notes App\client";
npm run dev
```

The frontend expects the backend at `http://localhost:8000` and CORS is configured in `server/index.js` for `http://localhost:5173`.


This will start MongoDB, the server on port 8000 and the built client served by nginx on port 5173.

## Scripts

- server/package.json
  - `npm run dev` - start server with nodemon
  - `npm start` - start server with node
- client/package.json
  - `npm run dev` - start Vite dev server
  - `npm run build` - build production frontend
  - `npm run preview` - preview built frontend

## API endpoints (summary)

Base URL: http://localhost:8000

Auth routes
- GET /auth/google - redirect to Google OAuth
- GET /auth/google/callback - Google callback that issues a JWT and redirects to frontend with token in query
- GET /auth/me - Protected; returns the authenticated user's details (requires Authorization: Bearer <token>)

User routes (`/api/v1/user`)
- POST /api/v1/user/register - Register new user; sends verification email
- POST /api/v1/user/verify-email - Middleware `registrationTokenVerify` expects a token to verify an email
- POST /api/v1/user/login - Login with email & password; returns accessToken & refreshToken
- POST /api/v1/user/logout - Protected; logs out the user and deletes session
- POST /api/v1/user/forgot-password - Send OTP to email for password reset
- POST /api/v1/user/verify-otp/:email - Verify OTP sent to email
- POST /api/v1/user/change-password/:email - Change password after OTP verification

Todo routes (`/api/v1/todo`)
- POST /api/v1/todo/create - Create todo (protected). Supports image upload (multipart/form-data, field `image`).
- GET /api/v1/todo/get - Fetch all todos for authenticated user
- DELETE /api/v1/todo/delete/:todoId - Delete a todo owned by the authenticated user
- PUT /api/v1/todo/update/:todoId - Update a todo (supports new image upload)

Authentication: Protected endpoints require header `Authorization: Bearer <accessToken>`.

## Authentication flow

- Email signup: User registers via `/api/v1/user/register`. Server creates user and issues a short-lived token stored on user and emails a verification link (via `verifyMail`).
- Email verification: User clicks link -> frontend `Verify` route calls `/api/v1/user/verify-email` which uses the token to verify the account.
- Login: User logs in with `/api/v1/user/login` and receives `accessToken` and `refreshToken`. Backend also tracks sessions via `Session` model.
- Google OAuth: Frontend opens `/auth/google`. After successful OAuth, backend uses Passport to create/find user and then signs a JWT and redirects to frontend's `/auth-success?token=...`.
- Protected routes: Frontend stores `accessToken` (currently in localStorage in `AuthSuccess.jsx`) and sends it in `Authorization` header for protected API calls.

Security notes:
- JWT secret is in `SECRET_KEY` env variable; ensure it's strong in production.
- Storing tokens in localStorage is vulnerable to XSS. For production consider HttpOnly cookies for access/refresh tokens.

## Frontend overview

- Routes are defined in `client/src/App.jsx`.
- `AuthSuccess.jsx` reads the token passed during OAuth flow and stores it in `localStorage`, then fetches `/auth/me` to populate the Redux `user` state.
- `ProtectedRoute.jsx` component guards private pages like `CreateTodo`.
- `redux/authSlice.js` holds minimal user state and loading flag. Redux Persist is configured to persist the store across refreshes (see `client/src/redux/store.js`).

UI components are in `client/src/components/ui/` and include form elements, buttons, alerts, and other small building blocks.

## File uploads

- Backend uses Cloudinary for image storage and management.
- Image upload configuration is in `server/config/cloudinary.js`.
- Supported file types: jpeg/jpg/png/gif (limit 10 MB).
- Images are automatically optimized and served through Cloudinary's CDN.
- When updating a todo with a new image, the old image is automatically deleted from Cloudinary.
- Image URLs are stored in the todo document as Cloudinary secure URLs.

## Validation & error handling

- Request bodies for user registration and todo creation are validated using `yup` schemas in `server/validators`.
- Global error handler in `server/index.js` looks for `LIMIT_FILE_SIZE` error from multer and returns a friendly 400 response.

## Email verification & OTP

- `verifyMail.js` renders an email template `template.hbs` and sends it via Nodemailer (configured for Gmail in `.env`).
- `sendOtpMail.js` (present in `emailVerify/`) sends OTPs for password reset.
- OTP is stored on the `User` model (`otp` and `otpExpiry`) and expires after 10 minutes.

## Deployment notes

- Ensure `CLIENT_URL` is set to the production frontend URL.
- Set `callbackURL` in `server/config/passport.js` to the production backend `/auth/google/callback` URL.
 - The project now supports env-driven base URLs: the frontend reads `VITE_API_URL` (see `client/.env.example`) and the server uses `SERVER_URL` (see `server/.env.example`). Update these values in production.
- For production, prefer storing tokens in secure HttpOnly cookies and enable HTTPS.
- Use cloud storage or a CDN for uploaded images rather than local disk.
- Use proper MAIL service credentials; consider transactional email services (SendGrid, Mailgun) for better deliverability.

## Troubleshooting

Common Issues and Solutions:

1. Google OAuth Errors:
   - Error 400 (redirect_uri_mismatch): Make sure to add both development and production callback URLs in Google Cloud Console:
     - Local: `http://localhost:8000/auth/google/callback`
     - Production: `https://notes-app-server-puce.vercel.app/auth/google/callback`
   - Ensure `SERVER_URL` environment variable is set correctly in production

2. Email Verification Issues:
   - Email sending fails: Verify `MAIL_USER` and `MAIL_PASS` and use app passwords for Gmail with 2FA
   - OTP not received: Check spam folder and verify email templates in `emailVerify/`

3. Database Connection:
   - MongoDB connection errors: Check `MONGO_URI` format and ensure MongoDB is running
   - For Atlas: Verify IP whitelist and database user credentials

4. CORS and API Issues:
   - CORS errors: Confirm `CLIENT_URL` matches the frontend URL (Vite dev server in development)
   - API 404 errors: Check if `SERVER_URL` is set correctly in frontend environment

5. File Upload Issues:
   - Upload failures: Verify Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
   - Upload size errors: Verify file size is under 10MB limit
   - Missing images: Check if Cloudinary URLs are properly stored and accessible
   - Image not displaying: Ensure the Cloudinary secure URL is being used

## Next steps / improvements

- Move tokens to HttpOnly cookies and implement refresh token rotation.
- Add rate limiting and request throttling to sensitive endpoints.
- Extract configuration constants and centralize error handling.
- Add unit & integration tests (Jest / Supertest) for backend endpoints.
- Implement image optimization and transformation using Cloudinary's advanced features.
- Improve frontend form validation and UX for error states.