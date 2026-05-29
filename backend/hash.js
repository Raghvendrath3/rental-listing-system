const bcrypt = require('bcrypt');

const password = 'YourSecureAdminPassword123!'; // Replace with your desired password
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("\n--- COPY THIS BCRYPT HASH ---");
    console.log(hash);
    console.log("-----------------------------\n");
});
$2b$12$K0j8w7R1sK0N9zK9jL4OWe7b3Z3H.S1bI2M6v5Jz8G1w5k2v3H1z2
$2b$12$yXHLFTCwUI5M2k1.OOGhGOPq0hJRS4INRAGGX.w2WeeNzjLAOSpYK