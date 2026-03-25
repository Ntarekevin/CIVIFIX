import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('official');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register(username, password, fullName, role);
      localStorage.setItem('civifix_auth_token', data.token);
      localStorage.setItem('civifix_user', JSON.stringify(data.user));
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Registration failed');
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
            Civic<span className="text-primary italic font-outfit">FIX</span>
          </h1>
          <p className="text-gray-400 font-medium tracking-tight text-sm uppercase">Authority Registration</p>
        </div>

        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 text-sm text-center font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Full Name</label>
            <input
              type="text"
              className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
              placeholder="e.g. Jean de Dieu"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Authority Username</label>
            <input
              type="text"
              name="username"
              autocomplete="username"
              className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Official Role</label>
            <select
              className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="official">Field Official</option>
              <option value="authority">District Authority</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Secret Password</label>
            <input
              type="password"
              name="password"
              autocomplete="new-password"
              className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 dark:bg-primary hover:bg-black dark:hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold font-outfit shadow-xl shadow-gray-400/20 dark:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? 'Creating Account...' : 'Register as Official'}
          </button>
        </form>

        <div className="text-center">
            <p className="text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
