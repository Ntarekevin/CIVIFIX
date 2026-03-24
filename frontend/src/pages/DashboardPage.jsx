import React, { useState, useEffect } from 'react';
import { getPublicReports, getTrends } from '../services/api';
import PostCreation from '../components/PostCreation';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPublicReports({ limit: 10 });
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex gap-8">
      {/* Main Feed Column */}
      <div className="flex-1 space-y-6 max-w-2xl mx-auto lg:mx-0">
        <PostCreation onPostSuccess={fetchData} />
        
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border dark:border-gray-800 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"></div>
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <PostCard 
                key={report.id} 
                report={{
                  publicId: report.public_id,
                  content: report.description,
                  timestamp: new Date(report.created_at).toLocaleDateString(),
                  location: report.city || "Rwanda",
                  imageUrl: report.media && report.media.length > 0 ? report.media[0].url : null,
                  userRole: report.category === 'security' ? 'Security Alert' : 'Verified Resident',
                }} 
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border dark:border-gray-800">
              <p className="text-gray-500">No reports found. Be the first to report!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
