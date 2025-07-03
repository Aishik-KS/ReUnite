//fetchData.js
const fs = require("fs");
const path = require("path"); // Add this
const { db } = require("../firebase-service");

// Use absolute paths or ensure relative paths are correct
const fetchedItemsDB = path.join(
  __dirname,
  "../FetchingData/fetched-items.json"
);
const fetchedNotificationsDB = path.join(
  __dirname,
  "../FetchingData/fetched-notification.json"
);

// Fetch from 'items' collection
const fetchItemsFromFirebase = async () => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    await fs.promises.writeFile(fetchedItemsDB, JSON.stringify(items, null, 2));
    console.log("Items data saved.");
  } catch (error) {
    console.error("Error fetching from Items:", error.stack || error);
  }
};

// Fetch from 'notifications' collection
const fetchNotificationsFromFirebase = async () => {
  try {
    const snapshot = await db.collection("notifications").get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Save to fetched-notification.json asynchronously
    // const filePath = path.join(__dirname, "./fetched-notification.json");
    await fs.promises.writeFile(
      fetchedNotificationsDB,
      JSON.stringify(notifications, null, 2)
    );
    console.log(
      `[${new Date().toLocaleString()}] Saved ${
        notifications.length
      } notifications.`
    );
  } catch (error) {
    console.error("Error fetching from notifications:", error.stack || error);
  }
};

// Export functions using CommonJS
module.exports = { fetchItemsFromFirebase, fetchNotificationsFromFirebase };
