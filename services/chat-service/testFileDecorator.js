require('dotenv').config();
const { db } = require('./src/config/firestore');

async function test() {
  const snapshot = await db.collectionGroup('messages').where('type', '==', 'file').limit(5).get();
  if (snapshot.empty) {
    console.log("No file messages found across all groups.");
    return;
  }
  snapshot.forEach(doc => {
    console.log(doc.ref.path, "=>", JSON.stringify(doc.data(), null, 2));
  });
}

test().then(() => process.exit(0)).catch(console.error);
