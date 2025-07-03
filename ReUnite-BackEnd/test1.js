// file: compareItems.js
const fs = require("fs");
const { compareImageDescriptions } = require("./calculateSimilarity.js");
const { createSendFoundItemEmailFunction } = require("./sendingEmail.js");
const sendEmail = createSendFoundItemEmailFunction();

// Read the JSON file
const rawData = fs.readFileSync("./fetched-items.json", "utf-8");
const items = JSON.parse(rawData);

// Extract descriptions
const itemresult = items.map((item) => ({
  id: item.id,
  description: item.description,
  title: item.title,
  foundLocation: item.foundLocation,
  foundDate: item.foundDate,
  imageUrl: item.imageUrl,
}));

const rawnotificationData = fs.readFileSync(
  "./fetched-notification.json",
  "utf-8"
);
const notification = JSON.parse(rawnotificationData);

// Extract descriptions
const notifresults = notification.map((notification) => ({
  email: notification.email,
  description: notification.description,
}));

notifresults.forEach((notification) => {
  const results = [];
  itemresult.forEach((item) => {
    const similarityScore = compareImageDescriptions(
      item.description,
      notification.description
    );

    results.push({
      notificationEmail: notification.email,
      itemId: item.id,
      similarity: similarityScore,
      title: item.title,
      description: item.description,
      foundLocation: item.foundLocation,
      foundDate: item.foundDate,
      imageUrl: item.imageUrl,
    });
  });

  const highSimilarityMatches = results.filter(
    (entry) => entry.similarity >= 60
  );

  const highestSimilarityMatch =
    highSimilarityMatches.length > 0
      ? highSimilarityMatches.reduce(
          (max, entry) => (entry.similarity > max.similarity ? entry : max),
          highSimilarityMatches[0]
        )
      : null;

  //send email
  console.log(highestSimilarityMatch);

  if (highestSimilarityMatch) {
    sendEmail(
      highestSimilarityMatch.notificationEmail,
      highestSimilarityMatch.description,
      {
        title: highestSimilarityMatch.title,
        description: highestSimilarityMatch.description,
        foundLocation: highestSimilarityMatch.foundLocation,
        foundDate: highestSimilarityMatch.foundDate,
        imageUrl: highestSimilarityMatch.imageUrl,
      }
    );
  }
});
