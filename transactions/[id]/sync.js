
// ===================================
// pages/api/transactions/[id]/sync.js - Sync to Bexio
// ===================================

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const transaction = transactions.find(t => t.id === parseInt(id));
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  const accessToken = process.env.BEXIO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(400).json({ error: 'Bexio not connected' });
  }
  
  try {
    // Create journal entry in Bexio
    const entryData = {
      date: transaction.date,
      reference_nr: `AI-${transaction.id}`,
      text: transaction.description,
      entries: [
        {
          account_id: transaction.amount > 0 ? 1020 : transaction.predicted_account, // Bank or expense
          debit: transaction.amount > 0 ? Math.abs(transaction.amount) : 0,
          credit: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
          text: transaction.description
        },
        {
          account_id: transaction.amount > 0 ? transaction.predicted_account : 1020, // Revenue or bank
          debit: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
          credit: transaction.amount > 0 ? Math.abs(transaction.amount) : 0,
          text: transaction.description
        }
      ]
    };
    
    const response = await fetch('https://api.bexio.com/2.0/kb_manual_entries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(entryData)
    });
    
    if (response.ok) {
      const result = await response.json();
      transaction.status = 'synced';
      transaction.bexio_entry_id = result.id;
      
      return res.json({ success: true, bexio_entry_id: result.id });
    } else {
      const error = await response.text();
      console.error('Bexio sync error:', error);
      return res.status(500).json({ error: 'Failed to sync to Bexio' });
    }
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Failed to sync to Bexio' });
  }
}
