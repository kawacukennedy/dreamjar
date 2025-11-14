const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function runMigrations() {
  await mongoose.connect(process.env.MONGO_URI);

  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith(".js")) {
      const migration = require(path.join(migrationsDir, file));
      console.log(`Running migration: ${file}`);
      await migration.up();
    }
  }

  console.log("All migrations completed");
  process.exit(0);
}

async function rollbackMigrations() {
  await mongoose.connect(process.env.MONGO_URI);

  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs.readdirSync(migrationsDir).sort().reverse();

  for (const file of files) {
    if (file.endsWith(".js")) {
      const migration = require(path.join(migrationsDir, file));
      console.log(`Rolling back migration: ${file}`);
      await migration.down();
      break; // Rollback only the last one
    }
  }

  console.log("Migration rollback completed");
  process.exit(0);
}

const command = process.argv[2];
if (command === "rollback") {
  rollbackMigrations();
} else {
  runMigrations();
}
