// A script to seed the database with some initial data.
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { courts, courtAvailability } = require('../dist/lib/data');

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
    const courtRef = db.collection('courts').doc(court.id);
    await courtRef.set(court);
    console.log(`Seeded court: ${court.name}`);

    // Seed availability for each court
    const availabilityPromises = Object.entries(courtAvailability).map(
      ([dateKey, availabilityData]) => {
        const availabilityRef = courtRef.collection('availability').doc(dateKey);
        console.log(`Seeding availability for ${court.name} on ${dateKey}`);
        return availabilityRef.set(availabilityData);
      }
    );
    return Promise.all(availabilityPromises);
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
// 2. Run `npm run build` to compile the data file.
// 3. Run `npm run seed`.
