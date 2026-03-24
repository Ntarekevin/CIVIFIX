import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Signup failed');

      localStorage.setItem('civifix_auth_token', data.token);
      localStorage.setItem('civifix_user', JSON.stringify(data.user));
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-bg-dark p-6">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-xl border dark:border-gray-800 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-outfit font-bold text-gray-900 dark:text-white">
            Join <span className="text-primary italic">Civic</span>FIX
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">Become a verified resident today.</p>
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
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Username</label>
            <input
              type="text"
              className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
              placeholder="Pick a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Password</label>
            <input
              type="password"
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
            className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold font-outfit shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div className="text-center">
            <p className="text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium tracking-tight">
          By joining, you agree to our <span className="underline">Terms of Service</span>.
      </p>
    </div>
  );
}
