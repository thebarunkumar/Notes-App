import fs from 'fs'
import path from "path"
import { fileURLToPath } from 'url'
import handlebars from "handlebars"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const verifyMail = async (token, email) => {
    
    // Read Handlebars template
    const emailTemplateSource = fs.readFileSync(
        path.join(__dirname, "template.hbs"),
        "utf-8"
    );
    const template = handlebars.compile(emailTemplateSource)

      // Dynamic verification link
    const clientUrl = process.env.CLIENT_URL|| "http://localhost:5173";
    const htmlToSend = template({ token: encodeURIComponent(token), CLIENT_URL: clientUrl });
        
    // Configure transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    const mailConfigurations = {
        from:  `"Notes App" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Notes App - Email Verification',
        html: htmlToSend,
    };
    
    // Send email
    transporter.sendMail(mailConfigurations, function (error, info) {
        if (error) {
            console.error("Error sending email:", error)
            throw new Error(error);
        }
        console.log('Email Sent Successfully');
        console.log(info);
    });

}