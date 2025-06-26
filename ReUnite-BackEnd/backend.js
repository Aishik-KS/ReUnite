const express = require("express");
const admin = require("firebase-admin");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { compareImageDescriptions } = require("./calculateSimilarity");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.text()); // Receive String Inputs

// Firebase Admin SDK Initialization
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

    // Save to fetched-items.json
    const filePath = path.join(__dirname, "./fetched-items.json");
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    console.log(
      `[${new Date().toLocaleString()}] Saved ${
        items.length
      } items to ${filePath}`
    );
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
    // Save to fetched-notification.json
    const filePath = path.join(__dirname, "./fetched-notification.json");
    fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2));
    console.log(
      `[${new Date().toLocaleString()}] Saved ${
        notifications.length
      } notifications to ${filePath}`
    );
  } catch (error) {
    console.error("Error fetching from notifications:", error.stack || error);
  }
};
// Handle expiring notifications
const handleExpiration = async () => {
  try {
    const snapshot = await db.collection("notifications").get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let days = data.daysLeft;

      if (typeof days === "number") {
        days -= 1;

        if (days <= 0) {
          await db.collection("notifications").doc(doc.id).delete();
          console.log(`Deleted item ${doc.id} due to expiration`);
        } else {
          await db
            .collection("notifications")
            .doc(doc.id)
            .update({ daysLeft: days });
          console.log(`Updated item ${doc.id} to daysRemaining: ${days}`);
        }
      }
    }
  } catch (error) {
    console.error("Error handling expiration", error.stack || error);
  }
};

// Combined data fetch
const fetchAllData = async () => {
  console.log("Running full Firebase data fetch...");
  await fetchItemsFromFirebase();
  await fetchNotificationItems();
};

// Scheduled job: every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Scheduled job triggered");
  fetchAllData();
  handleExpiration();
});

// Routes
app.get("/", (req, res) => {
  res.send("Firebase Daily Fetch Server is running.");
});

// Manual Trigger Route
app.get("/fetch-now", async (req, res) => {
  await fetchAllData();
  res.send("Fetched all collections manually!");
});

// Manual Expiration Route
app.get("/handle-exp", async (req, res) => {
  await handleExpiration();
  res.send("Days left reduced");
});

// Image Searching Transfer
app.post("/process-string", (req, res) => {
  const targetImageDescription = req.body;
  console.log(targetImageDescription);
  // const targetImageDescription = "Red Wallet";

  const rawData = fs.readFileSync("./fetched-items.json", "utf-8");
  const items = JSON.parse(rawData);

  const results = items.map((item) => {
    const similarityScore = compareImageDescriptions(
      targetImageDescription,
      item.description
    );

    return {
      itemId: item.id,
      similarity: similarityScore,
      title: item.title,
      description: item.description,
      foundLocation: item.foundLocation,
      foundDate: item.foundDate,
      imageUrl: item.imageUrl,
    };
  });

  // Sort results by similarity score in descending order
  results.sort((a, b) => b.similarity - a.similarity);

  console.log(results);
  res.json({ results });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
