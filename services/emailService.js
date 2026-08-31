const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function sendOtpEmail(email, otp, type) {
  let subject;

  if (type === 'EMAIL_VERIFICATION') {
    subject = 'Verify your email';
  } else {
    subject = 'Reset your password';
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject,

    text: `
Your OTP is: ${otp} for ${type === 'EMAIL_VERIFICATION' ? 'email verification' : 'password reset'}.

This OTP will expire in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.

If you did not request this, please ignore this email.
    `,
  });
}

module.exports = {
  sendOtpEmail,
};
