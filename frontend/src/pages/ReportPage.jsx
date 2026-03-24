import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/api';

export default function ReportPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Please describe the issue.");
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const fd = new FormData();
      fd.append('category', 'general'); 
      fd.append('description', description);
      files.forEach(f => fd.append('media', f));

      await submitReport(fd);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">Report Civic Issue</h1>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border dark:border-gray-800 space-y-8">
        {/* User Context */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-700">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">JD</div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">User #24A102I07</p>
            <p className="text-xs text-gray-500">Current Location: Marriot Hotel, Kigali</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Describe the issue</label>
          <textarea
            className="w-full bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl p-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all h-40"
            placeholder="e.g. Here at Marriot Hotel we have no one to help us with our luggage #MarriotHotel"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Evidence */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Evidence of Complaint</label>
          <div 
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Upload Image of Proof</h3>
            <p className="text-sm text-gray-500 mt-1">Take a photo or choose from gallery</p>
            <input 
              type="file" 
              ref={fileRef} 
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {files.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          disabled={loading || !description.trim()}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-4 rounded-2xl font-bold font-outfit shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              SUBMITTING...
            </>
          ) : 'SUBMIT REPORT'}
        </button>
      </div>
    </div>
  );
}
