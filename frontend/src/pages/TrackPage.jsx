import React, { useState } from 'react';
import { trackReport } from '../services/api';

const STATUS_INFO = {
  'open':        { icon: '🟣', label: 'Open',        desc: 'Your report has been received and is awaiting review by authorities.' },
  'in-progress': { icon: '🟡', label: 'In Progress', desc: 'Authorities are actively investigating this report.' },
  'resolved':    { icon: '🟢', label: 'Resolved',    desc: 'This issue has been addressed and resolved.' },
  'rejected':    { icon: '🔴', label: 'Rejected',    desc: 'This report was reviewed but could not be acted upon.' },
};

export default function TrackPage() {
  const [token,   setToken]   = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!token.trim()) { setError('Please enter your tracking token.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await trackReport(token.trim());
      setResult(data);
    } catch (err) {
      setError(err.message.includes('404') || err.message.includes('not found')
        ? 'No report found for that token. Please check and try again.'
        : 'Error checking status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const info = result ? STATUS_INFO[result.status] || { icon: '❓', label: result.status, desc: '' } : null;

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '60px 24px' }}>
      <div className="page-header" style={{ textAlign: 'left', padding: '0 0 40px' }}>
        <h1>Track Your Report</h1>
        <p className="text-muted">Enter the token you received when you submitted your report to check its current status.</p>
      </div>

      <form onSubmit={handleTrack} id="track-form">
        <div className="form-group">
          <label className="form-label" htmlFor="token-input">Tracking Token</label>
          <input
            id="token-input"
            type="text"
            className="form-control"
            placeholder="e.g. a3f2c9b1d8e04f7a..."
            value={token}
            onChange={e => setToken(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
          />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
          id="track-submit-btn"
        >
          {loading ? '⏳ Checking…' : '🔍 Check Status'}
        </button>
      </form>

      {result && info && (
        <div className="card" style={{ marginTop: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{info.icon}</div>
            <div className={`status-badge status-${result.status}`} style={{ fontSize: '0.95rem', padding: '6px 20px' }}>
              {info.label}
            </div>
          </div>

          <p style={{ color: 'var(--color-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '24px' }}>
            {info.desc}
          </p>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            {[
              { label: 'Report ID',   value: `#${result.id}` },
              { label: 'Category',    value: result.category },
              { label: 'Submitted',   value: new Date(result.created_at).toLocaleString('en-RW') },
              { label: 'Last Update', value: new Date(result.updated_at).toLocaleString('en-RW') },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: '16px', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ minWidth: '110px', color: 'var(--color-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: '0.9rem' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: '32px', fontSize: '0.82rem' }}>
        🔒 Only you (with this token) can look up your specific report. No personal data is stored.
      </div>
    </div>
  );
}
