
// ===================================
// pages/index.js - Hauptseite
// ===================================

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [bexioConnected, setBexioConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lade Status beim Start
  useEffect(() => {
    checkBexioStatus();
    loadTransactions();
  }, []);

  const checkBexioStatus = async () => {
    try {
      const response = await fetch('/api/bexio-status');
      const data = await response.json();
      setBexioConnected(data.connected);
      setCompanyInfo(data.company);
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error checking Bexio status:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const connectToBexio = () => {
    window.location.href = '/api/connect-bexio';
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const transactionData = {
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount')),
      date: formData.get('date')
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      
      if (response.ok) {
        loadTransactions();
        e.target.reset();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
    setLoading(false);
  };

  const approveTransaction = async (id) => {
    try {
      await fetch(`/api/transactions/${id}/approve`, { method: 'POST' });
      loadTransactions();
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const syncToBexio = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}/sync`, { method: 'POST' });
      if (response.ok) {
        loadTransactions();
        alert('✅ Transaction zu Bexio gesendet!');
      } else {
        alert('❌ Fehler beim Senden zu Bexio');
      }
    } catch (error) {
      console.error('Error syncing to Bexio:', error);
    }
  };

  return (
    <>
      <Head>
        <title>🇨🇭 Swiss AI Bookkeeping Agent</title>
        <meta name="description" content="Automated bookkeeping with Bexio integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', margin: 0, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            padding: '30px', 
            borderRadius: '10px', 
            marginBottom: '30px', 
            textAlign: 'center' 
          }}>
            <h1>🇨🇭 Swiss AI Bookkeeping Agent</h1>
            <p>Automatisierte Buchhaltung mit Bexio Integration - Vercel Edition!</p>
          </div>

          {/* Bexio Connection Status */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h2>🔗 Bexio Verbindung</h2>
            {bexioConnected ? (
              <div style={{ background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                ✅ <strong>Mit Bexio verbunden!</strong><br />
                {companyInfo && `Firma: ${companyInfo.name}`}<br />
                Konten synchronisiert: {accounts.length}
              </div>
            ) : (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                ❌ <strong>Nicht mit Bexio verbunden</strong><br />
                Verbinden Sie Ihr Bexio-Konto für automatisierte Buchhaltung
              </div>
            )}
            
            {!bexioConnected && (
              <button 
                onClick={connectToBexio}
                style={{ 
                  background: '#007bff', 
                  color: 'white', 
                  padding: '12px 24px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                🔗 Mit Bexio verbinden
              </button>
            )}
          </div>

          {/* Add Transaction */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h2>➕ Test-Transaktion hinzufügen</h2>
            <form onSubmit={addTransaction}>
              <div style={{ marginBottom: '15px' }}>
                <label>Beschreibung:</label>
                <input 
                  type="text" 
                  name="description" 
                  placeholder="z.B. Shopify Verkaufszahlung"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', boxSizing: 'border-box' }}
                  required 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Betrag (CHF):</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="amount" 
                  placeholder="z.B. 1500.00"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', boxSizing: 'border-box' }}
                  required 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Datum:</label>
                <input 
                  type="date" 
                  name="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', boxSizing: 'border-box' }}
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  padding: '12px 24px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                🤖 {loading ? 'Verarbeitung...' : 'Hinzufügen & KI-Kategorisierung'}
              </button>
            </form>
          </div>

          {/* Transactions List */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h2>📋 Transaktionen</h2>
            {transactions.map(transaction => (
              <div 
                key={transaction.id}
                style={{ 
                  border: '1px solid #dee2e6', 
                  padding: '15px', 
                  margin: '10px 0', 
                  borderRadius: '6px',
                  borderLeft: `4px solid ${
                    transaction.status === 'pending' ? '#ffc107' :
                    transaction.status === 'approved' ? '#28a745' : '#17a2b8'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{transaction.description}</strong><br />
                    <small>{transaction.date} • CHF {transaction.amount?.toFixed(2)}</small>
                    {transaction.predicted_account && (
                      <div style={{ background: '#e3f2fd', padding: '8px', borderRadius: '4px', margin: '8px 0' }}>
                        🤖 KI-Vorschlag: Konto {transaction.predicted_account} 
                        (Vertrauen: {Math.round(transaction.confidence * 100)}%)
                      </div>
                    )}
                  </div>
                  <div>
                    {transaction.status === 'pending' && (
                      <button 
                        onClick={() => approveTransaction(transaction.id)}
                        style={{ background: '#28a745', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: '2px' }}
                      >
                        ✅ Genehmigen
                      </button>
                    )}
                    {transaction.status === 'approved' && bexioConnected && (
                      <button 
                        onClick={() => syncToBexio(transaction.id)}
                        style={{ background: '#007bff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: '2px' }}
                      >
                        📤 An Bexio senden
                      </button>
                    )}
                    {transaction.status === 'synced' && (
                      <span style={{ color: '#17a2b8' }}>✅ Zu Bexio synchronisiert</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart of Accounts */}
          {accounts.length > 0 && (
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h2>📊 Kontenplan (Von Bexio synchronisiert)</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Konto #</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Typ</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.slice(0, 10).map(account => (
                    <tr key={account.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{account.account_number}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{account.name}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{account.account_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {accounts.length > 10 && (
                <p><em>Zeige erste 10 Konten. Total: {accounts.length}</em></p>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
            <p>🚀 Powered by AI • Made for Swiss SMEs • Hosted on Vercel</p>
          </div>
        </div>
      </div>
    </>
  );
}
