require('dotenv').config();
const { sql } = require('@vercel/postgres');
async function check() {
  try {
    const res = await sql`SELECT * FROM users;`;
    console.log('Success! Users found: ' + res.rows.length);
  } catch(e) {
    console.error('Query failed!', e);
  }
}
check();
