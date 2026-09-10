/**
 * Standalone Database Seeder Script
 * Run with: node server/seed.js
 */

import { initDatabase, seedInitialData } from './config/db.js';

async function runSeed() {
  console.log('🌱 Starting Database Seeding...');
  await initDatabase();
  await seedInitialData();
  console.log('✅ Seeding completed successfully!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
