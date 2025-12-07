// utils/mailer.js
const nodemailer = require('nodemailer');

let transporter;

/**
 * Initialize a singleton transporter
 */
function getTransporter() {
  if (transporter) return transporter;

  const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
    MAIL_USER,
    MAIL_PASS
  } = process.env;

  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    throw new Error('Mailer env vars missing: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS');
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT) || 587,
    secure: String(MAIL_SECURE).toLowerCase() === 'true', // true for 465, false for 587
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    }
  });

  return transporter;
}

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - subject line
 * @param {string} [options.html] - HTML body
 * @param {string} [options.text] - text body (fallback auto-generated if not supplied)
 * @param {string} [options.fromEmail] - override sender email
 * @param {string} [options.fromName] - override sender name
 * @param {Array} [options.attachments] - nodemailer attachments array
 */
async function sendMail(options) {
  const transporter = getTransporter();

  const fromEmail = options.fromEmail || process.env.MAIL_FROM_EMAIL;
  const fromName = options.fromName || process.env.MAIL_FROM_NAME || 'Mail Bot';

  if (!fromEmail) {
    throw new Error('MAIL_FROM_EMAIL missing');
  }

  const message = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html || undefined,
    text: options.text || (options.html ? stripHtml(options.html) : undefined),
    attachments: options.attachments || []
  };

  const info = await transporter.sendMail(message);
  return info;
}

/**
 * Basic HTML to text fallback
 */
function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?(?:.|\n)*?>/gm, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

module.exports = { sendMail };
