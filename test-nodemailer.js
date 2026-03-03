const nodemailer = require('nodemailer');
const config = require('./src/config');

async function testEmail() {
    console.log('Testing SMTP connection with:');
    console.log('Host:', config.smtpHost);
    console.log('Port:', config.smtpPort);
    console.log('User:', config.smtpUser);
    console.log('Pass:', config.smtpPass ? '******' : 'NOT SET');

    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort == 465,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass, // App password
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Mock Platform Test" <${config.smtpUser}>`,
            to: config.smtpUser, // Send to self
            subject: "Test Email Configuration",
            text: "If you receive this, SMTP is working!",
        });
        require('fs').writeFileSync('error.log', 'SUCCESS: ' + info.messageId);
        console.log("Success! Message sent: %s", info.messageId);
    } catch (error) {
        require('fs').writeFileSync('error.log', error.stack || error.toString() || JSON.stringify(error));
        console.error("FAILED to send email:");
        console.error(error);
    }
}

testEmail();
