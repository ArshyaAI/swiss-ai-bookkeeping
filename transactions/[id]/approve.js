// ===================================
// pages/api/transactions/[id]/approve.js
// ===================================

export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Find and update transaction (this would be a database query in production)
  const transaction = transactions.find(t => t.id === parseInt(id));
  if (transaction) {
    transaction.status = 'approved';
    return res.json({ success: true });
  }
  
  return res.status(404).json({ error: 'Transaction not found' });
}
