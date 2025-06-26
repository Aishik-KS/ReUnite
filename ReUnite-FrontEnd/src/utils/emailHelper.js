// sendClaimedItemWithEmailJS.js
import emailjs from "@emailjs/browser";

export function sendClaimedItemEmail(to, claimedItem) {
  const { title, dropLocation, imageUrl } = claimedItem;

  const templateParams = {
    email: to,
    title,
    drop_location: dropLocation,
    image_url: imageUrl,
  };

  return emailjs.send(
    "service_z5x9wiv", // e.g., service_m4sdg1j
    "template_4d6m4dl", // e.g., template_xd1abc9
    templateParams,
    "aOTkeuJIl7Jjkxe0g" // e.g., kI1hKabcdeFG123
  );
}
