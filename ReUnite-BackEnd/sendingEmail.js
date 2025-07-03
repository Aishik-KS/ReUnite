const nodemailer = require("nodemailer");
const {
  NODEMAILER_EMAIL_USER,
  NODEMAILER_EMAIL_PASSWORD,
} = require("../Configuration/configuration");

function createSendFoundItemEmailFunction() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: NODEMAILER_EMAIL_USER,
      pass: NODEMAILER_EMAIL_PASSWORD,
    },
  });

  /**
   * Send a styled HTML email notifying a user about a possible found item.
   * @param {string} to - Recipient's email address
   * @param {string} userDescription - The description the user submitted
   * @param {object} foundItem - Object containing the found item details (title, description, foundLocation, foundDate, imageUrl)
   */
  function sendEmail(to, userDescription, foundItem) {
    const { title, description, foundLocation, foundDate, imageUrl } =
      foundItem;

    const logoUrl =
      "https://res.cloudinary.com/dhxgv7d1m/image/upload/v1750854289/ReUnite_Logo_xdd2gy.png";

    const mailOptions = {
      from: NODEMAILER_EMAIL_USER,
      to,
      subject: "ReUnite: A possible match for your lost item",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 8px;">
          <div style="text-align: left;">
            <img src="${logoUrl}" alt="ReUnite Logo" style="width: 94px; height: 100px; margin-bottom: 20px;" />
            <h1 style="color: #333;">ReUnite</h1>
          </div>
          <h2 style="color: #333;">Dear User,</h2>
          <p>We may have found an item that matches your description: <strong>"${userDescription}"</strong></p>

          <h3 style="color: #444;">🔍 Match Details:</h3>
          <ul style="line-height: 1.6;">
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Description:</strong> ${description}</li>
            <li><strong>Location Found:</strong> ${foundLocation}</li>
            <li><strong>Date Found:</strong> ${foundDate}</li>
          </ul>

          ${
            imageUrl
              ? `<div style="width: 150px; height: 150px; margin: 20px 0;"><img src="${imageUrl}" alt="Found Item Image" style="max-width: 100%; border-radius: 8px;" /></div>`
              : ""
          }

          <p>If this item belongs to you, please visit the ReUnite website.</p>

          <p style="margin-top: 30px;">Thank you,<br/>The ReUnite Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error("Error occurred:", error);
      }
      console.log("Email sent successfully:", info.response);
    });
  }

  return sendEmail;
}

module.exports = { createSendFoundItemEmailFunction };
