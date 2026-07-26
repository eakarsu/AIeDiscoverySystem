const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function main() {
  const email = String(process.env.DEMO_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.DEMO_PASSWORD || process.env.ADMIN_PASSWORD || '');
  if (!email || password.length < 12) throw new Error('Local demo credentials are incomplete');
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users(email,password_hash,full_name,role,firm_name,is_active) VALUES($1,$2,$3,'admin',$4,TRUE)
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,full_name=EXCLUDED.full_name,role='admin',is_active=TRUE`,
    [email, hash, 'Runtime Administrator', 'Local Demo'],
  );
  await pool.end();
  console.log('Provisioned local demo administrator.');
}
main().catch((error) => { console.error(error.message); process.exit(1); });
