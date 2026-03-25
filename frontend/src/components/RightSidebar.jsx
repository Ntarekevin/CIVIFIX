import React, { useState, useEffect } from 'react';
import { getTrends } from '../services/api';

export default function RightSidebar({ onTagFilter }) {
  const [trends, setTrends] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrends()
      .then(data => setTrends(data))
      .catch(() => setTrends([]))
      .finally(() => setLoading(false));
  }, []);

  const handleTagClick = (tag) => {
    const newTag = activeTag === tag ? null : tag;
    setActiveTag(newTag);
    if (onTagFilter) onTagFilter(newTag);
  };

  return (
    <div className="w-80 hidden xl:flex flex-col gap-6 sticky top-24 self-start">
      {/* Trending Section */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border dark:border-gray-800 transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg font-outfit text-gray-900 dark:text-white">Trending</h3>
          {activeTag && (
            <button
              onClick={() => { setActiveTag(null); if (onTagFilter) onTagFilter(null); }}
              className="text-xs text-red-500 hover:underline font-semibold"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : trends.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No trending topics yet.</p>
          ) : (
            trends.map((item) => {
              const tag = `#${item.tag}`;
              const isActive = activeTag === tag;
              return (
                <div
                  key={item.tag}
                  onClick={() => handleTagClick(tag)}
                  className={`group cursor-pointer rounded-xl px-3 py-2 transition-all ${
                    isActive
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                    Trending in reports
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <h4 className={`font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-900 dark:text-white group-hover:text-primary'}`}>
                      {tag}
                    </h4>
                    <p className="text-xs text-gray-500">{item.count} Reports</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeTag && (
          <p className="mt-4 text-xs text-center text-primary font-semibold animate-pulse">
            Showing reports for {activeTag}
          </p>
        )}
      </div>

      {/* Footer links */}
      <div className="px-4 flex flex-wrap gap-x-4 gap-y-1">
        {['Terms of Service', 'Privacy Policy', 'Accessibility'].map(link => (
          <button key={link} className="text-[10px] text-gray-400 hover:text-gray-600 hover:underline">
            {link}
          </button>
        ))}
        <p className="text-[10px] text-gray-400 mt-2 w-full">© 2024 CivicFIX Rwanda</p>
      </div>
    </div>
  );
}
