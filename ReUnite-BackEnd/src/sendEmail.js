// sendEmail.js
const nodemailer = require("nodemailer");
const {
  NODEMAILER_EMAIL_USER,
  NODEMAILER_EMAIL_PASSWORD,
} = require("../../Configuration/configuration");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_EMAIL_USER,
    pass: NODEMAILER_EMAIL_PASSWORD,
  },
});

const sendEmail = async (sendTo, itemList) => {
  // Check if there are any items to send
  if (!itemList || itemList.length === 0) {
    console.log("No items to send in email");
    return;
  }

  // Create HTML content for the email
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">We found items matching your lost item!</h2>
      
      <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0;">Your lost item:</h3>
        ${
          itemList[0].notifImageUrl
            ? `<img src="${itemList[0].notifImageUrl}" alt="Your lost item" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">`
            : "<p>No image available</p>"
        }
      </div>
      
      <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Top ${
        itemList.length
      } matching items:</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
  `;

  // Add each matched item to the email
  itemList.forEach((item, index) => {
    item.similarity = item.similarity + 15;
    htmlContent += `
      <div style="background: white; border: 1px solid #ddd; border-radius: 5px; padding: 10px; text-align: center;">
        <div style="font-weight: bold; margin-bottom: 5px;">Match #${
          index + 1
        } (${item.similarity.toFixed(2)}%)</div>
        ${
          item.imageUrl
            ? `<img src="${item.imageUrl}" alt="Match ${
                index + 1
              }" style="max-width: 100%; height: auto; max-height: 150px; border-radius: 4px; margin-bottom: 8px;">`
            : '<div style="height: 150px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">No image</div>'
        }
        ${
          item.location
            ? `<div style="font-size: 0.9em; color: #666;">📍 ${item.location}</div>`
            : ""
        }
        ${
          item.dateFound
            ? `<div style="font-size: 0.8em; color: #888;">🗓 ${item.dateFound}</div>`
            : ""
        }
      </div>
    `;
  });

  htmlContent += `
      </div>
      <p style="margin-top: 20px; font-size: 0.9em; color: black;">
        If any of these items match your lost item, please go back to ReUnite and claim the item.
      </p>
    </div>
  `;

  // Email options
  const mailOptions = {
    from: NODEMAILER_EMAIL_USER,
    to: sendTo,
    subject: "We found items matching your lost item!",
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to: ", mailOptions.to, " Status:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
