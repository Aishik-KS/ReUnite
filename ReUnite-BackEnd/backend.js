const express = require('express');
const admin = require('firebase-admin');
const cron = require('node-cron');
const app = express();
const PORT = 3000;
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to fetch from 'Items' collection and save to fetched-items.json
const fetchItemsFromFirebase = async () => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const filePath = path.join(__dirname, 'fetched-items.json');
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    console.log(`[${new Date().toLocaleString()}] Saved ${items.length} items to ${filePath}`);
  } catch (error) {
    console.error('Error fetching from Items:', error.stack || error);
  }
};

// Function to fetch from 'items' collection and save to fetched-notification.json
const fetchNotificationItems = async () => {
  try {
    const snapshot = await db.collection('notifications').get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const filePath = path.join(__dirname, 'fetched-notification.json');
    fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2));
    console.log(`[${new Date().toLocaleString()}] Saved ${notifications.length} notifications to ${filePath}`);
  } catch (error) {
    console.error('Error fetching from items:', error.stack || error);
  }
};

// Combined fetch function
const fetchAllData = async () => {
  console.log('Running full Firebase data fetch...');
  await fetchItemsFromFirebase();
  await fetchNotificationItems();
};

// Schedule job: Run once a day at 1:00 AM
cron.schedule('0 1 * * *', () => {
  console.log('Scheduled job triggered');
  fetchAllData();

  // loop trough each item and check days remaining attribut and -1
  //if days remaining=0,delete from firebase
});

// Root route
app.get('/', (req, res) => {
  res.send('Firebase Daily Fetch Server is running.');
});

// Manual trigger route
app.get('/fetch-now', async (req, res) => {
  await fetchAllData();
  res.send('Fetched all collections manually!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
