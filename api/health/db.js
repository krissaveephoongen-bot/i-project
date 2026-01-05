import postgres from 'postgres';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ status: 'error', message: 'Database URL not configured' });
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
      const result = await sql`SELECT NOW()`;
      await sql.end();
      
      return res.status(200).json({
        status: 'ok',
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('DB health check error:', error);
      return res.status(503).json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
};
