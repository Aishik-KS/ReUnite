// file: compareItems.js
const fs = require('fs');
const { compareImageDescriptions } = require('./calculateSimilarity.js');
const { createSendFoundItemEmailFunction } = require('./sendingEmail.js');
const sendEmail = createSendFoundItemEmailFunction();

// function filterItemsByDescriptionSimilarity(items, targetText, calculateSimilarity, threshold = 0.9) {
//   return items.filter(item => {
//     const similarity = similarityFn(item.description, targetText);
//     return similarity >= threshold;
//   });
// }

// const calcsimilarity = (itemDescription,notificationDescription) =>{
//     const randomInt = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
//     return randomInt;
// }

// Read the JSON file
const rawData = fs.readFileSync('./fetched-items.json', 'utf-8');
const items = JSON.parse(rawData);

// Extract descriptions
const itemresult = items.map(item => ({
  id: item.id,
  description: item.description,
  title: item.title,
  foundLocation: item.foundLocation,
  foundDate: item.foundDate,
  imageUrl: item.imageUrl
}));

//for notification
// Read the JSON file
const rawnotificationData = fs.readFileSync('./fetched-notification.json', 'utf-8');
const notification = JSON.parse(rawnotificationData);

// Extract descriptions
const notifresults = notification.map(notification => ({
  email: notification.email,
  description: notification.description
}));



notifresults.forEach(notification => {
  const results=[];  
  itemresult.forEach(item => {
    const similarityScore = compareImageDescriptions(item.description, notification.description);

    results.push({
      notificationEmail: notification.email,
      itemId: item.id,
      similarity: similarityScore,
      title:item.title,
      description: item.description,
      foundLocation: item.foundLocation,
      foundDate: item.foundDate,
      imageUrl: item.imageUrl
    });
  });
//   const highSimilarityMatches = results.filter(entry => entry.similarity >= 90);
//   const highestSimilarityMatch = highSimilarityMatches.reduce((max, entry) =>
//   entry.similarity > max.similarity ? entry : max, results[0]);

  const highSimilarityMatches = results.filter(entry => entry.similarity >= 60);

const highestSimilarityMatch = highSimilarityMatches.length > 0
  ? highSimilarityMatches.reduce((max, entry) =>
      entry.similarity > max.similarity ? entry : max, highSimilarityMatches[0])
  : null;
  
  //send email
  console.log(highestSimilarityMatch);
  if (highestSimilarityMatch) {
  // Assuming you have a function like this:
  // sendEmail(to, userDescription, matchedItem)
  sendEmail(
    highestSimilarityMatch.notificationEmail,
    highestSimilarityMatch.description, // Replace with your actual input
    {
      title: highestSimilarityMatch.title,
      description: highestSimilarityMatch.description,
     foundLocation: highestSimilarityMatch.foundLocation,
     foundDate: highestSimilarityMatch.foundDate,
    imageUrl: highestSimilarityMatch.imageUrl
}
  );
}

});



// highSimilarityMatches.forEach()

// sendEmail("hauntedfrost12@gmail.com", "pink water bottle with stickers", {
//   title: "Pink Water Bottle",
//   description: "Pink bottle with cartoon stickers",
//   foundLocation: "Library",
//   foundDate: "2025-06-25",
//   imageUrl: "https://example.com/image.jpg"
// });



