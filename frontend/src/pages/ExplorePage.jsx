import React, { useState, useEffect } from 'react';
import { getTrends } from '../services/api';

export default function ExplorePage() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const data = await getTrends();
        setTrends(data);
      } catch (err) {
        console.error("Failed to fetch trends:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">Explore Trends</h1>
        <p className="text-gray-500 mt-2">Discover the most discussed civic issues and follow categories that matter to you.</p>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="Search authorities or categories..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-dark border dark:border-gray-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="md:col-span-2 text-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : trends.length > 0 ? (
          trends.map(item => (
            <div key={item.tag} className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border dark:border-gray-800 flex items-center justify-between hover:shadow-md transition-all group">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Trending Topic</span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">#{item.tag.toUpperCase()}</h4>
                <p className="text-xs text-gray-500">{item.count} reports this week</p>
              </div>
              <button className="px-6 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300 text-sm font-bold rounded-full border dark:border-gray-700 hover:border-primary transition-all active:scale-95">
                Follow
              </button>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border dark:border-gray-800 border-dashed text-gray-500">
            No trends found today.
          </div>
        )}
      </div>
    </div>
  );
}
