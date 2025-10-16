const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

/**
 * Generate Contact Us Email HTML with all optional fields
 */
function contactUsTemplate({
  recipientName,
  recipientEmail,
  companyName,
  websiteName,
  phoneNumber,
  typeofPacking,
  problemToSolve,
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>New Contact Inquiry</title>
  <link href="https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;700;800&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Karla', sans-serif; color: #333; line-height: 1.5; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; border: 1px solid #e0e0e0; padding: 24px;">
    <h2 style="color: #007df2;">📩 New Contact Inquiry</h2>
    <p style="font-size: 15px; color: #555;">You have received a new inquiry through your website’s contact form.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td>${recipientName ||
        'N/A'}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td>${recipientEmail ||
        'N/A'}</td></tr>
      ${
        companyName
          ? `<tr><td style="padding: 8px; font-weight: bold;">Company:</td><td>${companyName}</td></tr>`
          : ''
      }
      ${
        websiteName
          ? `<tr><td style="padding: 8px; font-weight: bold;">Website:</td><td>${websiteName}</td></tr>`
          : ''
      }
      ${
        phoneNumber
          ? `<tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td>${phoneNumber}</td></tr>`
          : ''
      }
      ${
        typeofPacking
          ? `<tr><td style="padding: 8px; font-weight: bold;">Packing Type:</td><td>${typeofPacking}</td></tr>`
          : ''
      }
    </table>

    <h3 style="color: #333;">Problem / Message</h3>
    <p style="font-size: 15px; color: #555; background: #f9f9f9; padding: 15px; border-left: 4px solid #007df2; border-radius: 4px;">
      ${problemToSolve || 'No message provided.'}
    </p>

    <p style="font-size: 14px; color: #555;">
      You can reply directly to <a href="mailto:${recipientEmail}" style="color: #007df2;">${recipientEmail}</a>.
    </p>

    <p style="font-size: 14px; color: #555;">Best regards,<br><strong>Specialized packaging marketplace Team</strong></p>
  </div>
</body>
</html>`;
}

/**
 * Express-style handler for sending contact email via Resend
 */
async function sendEmail(req, res) {
  const {
    recipientName,
    recipientEmail,
    companyName,
    websiteName,
    phoneNumber,
    typeofPacking,
    problemToSolve,
    to, // optional
  } = req.body;

  // Validate required fields
  if (!recipientName || !recipientEmail || !problemToSolve) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const subject = `📩 New Contact Inquiry from ${recipientName}`;
  const html = contactUsTemplate({
    recipientName,
    recipientEmail,
    companyName,
    websiteName,
    phoneNumber,
    typeofPacking,
    problemToSolve,
  });
  const text = `
New contact inquiry from ${recipientName}:

Name: ${recipientName}
Email: ${recipientEmail}
Company: ${companyName || 'N/A'}
Website: ${websiteName || 'N/A'}
Phone: ${phoneNumber || 'N/A'}
Packing Type: ${typeofPacking || 'N/A'}

Message:
${problemToSolve}
`;
  try {
    const { data, error } = await resend.emails.send({
      from: 'dmarinac@specpkgmarketplace.com', // verified sender
      to: recipientEmail, // string required
      cc: 'davidmarinac@gmail.com',
      reply_to: recipientEmail,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send email', error });
    }

    console.log('✅ Email sent successfully:', data);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('❌ Exception while sending contact email:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { sendEmail };
