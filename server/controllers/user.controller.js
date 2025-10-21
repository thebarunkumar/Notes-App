import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { verifyMail } from "../emailVerify/verifyMail.js";
import { Session } from "../models/session.model.js";
import { sendOtpMail } from "../emailVerify/sendOtpMail.js";

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        // Normalize email
        const emailNormalized = email.trim().toLowerCase();

        // Check if user exists
        const existingUser = await User.findOne({ email: emailNormalized });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        })

        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { expiresIn: "1d" })
        verifyMail(token, email)
        newUser.token = token
        await newUser.save()
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if all fields are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access"
            });
        }

        // Check if password matches
        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            return res.status(402).json({
                success: false,
                message: "Incorrect Password"
            });
        }

        // Check if user is verified
        if (user.isVerified !== true) {
            return res.status(403).json({
                success: false,
                message: "Verify your account then login!"
            });
        }

        // Check for existing session and delete it
        const existingSession = await Session.findOne({ userId: user._id });
        if (existingSession) {
            await Session.deleteOne({ userId: user._id });
        }

        // Create a new session
        await Session.create({ userId: user._id })

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "10d" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "30d" }
        );

        // Update user login status
        user.isLoggedIn = true;
        await user.save();

        // Send success response
        return res.status(200).json({
            success: true,
            message: "User Logged in Successfully",
            accessToken,
            refreshToken,
            data: user
        });


    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const userId = req.userId;
        await Session.deleteMany({ userId });
        await User.findByIdAndUpdate(userId, { isLoggedIn: false });

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();

        await sendOtpMail(email, otp);
        return res.status(200).json({ success: true, message: "OTP sent to email", user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

// Resend verification email
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ success: false, message: "Email is required" })

        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        if (user.isVerified) return res.status(400).json({ success: false, message: "User already verified" })
    
    // Always generate a new token for each resend
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" })
        user.token = token
        await user.save()

    // Send verification email
        await verifyMail(token, email)

        return res.status(200).json({ success: true, message: "Verification email resent" })
    } catch (error) {
        console.error('Resend verification error:', error)
        return res.status(500).json({ success: false, message: "Failed to resend verification email" })
    }
}

export const verifyOTP = async (req, res) => {
    const { otp } = req.body
    const email = req.params.email

    if (!otp) {
        return res.status(400).json({
            success: false,
            message: "OTP is required",
        })
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "OTP not generated or already verified",
            })
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            })
        }

        // const isOtpValid = await bcrypt.compare(otp, user.otp)

        if (otp !== user.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            })
        }

        // OTP is valid → mark user as verified and clear OTP fields
        user.isVerified = true
        user.otp = null
        user.otpExpiry = null
        await user.save()

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        })
    } catch (error) {
        console.error("OTP verification error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

export const changePassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body
    const email = req.params.email
    console.log(email);

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match",
        })
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        })
    } catch (error) {
        console.error("Change password error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

