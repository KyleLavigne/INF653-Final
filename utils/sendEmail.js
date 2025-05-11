const nodemailer = require('nodemailer');

module.exports = async function sendEmail(to, subject, htmlContent) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Event Ticketing" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Email failed to send:', error);
  }
};