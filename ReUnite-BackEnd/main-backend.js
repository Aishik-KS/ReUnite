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
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require("../Configuration/configuration");

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

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

const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extract public ID from the URL
    const publicId = imageUrl.split("/").pop().split(".")[0];

    // Delete the image
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log(`Successfully deleted image: ${publicId}`);
      return true;
    } else {
      console.log(`Failed to delete image: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
};

const handleItemsExpiry = async () => {
  try {
    const snapshot = await db.collection("items").get();
    // Loop over each document in the snapshot
    snapshot.forEach(async (doc) => {
      const data = doc.data();
      let daysLeft = data.daysLeft;

      if (daysLeft <= 0) {
        await deleteImageFromCloudinary(data.imageUrl);
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
        await deleteImageFromCloudinary(data.imageUrl);
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

app.get("/delete-items", async (req, res) => {
  try {
    const snapshot = await db.collection("items").get();

    // Loop over each document in the snapshot
    snapshot.forEach(async (doc) => {
      await db.collection("items").doc(doc.id).delete();
    });
  } catch (error) {
    console.error("Error handling expiration: ", error);
  }
});

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
    console.log(targetImageDescription);
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
    console.log(scoredItemsList);
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
