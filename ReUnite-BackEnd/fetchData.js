const fs = require("fs");
const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require("../Configuration/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Fetch from 'items' collection
const fetchItemsFromFirebase = async () => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Save to fetched-items.json asynchronously
    const filePath = path.join(__dirname, "./fetched-items.json");
    await fs.promises.writeFile(filePath, JSON.stringify(items, null, 2));
    console.log("Items data saved.");
  } catch (error) {
    console.error("Error fetching from Items:", error.stack || error);
  }
};

// Fetch from 'notifications' collection
const fetchNotificationItems = async () => {
  try {
    const snapshot = await db.collection("notifications").get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Save to fetched-notification.json asynchronously
    const filePath = path.join(__dirname, "./fetched-notification.json");
    await fs.promises.writeFile(
      filePath,
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
module.exports = { fetchItemsFromFirebase, fetchNotificationItems };
