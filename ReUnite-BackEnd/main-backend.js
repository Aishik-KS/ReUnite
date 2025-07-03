//main-backend.js
const express = require("express");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path"); // Add this

const cors = require("cors");
const { compareImageDescriptions } = require("./calculateSimilarity");
const { fetchNotificationsFromFirebase } = require("./FetchingData/fetchData");
const { fetchItemsFromFirebase } = require("./FetchingData/fetchData");
const { db } = require("./firebase-service");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.text());

const fetchedItemsDB = path.join(
  __dirname,
  "FetchingData/fetched-items.json" // Changed from ../ to same directory
);
const fetchedNotificationsDB = path.join(
  __dirname,
  "FetchingData/fetched-notification.json"
);

const handleItemsExpiry = async () => {
  try {
    const snapshot = await db.collection("items").get();

    // Loop over each document in the snapshot
    snapshot.forEach(async (doc) => {
      const data = doc.data();
      let daysLeft = data.daysLeft;

      if (daysLeft <= 0) {
        // Delete from DB
        await db.collection("items").doc(doc.id).delete();
        console.log(`Deleted item ${doc.id}`);
      } else {
        // Decrement daysLeft by 1 and update the document
        const updatedDaysLeft = daysLeft - 1;
        await db
          .collection("items")
          .doc(doc.id)
          .update({ daysLeft: updatedDaysLeft });
        console.log(`Updated DaysLeft to ${updatedDaysLeft} for ${doc.id}`);
      }
    });
  } catch (error) {
    console.error("Error handling expiration: ", error);
  }
};

const handleNotificationExpiry = async () => {
  try {
    const snapshot = await db.collection("notifications").get();

    // Loop over each document in the snapshot
    snapshot.forEach(async (doc) => {
      const data = doc.data();
      const daysLeft = data.daysLeft;

      if (daysLeft <= 0) {
        // Delete from DB
        await db.collection("notifications").doc(doc.id).delete();
        console.log(`Deleted item ${doc.id}`);
      } else {
        // Decrement daysLeft by 1 and update the document
        const updatedDaysLeft = daysLeft - 1;
        await db
          .collection("notifications")
          .doc(doc.id)
          .update({ daysLeft: updatedDaysLeft });
        console.log(`Updated DaysLeft to ${updatedDaysLeft} for ${doc.id}`);
      }
    });
  } catch (error) {
    console.error("Error handling expiration: ", error);
  }
};

app.get("/handle-exp", async (req, res) => {
  await handleNotificationExpiry();
  await handleItemsExpiry();
  res.send("Days left reduced");
});

// Image Searching Transfer
app.post("/process-string", async (req, res) => {
  try {
    await fetchItemsFromFirebase();
    const rawItemsData = await fs.promises.readFile(fetchedItemsDB, "utf-8");
    const itemsDB = JSON.parse(rawItemsData);

    const targetImageDescription = req.body;

    const scoredItemsList = itemsDB.map((item) => {
      const similarityScore = compareImageDescriptions(
        item.description,
        targetImageDescription
      );

      return {
        ...item,
        similarity: similarityScore,
      };
    });

    scoredItemsList.sort((a, b) => b.similarity - a.similarity);
    res.json(scoredItemsList); // Send response to client
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
