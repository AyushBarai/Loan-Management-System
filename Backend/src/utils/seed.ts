/**
 * SEED SCRIPT
 * Run: npm run seed
 * Creates one account per role with known credentials.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const SEED_USERS = [
  { name: 'Admin User',        email: 'admin@lms.com',        password: 'Admin@123',        role: 'admin' },
  { name: 'Sales Executive',   email: 'sales@lms.com',        password: 'Sales@123',        role: 'sales' },
  { name: 'Sanction Officer',  email: 'sanction@lms.com',     password: 'Sanction@123',     role: 'sanction' },
  { name: 'Disburse Officer',  email: 'disburse@lms.com',     password: 'Disburse@123',     role: 'disbursement' },
  { name: 'Collection Agent',  email: 'collection@lms.com',   password: 'Collection@123',   role: 'collection' },
  { name: 'Test Borrower',     email: 'borrower@lms.com',     password: 'Borrower@123',     role: 'borrower' },
] as const;

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const userData of SEED_USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⏭️  Skipping ${userData.email} — already exists`);
        continue;
      }
      await User.create(userData);
      console.log(`✅ Created: ${userData.role} — ${userData.email} / ${userData.password}`);
    }

    console.log('\n📋 Login credentials:');
    console.table(SEED_USERS.map(({ email, password, role }) => ({ role, email, password })));
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();