// ===================================
// pages/api/transactions/index.js - Transactions API
// ===================================

// In-memory storage for demo (use database in production)
let transactions = [];
let nextId = 1;

// Simple AI categorization
function categorizeTransaction(description, amount) {
  const desc = description.toLowerCase();
  
  if (/shopify|sales|payment|revenue|customer|order/.test(desc)) {
    return { account: 3000, confidence: 0.95 };
  }
  if (/office|supplies|rent|utilities|expense/.test(desc)) {
    return { account: 6000, confidence: 0.90 };
  }
  if (/inventory|supplier|purchase|materials/.test(desc)) {
    return { account: 4000, confidence: 0.85 };
  }
  if (/fee|interest|bank|twint|stripe/.test(desc)) {
    return { account: 6500, confidence: 0.80 };
  }
  
  return { account: 6000, confidence: 0.60 };
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ transactions });
  }
  
  if (req.method === 'POST') {
    const { description, amount, date } = req.body;
    
    const { account, confidence } = categorizeTransaction(description, amount);
    
    const transaction = {
      id: nextId++,
      description,
      amount,
      date,
      predicted_account: account,
      confidence,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    transactions.push(transaction);
    
    return res.json({ transaction });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

