import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyMail = async (token, email) => {
  try {
    // Read Handlebars template
    const templatePath = path.join(__dirname, "template.hbs");
    const emailTemplateSource = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(emailTemplateSource);

    // Dynamic verification link
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const htmlToSend = template({ token: encodeURIComponent(token), CLIENT_URL: clientUrl });


    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Email configuration
    const mailOptions = {
      from: `"Notes App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Notes App - Email Verification",
      html: htmlToSend,
    };

    // Send the email once
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    console.log(info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
