const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

exports.sendEmail = async ({ to, subject, html }) => {
    console.log(`Sending email to ${to} with subject "${subject}"`);
    console.log('Email content:', html);
    return transporter.sendMail({
        from: `"Pandro's Home" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
}