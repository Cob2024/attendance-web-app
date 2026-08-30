import fs from 'fs';
import path from 'path';

/**
 * Automated Database Backup Utility for SmartAttend
 * Creates timestamped snapshots of the SQLite/PostgreSQL database in server/backups/
 */
async function runBackup() {
  const dbPath = path.resolve(__dirname, '../prisma/dev.db');
  const backupDir = path.resolve(__dirname, '../backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `smartattend_backup_${timestamp}.db`);

  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupFile);
    const stats = fs.statSync(backupFile);
    console.log(`✅ Database backup created successfully:`);
    console.log(`📁 Path: ${backupFile}`);
    console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
  } else {
    console.warn(`⚠️ Database file not found at ${dbPath}.`);
  }
}

runBackup();
