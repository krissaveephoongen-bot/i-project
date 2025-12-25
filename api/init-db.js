export default async function handler(req, res) {
  // Only allow in development or with secret token
  if (process.env.NODE_ENV === 'production' && req.headers['x-init-secret'] !== process.env.INIT_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { execSync } = require('child_process');
    
    // Push schema to database
    execSync('npx prisma db push --force-reset --skip-generate', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Seed database
    execSync('npx tsx prisma/seed.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Database initialized and seeded'
    });
  } catch (error) {
    console.error('Init DB error:', error);
    return res.status(500).json({ 
      error: 'Failed to initialize database',
      message: error.message 
    });
  }
}
