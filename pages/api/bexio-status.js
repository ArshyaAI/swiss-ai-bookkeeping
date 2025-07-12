// ===================================
// pages/api/bexio-status.js - API Route
// ===================================

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if we have stored tokens in Vercel KV or environment
    const accessToken = process.env.BEXIO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.json({ connected: false });
    }

    // Test connection to Bexio
    const companyResponse = await fetch('https://api.bexio.com/2.0/company_profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (companyResponse.ok) {
      const company = await companyResponse.json();
      
      // Get accounts
      const accountsResponse = await fetch('https://api.bexio.com/2.0/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      const accounts = accountsResponse.ok ? await accountsResponse.json() : [];
      
      return res.json({
        connected: true,
        company,
        accounts
      });
    } else {
      return res.json({ connected: false });
    }
  } catch (error) {
    console.error('Bexio status check error:', error);
    return res.json({ connected: false });
  }
}
