const fs = require("fs");
const { compareImageDescriptions } = require("./calculateSimilarity.js");
const {
  fetchNotificationItems,
  fetchItemsFromFirebase,
} = require("./fetchData.js");
const { sendEmail } = require("./src/sendEmail.js");

// Fetch Items DB and Notifications DB asynchronously
async function fetchAndProcessData() {
  await fetchItemsFromFirebase();
  const rawItemsData = await fs.promises.readFile(
    "./fetched-items.json",
    "utf-8"
  );
  const itemsDB = JSON.parse(rawItemsData);

  await fetchNotificationItems();
  const rawNotificationsData = await fs.promises.readFile(
    "./fetched-notification.json",
    "utf-8"
  );
  const notificationsDB = JSON.parse(rawNotificationsData);

  // Process each notification and compare with items
  for (const notification of notificationsDB) {
    const scoredItemsList = [];

    itemsDB.forEach((item) => {
      const similarityScore = compareImageDescriptions(
        item.description,
        notification.description
      );

      item.similarity = similarityScore;
      item.notifDescription = notification.description;
      item.notifImageUrl = notification.imageUrl;
      scoredItemsList.push(item);
    });

    const matchedItemsList = scoredItemsList.sort(
      (a, b) => b.similarity - a.similarity
    );
    const sendingList = matchedItemsList.slice(0, 3);

    sendEmail(notification.email, sendingList);

    // This will now work to exit after first notification
    break;
  }
  //   notificationsDB.forEach((notification) => {
  //     const scoredItemsList = [];

  //     itemsDB.forEach((item) => {
  //       // Compare and Give a Score
  //       const similarityScore = compareImageDescriptions(
  //         item.description,
  //         notification.description
  //       );

  //       // Add Score to the item based on the notification
  //       item.similarity = similarityScore;
  //       item.notifDescription = notification.description;
  //       item.notifImageUrl = notification.imageUrl;
  //       // Push Item to items list
  //       scoredItemsList.push(item);
  //     });

  //     // Sort them in descending order
  //     const matchedItemsList = scoredItemsList.sort(
  //       (a, b) => b.similarity - a.similarity
  //     );
  //     // Extract At Most top 3
  //     const sendingList = matchedItemsList.slice(0, 3);

  //     // console.log(sendingList);
  //     sendEmail(notification.email, sendingList);

  //     // Test on first notification
  //   });
}

// Fetch and process data
fetchAndProcessData();
