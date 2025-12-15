const { Client } = require('pg');

async function main() {
  const connectionString = 'postgresql://neondb_owner:npg_34CqWyZkQhDU@ep-cool-cake-ad981u36-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log(res.rows);
  await client.end();
}

main().catch((err) => {
  console.error('ERROR listing tables', err);
  process.exit(1);
});
