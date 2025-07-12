// ===================================
// pages/api/connect-bexio.js - OAuth Start
// ===================================

export default function handler(req, res) {
  const clientId = process.env.BEXIO_CLIENT_ID;
  const redirectUri = process.env.BEXIO_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Bexio credentials not configured' });
  }

  const state = Math.random().toString(36).substring(7);
  const scope = 'general kb_invoice kb_order article contact manual_entries offline_access';
  
  const authUrl = `https://auth.bexio.com/realms/bexio/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}`;

  res.redirect(authUrl);
}
