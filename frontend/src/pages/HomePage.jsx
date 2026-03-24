import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg-dark flex items-center justify-center p-6 font-inter">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Welcome & Description */}
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-outfit font-extrabold text-gray-900 dark:text-white leading-tight">
              Welcome to <br />
              <span className="text-primary italic">Civic</span>FIX
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
              Your platform for transparent civic reporting. Connect with your community and help resolve issues faster than ever.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] flex-1 text-center"
            >
              Continue as Citizen
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white dark:bg-surface-dark text-gray-800 dark:text-white font-bold rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-all active:scale-[0.98] flex-1 text-center"
            >
              Continue as Admin
            </button>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Verified', color: 'bg-green-500' },
              { label: 'Secure', color: 'bg-blue-500' },
              { label: 'Fast', color: 'bg-orange-500' }
            ].map((tag) => (
              <div key={tag.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tag.color}`}></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Placeholder */}
        <div className="relative group hidden lg:block">
          <div className="absolute -inset-4 bg-primary/20 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="relative bg-white dark:bg-surface-dark rounded-[40px] p-8 shadow-2xl border dark:border-gray-800 overflow-hidden transform transition-transform duration-700 hover:rotate-2">
            <img 
              src="https://images.unsplash.com/photo-1517048676732-d65bc06759ae?q=80&w=1000" 
              alt="Community Collaboration" 
              className="w-full h-80 object-cover rounded-2xl shadow-inner mb-6 grayscale hover:grayscale-0 transition-all"
            />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Status</p>
              <p className="text-xl font-outfit font-bold text-gray-900 dark:text-white">Active and Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
