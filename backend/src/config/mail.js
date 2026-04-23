const nodemailer = require('nodemailer');

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        const err = new Error(`[MAIL] Missing required env var: ${name}`);
        err.statusCode = 500;
        throw err;
    }
    return value;
}

const smtpHost = requireEnv('SMTP_HOST');
const smtpPort = parseInt(requireEnv('SMTP_PORT'), 10);
const smtpUser = requireEnv('SMTP_USER');
const smtpPass = requireEnv('SMTP_PASS');

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // false for 587 (STARTTLS)
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter on startup
transporter.verify((error) => {
    if (error) {
        console.error(`[MAIL] SMTP connection failed (host=${smtpHost} port=${smtpPort} user=${smtpUser}):`, error.message);
    } else {
        console.log(`[MAIL] SMTP server ready (host=${smtpHost} port=${smtpPort} user=${smtpUser})`);
    }
});

const sendEmail = async (options) => {
    const mailOptions = {
        from: `OGUN APPLIANCES <${smtpUser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        const acceptedList = Array.isArray(info.accepted) ? info.accepted : (info.accepted ? [info.accepted] : []);
        const rejectedList = Array.isArray(info.rejected) ? info.rejected : (info.rejected ? [info.rejected] : []);
        const accepted = acceptedList.map(String).join(',');
        const rejected = rejectedList.map(String).join(',');
        console.log(
            '[MAIL] Email sent:',
            `to=${options.email}`,
            `messageId=${info.messageId}`,
            accepted ? `accepted=${accepted}` : '',
            rejected ? `rejected=${rejected}` : ''
        );

        // Nodemailer may resolve even if recipients were rejected (accepted/rejected arrays).
        // Treat "not accepted" as a failure so controllers don't return false-positive success.
        const to = String(options.email || '').trim().toLowerCase();
        const acceptedNormalized = acceptedList.map(a => String(a).trim().toLowerCase());
        const rejectedNormalized = rejectedList.map(r => String(r).trim().toLowerCase());
        const isAccepted = acceptedNormalized.includes(to);
        const isRejected = rejectedNormalized.includes(to);
        if (!isAccepted || isRejected) {
            const err = new Error('[MAIL] Recipient was not accepted by SMTP server');
            err.statusCode = 502;
            err.details = { accepted: acceptedList, rejected: rejectedList };
            throw err;
        }

        return info;
    } catch (error) {
        console.error('[MAIL] Failed to send email to:', options.email, '| Error:', error.message);
        throw error; // re-throw so the controller catches it
    }
};

module.exports = sendEmail;
