export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // TODO: Implement actual authentication
    // For now, return a mock response
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Mock successful login
    return res.status(200).json({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: email,
        name: 'Test User'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
