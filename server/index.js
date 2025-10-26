import express from "express";
import "dotenv/config";
import connectDB from "./config/database.js";
import passport from "passport";
import cors from "cors";

import userRoute from "./routes/user.route.js";
import todoRoute from "./routes/todo.route.js";
import authRoutes from "./routes/auth.route.js";
import "./config/passport.js"; 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Dynamic CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL, // Local frontend
  process.env.PROD_CLIENT_URL, // Vercel frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile/postman

      // Exact match or wildcard for vercel.app subdomains
      if (
        allowedOrigins.includes(origin) ||
        (process.env.PROD_CLIENT_DOMAIN &&
          origin.endsWith(process.env.PROD_CLIENT_DOMAIN))
      ) {
        callback(null, true);
      } else {
        console.error(`❌ CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/todo", todoRoute);

// Root route for health check
app.get("/", (req, res) => {
  res.send("✅ Notes App Server is running successfully 🚀");
});

// Error Handling
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS error: This origin is not allowed.",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Max allowed is 5MB.",
    });
  }
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start Server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running successfully ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });
