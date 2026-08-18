const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const MIGRATION_ORDER = [
  '001_users.sql',
  '002_profiles.sql',
  '003_add_verification_status.sql',
  '004_startup_school.sql',
  '005_pitches.sql',
  '006_dealroom.sql',
  '007_dealroom_messages.sql',
  '008_founder_profile_personal_fields.sql',
  '009_notifications.sql'
];

async function migrate() {
  for (const file of MIGRATION_ORDER) {
    const filePath = path.join(__dirname, '..', '..', 'database', 'migrations', file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running ${file}...`);
    await pool.query(sql);
  }
  console.log('All migrations applied.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});