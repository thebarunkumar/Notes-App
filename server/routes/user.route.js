import express from "express";
import {
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  verifyOTP,
  resendVerification,
} from "../controllers/user.controller.js";
import { verification } from "../middleware/registrationTokenVerify.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { userSchema, validateUser } from "../validators/userValidate.js";

const router = express.Router();

router.post("/register", validateUser(userSchema), registerUser);
router.post("/verify-email", verification);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/resend-verification", resendVerification); 
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);

export default router;
