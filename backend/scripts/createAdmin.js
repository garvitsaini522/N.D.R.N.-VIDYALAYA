/**
 * N.D.R.N. Vidyalaya - Administrator Provisioning CLI Script
 *
 * Usage:
 *   node scripts/createAdmin.js --name "School Administrator" --email "admin@ndrn.local" --password "SecurePass123!"
 *
 * Or interactively prompted.
 */

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

async function setupAdmin() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const name = getArg('--name') || process.env.INITIAL_ADMIN_NAME || 'School Administrator';
  const email = (getArg('--email') || process.env.INITIAL_ADMIN_EMAIL || 'ueyuwhw@gmail.com').toLowerCase().trim();
  const password = getArg('--password') || process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Ndrn2026';
  const phone = getArg('--phone') || process.env.INITIAL_ADMIN_PHONE || '8429231617';

  console.log('Connecting to MongoDB database...');
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('Connected to MongoDB successfully.');

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`User with email "${email}" already exists with role: "${existing.role}".`);
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`Promoted user "${email}" to administrator role.`);
      }
      process.exit(0);
    }

    const adminUser = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin',
      status: 'active',
    });

    console.log('====================================================');
    console.log('Administrator account successfully created:');
    console.log(`  ID:    ${adminUser._id}`);
    console.log(`  Name:  ${adminUser.name}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Role:  ${adminUser.role}`);
    console.log('====================================================');
  } catch (err) {
    console.error('Failed to create administrator account:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

setupAdmin();
