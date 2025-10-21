import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Step 1: Redirect to Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      // console.log("User from Passport:", req.user); // ✅ You see this already

      // Generate JWT
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );

      // Redirect back to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    } catch (err) {
      console.error("Google login error:", err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
  }
);

router.get("/me", isAuthenticated, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
