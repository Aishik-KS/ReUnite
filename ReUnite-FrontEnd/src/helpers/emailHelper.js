// sendClaimedItemWithEmailJS.js
import emailjs from "@emailjs/browser";
import {
  EMAILJS_API_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
} from "../../../Configuration/configuration";

export function sendClaimedItemEmail(to, claimedItem) {
  const { title, dropLocation, imageUrl } = claimedItem;

  const templateParams = {
    email: to,
    title,
    drop_location: dropLocation,
    image_url: imageUrl,
  };

  return emailjs.send(
    EMAILJS_SERVICE_ID, // e.g., service_m4sdg1j
    EMAILJS_TEMPLATE_ID, // e.g., template_xd1abc9
    templateParams,
    EMAILJS_API_KEY // e.g., kI1hKabcdeFG123
  );
}
