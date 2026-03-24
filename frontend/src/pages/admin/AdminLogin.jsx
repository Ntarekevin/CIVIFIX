import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      localStorage.setItem('civifix_auth_token', data.token);
      localStorage.setItem('civifix_user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '0 20px' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Admin Portal</h2>
        <p className="text-muted text-center" style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
          Restricted access. Use your authority credentials to log in.
        </p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
