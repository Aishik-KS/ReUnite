const fs = require("fs");
const path = require("path");
const { compareImageDescriptions } = require("./calculateSimilarity.js");
const { createSendFoundItemEmailFunction } = require("./sendingEmail.js");

// Initialize email sending function
const sendEmail = createSendFoundItemEmailFunction();

// Load items from JSON
const itemsPath = path.join(__dirname, "../fetched-data/fetched-items.json");
const rawItemsData = fs.readFileSync(itemsPath, "utf-8");
const items = JSON.parse(rawItemsData);

// Load notifications from JSON
const notifPath = path.join(
  __dirname,
  "../fetched-data/fetched-notification.json"
);
const rawNotifData = fs.readFileSync(notifPath, "utf-8");
const notifications = JSON.parse(rawNotifData);

// Preprocess items
const itemResults = items.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  foundLocation: item.foundLocation,
  foundDate: item.foundDate,
  imageUrl: item.imageUrl,
}));

// Process each notification
notifications.forEach((notif) => {
  const comparisonResults = itemResults.map((item) => {
    const similarity = compareImageDescriptions(
      item.description,
      notif.description
    );

    return {
      notificationEmail: notif.email,
      itemId: item.id,
      similarity,
      title: item.title,
      description: item.description,
      foundLocation: item.foundLocation,
      foundDate: item.foundDate,
      imageUrl: item.imageUrl,
    };
  });

  // Filter items with similarity >= 60
  const highSimilarityMatches = comparisonResults.filter(
    (result) => result.similarity >= 60
  );

  // Pick the highest similarity match (if any)
  const bestMatch = highSimilarityMatches.length
    ? highSimilarityMatches.reduce((max, curr) =>
        curr.similarity > max.similarity ? curr : max
      )
    : null;

  // Send email if a match is found
  if (bestMatch) {
    console.log("Best match found:", bestMatch);
    sendEmail(bestMatch.notificationEmail, notif.description, {
      title: bestMatch.title,
      description: bestMatch.description,
      foundLocation: bestMatch.foundLocation,
      foundDate: bestMatch.foundDate,
      imageUrl: bestMatch.imageUrl,
    });
  }
});
