const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const connectionString = 'postgresql://neondb_owner:npg_34CqWyZkQhDU@ep-cool-cake-ad981u36-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const sql = fs.readFileSync('src/database/schema.sql', 'utf8');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    // Execute statements individually so existing objects don't abort the run.
    const statements = sql
      .split(/;\s*$/m)
      .join(';')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      try {
        await client.query(stmt);
      } catch (err) {
        // Ignore duplicates when schema already exists; surface other errors.
        if (err.code === '42P07' || err.code === '42710') continue;
        throw err;
      }
    }

    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log(res.rows);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('ERROR applying schema or querying tables', err);
  process.exit(1);
});
