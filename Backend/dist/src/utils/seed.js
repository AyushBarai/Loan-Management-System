"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SEED SCRIPT
 * Run: npm run seed
 * Creates one account per role with known credentials.
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
dotenv_1.default.config();
const SEED_USERS = [
    { name: 'Admin User', email: 'admin@lms.com', password: 'Admin@123', role: 'admin' },
    { name: 'Sales Executive', email: 'sales@lms.com', password: 'Sales@123', role: 'sales' },
    { name: 'Sanction Officer', email: 'sanction@lms.com', password: 'Sanction@123', role: 'sanction' },
    { name: 'Disburse Officer', email: 'disburse@lms.com', password: 'Disburse@123', role: 'disbursement' },
    { name: 'Collection Agent', email: 'collection@lms.com', password: 'Collection@123', role: 'collection' },
    { name: 'Test Borrower', email: 'borrower@lms.com', password: 'Borrower@123', role: 'borrower' },
];
async function seed() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        for (const userData of SEED_USERS) {
            const existing = await User_1.User.findOne({ email: userData.email });
            if (existing) {
                console.log(`⏭️  Skipping ${userData.email} — already exists`);
                continue;
            }
            await User_1.User.create(userData);
            console.log(`✅ Created: ${userData.role} — ${userData.email} / ${userData.password}`);
        }
        console.log('\n📋 Login credentials:');
        console.table(SEED_USERS.map(({ email, password, role }) => ({ role, email, password })));
    }
    catch (err) {
        console.error('❌ Seed failed:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
seed();
