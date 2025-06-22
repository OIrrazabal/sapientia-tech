const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

async function enviarCorreo({ to, subject, html }) {
  return transporter.sendMail({
    from: `"sapientiaTechCourse" <no-reply@sapientia-tech-course.com>`,
    to,
    subject,
    html
  });
}

module.exports = { enviarCorreo };