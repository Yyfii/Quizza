// Email verification
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    //brevo smtp
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

export default transporter;