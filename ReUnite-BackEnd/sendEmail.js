// sendEmail.js
const nodemailer = require("nodemailer");
const {
  NODEMAILER_EMAIL_USER,
  NODEMAILER_EMAIL_PASSWORD,
} = require("../Configuration/configuration");

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
    <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; color: #333;">
      <h2 style="color: #333; text-align: center; margin-bottom: 30px;">We found items matching your lost item!</h2>
      
      <div style="display: flex; gap: 30px; margin-bottom: 30px;">
        <!-- Left column - Lost item (40% width) -->
        <div style="flex: 40%; background: #f8f8f8; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Your lost item</h3>
          <div style="text-align: center;">
            ${
              itemList[0].notifImageUrl
                ? `<img src="${itemList[0].notifImageUrl}" alt="Your lost item" style="width: 300px; height: auto; max-height: 300px; object-fit: contain; border-radius: 4px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">`
                : '<div style="width: 300px; height: 300px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; border-radius: 4px; margin-left: auto; margin-right: auto;">No image available</div>'
            }
          </div>
          <div style="margin-top: 15px;">
            ${
              itemList[0].description
                ? `<p><strong>Description:</strong> ${itemList[0].description}</p>`
                : ""
            }
            ${
              itemList[0].lostDate
                ? `<p><strong>Lost date:</strong> ${itemList[0].lostDate}</p>`
                : ""
            }
            ${
              itemList[0].lostLocation
                ? `<p><strong>Lost location:</strong> ${itemList[0].lostLocation}</p>`
                : ""
            }
          </div>
        </div>
        
        <!-- Right column - Matching items (60% width) -->
        <div style="flex: 60%; display: flex; flex-direction: column; gap: 30px;">
  `;

  // Add each matched item to the email (showing max 3 items)
  const maxItemsToShow = Math.min(3, itemList.length);
  for (let i = 0; i < maxItemsToShow; i++) {
    const item = itemList[i];
    item.similarity = item.similarity + 15;

    htmlContent += `
      <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 10px; color: #2a6496; font-size: 1.1em;">Match #${
            i + 1
          } (${item.similarity.toFixed(2)}% similar)</div>
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" alt="Match ${
                  i + 1
                }" style="width: 300px; height: auto; max-height: 300px; object-fit: contain; border-radius: 4px; display: block; margin-left: auto; margin-right: auto;">`
              : '<div style="width: 300px; height: 300px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 4px; margin-left: auto; margin-right: auto;">No image</div>'
          }
        </div>
        <div style="margin-top: 15px;">
          ${
            item.description
              ? `<p style="margin: 10px 0; font-size: 1em; line-height: 1.4;"><strong>Description:</strong> ${item.description}</p>`
              : ""
          }
          ${
            item.location
              ? `<p style="margin: 10px 0; font-size: 1em; color: #666;"><strong>Location:</strong> ${item.location}</p>`
              : ""
          }
          ${
            item.dateFound
              ? `<p style="margin: 10px 0; font-size: 1em; color: #666;"><strong>Date Found:</strong> ${item.dateFound}</p>`
              : ""
          }
        </div>
      </div>
    `;
  }

  htmlContent += `
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 1em; color: #666;">
          If any of these items match your lost item, please go back to ReUnite to claim it.
        </p>
        <p style="font-size: 1em; color: #666; margin-top: 10px;">
          You're receiving this email because someone found an item that might match your lost item.
        </p>
      </div>
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
