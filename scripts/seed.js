
// A script to seed the database with some initial data.
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
// The 'courts' data now depends on the compiled output from 'dist'
const { courts } = require('../dist/lib/data');

async function seed() {
  console.log('Seeding database...');
  
  // No-op if firebase is not configured
  if (!process.env.GCLOUD_PROJECT) {
    console.error('Firebase project not configured. Skipping seed.');
    return;
  }
  
  initializeApp({
    projectId: process.env.GCLOUD_PROJECT,
  });

  const db = getFirestore();

  // Seed courts
  const courtPromises = courts.map(async (court) => {
    // A real app should use a secure way to get the ownerId,
    // for this seed script, we'll skip courts without a placeholder ownerId
    if (!court.ownerId || court.ownerId === 'REPLACE_WITH_REAL_OWNER_UID') {
      console.warn(`Skipping court "${court.name}" due to missing ownerId.`);
      return;
    }
    const courtRef = db.collection('courts').doc(court.id);
    await courtRef.set(court);
    console.log(`Seeded court: ${court.name}`);
  });

  await Promise.all(courtPromises);

  console.log('Database seeded successfully!');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

// To run this script:
// 1. Make sure you are authenticated with firebase-tools: `firebase login`
// 2. Edit `src/lib/data.ts` to replace 'REPLACE_WITH_REAL_OWNER_UID' with a real UID.
// 3. Run `npm run build` to compile the data file.
// 4. Run `npm run seed`.
