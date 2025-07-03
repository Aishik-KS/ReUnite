const admin = require("firebase-admin");
const serviceAccount = require("../Configuration/serviceAccountKey.json");

// Initialize only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = {
  db,
  admin,
};
