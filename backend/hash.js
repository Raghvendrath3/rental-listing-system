const bcrypt = require('bcrypt');

const password = process.argv[2];
const saltRounds = 12;

if (!password) {
  console.error("❌ Error: No password string provided to hash.");
  console.log("👉 Usage: node hash.js <password_string>");
  process.exit(1);
}

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("❌ Hashing failed:", err);
    return;
  }
  console.log("\n--- 🔐 BCRYPT HASH GENERATED ---");
  console.log(hash);
  console.log("---------------------------------\n");
});