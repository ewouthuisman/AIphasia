// Vercel serverless endpoint: /api/log
// Plaats in root van je repo (api/log.js) en deploy naar Vercel.
// Zet in Vercel Secrets:
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({error: 'SUPABASE_URL of SUPABASE_SERVICE_KEY niet ingesteld'});
  }

  let logs;
  try {
    const body = req.body || {};
    logs = body.logs || body;
    if (!Array.isArray(logs)) {
      return res.status(400).json({error: 'Payload moet een array zijn, of {logs: [...]}'});
    }
  } catch (err) {
    return res.status(400).json({error: 'Ongeldige JSON payload'});
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tap_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(logs)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({error: 'Supabase error', details: text});
    }

    return res.status(200).json({status: 'ok', inserted: logs.length});
  } catch (error) {
    return res.status(500).json({error: 'Server error', details: error.message});
  }
}
