import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

export const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;      

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: "Access token is missing or invalid",
            });
        }

        const token = authHeader.split(" ")[1];

        // console.log(token);
        

        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Access token has expired, use refreshToken to generate again",
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: "Access token is missing or invalid",
                });
            }

            const { id } = decoded;
            // console.log(id);
            
            const user = await User.findById(id);
            // console.log(user);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            req.user = user
            req.userId = user._id; //  Store userId in request for use in controllers
            // console.log(req.userId);
            
            next(); //  Move to the next middleware or controller
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

