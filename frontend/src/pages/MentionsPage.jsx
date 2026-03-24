import React, { useState, useEffect } from 'react';
import { getAdminReports } from '../services/api';
import PostCard from '../components/PostCard';

export default function MentionsPage() {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentions() {
      try {
        const reports = await getAdminReports();
        // Filter reports where the user is mentioned (is_mentioned is returned by the updated API)
        setMentions(reports.filter(r => r.is_mentioned));
      } catch (err) {
        console.error("Failed to fetch mentions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMentions();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">Mentions</h1>
          <p className="text-gray-500 mt-1">Reports where you have been tagged by citizens.</p>
        </div>
        <div className="flex -space-x-2">
           {[1,2,3].map(i => (
             <img key={i} src={`https://ui-avatars.com/api/?name=Auth+${i}&background=random`} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" alt="auth" />
           ))}
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : mentions.length > 0 ? (
          mentions.map((report) => (
            <PostCard 
              key={report.id} 
              report={{
                id: report.id,
                publicId: report.public_id,
                content: report.description,
                timestamp: new Date(report.created_at).toLocaleDateString(),
                location: report.city || "Rwanda",
                userRole: "Reported Issue",
                status: report.status
              }} 
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border dark:border-gray-800 border-dashed">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No mentions yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">When citizens tag your handle in their reports, they will appear here for your review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
