const nodemailer = require('nodemailer');
// Removed config.js import

let transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: (process.env.SMTP_PORT == 465), // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

const sendOTP = async (email, otp) => {
    if (!transporter) {
        console.log(`[DEVELOPMENT MODE] Mocking OTP send to ${email}. Code: ${otp}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Mock Platform" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Login OTP",
            text: `Your OTP for login is ${otp}. It is valid for 10 minutes.`,
            html: `<b>Your OTP for login is <span style="font-size: 24px">${otp}</span></b><p>It is valid for 10 minutes.</p>`,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email", error);
        throw new Error('Could not send OTP email');
    }
};

module.exports = {
    sendOTP
};
