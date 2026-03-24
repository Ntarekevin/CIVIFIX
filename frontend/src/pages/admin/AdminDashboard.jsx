import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminReports, getUsers, updateReportStatus, assignReport } from '../../services/api';
import { useSocket } from '../../store/SocketContext';

const CATEGORY_COLORS = {
  corruption: 'text-orange-500', 
  security: 'text-red-500', 
  racism: 'text-purple-500', 
  service: 'text-blue-500',
};

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandingRow, setExpandingRow] = useState(null);
  const navigate = useNavigate();
  const { socket } = useSocket() || {};
  
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const layerRef = useRef(null);
  
  const token = localStorage.getItem('civifix_auth_token');

  const fetchData = async () => {
    try {
      const [repData, usrData] = await Promise.all([getAdminReports(), getUsers()]);
      setReports(repData);
      setUsers(usrData);
    } catch (err) {
      setError('Failed to fetch admin data.');
      if (err.message && err.message.includes('401')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, token]);

  useEffect(() => {
    if (socket) {
      socket.on('new-report', () => fetchData());
      socket.on('report-updated', () => fetchData());
    }
  }, [socket]);

  /* ─── Map setup ─── */
  useEffect(() => {
    if (loading || reports.length === 0) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      if (!leafletRef.current && mapRef.current) {
        leafletRef.current = L.default.map(mapRef.current, {
          center: [-1.9706, 30.1044],
          zoom: 12,
        });
        L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(leafletRef.current);
      }

      if (!leafletRef.current) return;

      if (layerRef.current) layerRef.current.clearLayers();
      else layerRef.current = L.default.layerGroup().addTo(leafletRef.current);

      reports.forEach(r => {
        if (!r.lat || !r.lng) return;
        L.default.circleMarker([r.lat, r.lng], {
          radius: 8, fillColor: '#2d5bff', color: '#fff', weight: 2, fillOpacity: 0.8
        })
          .bindPopup(`Report #${r.id}: ${r.status}`)
          .addTo(layerRef.current);
      });
    });
  }, [reports, loading]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateReportStatus(id, status, 'Updated from dashboard');
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAssign = async (id, assignTo) => {
    try {
      await assignReport(id, assignTo);
      fetchData();
    } catch (err) {
      alert('Failed to assign report');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">Authority Portal</h1>
          <p className="text-gray-500 mt-1">Manage civic reports and assign them to departments.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-3">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-primary uppercase">Real-time Sync Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Report</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Assignment</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-800">
                  {reports.map(r => (
                    <React.Fragment key={r.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-900 dark:text-white">ID {r.public_id || r.id}</p>
                            <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${CATEGORY_COLORS[r.category] || 'text-gray-600'}`}>
                            #{r.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={r.status} 
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={r.assigned_to || ''} 
                            onChange={(e) => handleAssign(r.id, e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                          >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.username}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setExpandingRow(expandingRow === r.id ? null : r.id)}
                            className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5 focus:pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandingRow === r.id && (
                        <tr className="bg-gray-50/50 dark:bg-gray-800/10">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="flex flex-col gap-3">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Authority Reply</p>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="Type your official response..."
                                  className="flex-1 bg-white dark:bg-surface-dark border dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                                  id={`reply-${r.id}`}
                                />
                                <button 
                                  onClick={async () => {
                                    const input = document.getElementById(`reply-${r.id}`);
                                    const content = input.value;
                                    if (!content) return;
                                    try {
                                      await fetch(`/api/reports/${r.id}/comment`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ content, authorName: JSON.parse(localStorage.getItem('civifix_user')).username })
                                      });
                                      input.value = '';
                                      setExpandingRow(null);
                                      alert('Reply sent successfully!');
                                    } catch (err) {
                                      alert('Failed to send reply');
                                    }
                                  }}
                                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all"
                                >
                                  SEND
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border dark:border-gray-800 space-y-4">
            <h3 className="text-lg font-outfit font-bold text-gray-900 dark:text-white">Live Operations Map</h3>
            <div 
              ref={mapRef} 
              className="h-80 rounded-2xl overflow-hidden border dark:border-gray-700 shadow-inner z-0" 
            />
            <p className="text-[10px] text-gray-400 font-medium italic">
              * Displaying precise geo-coordinates for authenticated authority review.
            </p>
          </div>
          
          <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/20 space-y-4">
             <h3 className="text-lg font-outfit font-bold">System Summary</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                   <p className="text-[10px] font-bold uppercase opacity-70">Total Today</p>
                   <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                   <p className="text-[10px] font-bold uppercase opacity-70">Resolved</p>
                   <p className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
