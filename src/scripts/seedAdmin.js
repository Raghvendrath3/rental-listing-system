// scripts/seedAdmin.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../db");

async function seedAdmin() {
  const hash = await bcrypt.hash("Admin@123", 12);

  await pool.query(
    `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, 'admin')
    ON CONFLICT (email) DO NOTHING
    `,
    ["admin@example.com", hash]
  );

  console.log("Admin seeded");
  process.exit();
}

seedAdmin();
