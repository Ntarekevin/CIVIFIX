import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function LoginPage() {
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
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Login failed. Check your authority credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-bg-dark p-6">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-xl border dark:border-gray-800 space-y-8">
        <div className="text-center space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-primary transition-colors mb-4 inline-flex items-center gap-2 text-sm font-bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-4xl font-outfit font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
            Authority <span className="text-primary italic font-outfit">Portal</span>
          </h1>
          <p className="text-gray-400 font-medium tracking-tight text-sm uppercase">Restricted Access · Officials Only</p>
        </div>

        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 text-sm text-center font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Admin Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
                placeholder="Enter authority username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Secret Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 dark:bg-primary hover:bg-black dark:hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold font-outfit shadow-xl shadow-gray-400/20 dark:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? 'Verifying...' : 'Secure Authorization'}
          </button>
        </form>

        <div className="text-center pt-4">
            <p className="text-xs text-gray-400 italic">
                Authorized personnel only. All access is logged and monitored.
            </p>
        </div>
      </div>
    </div>
  );
}
