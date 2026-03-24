import React, { useState } from 'react';
import { submitReport } from '../services/api';

export default function PostCreation({ onPostSuccess }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', content);
      formData.append('category', 'general'); // Default category

      await submitReport(formData);
      setContent('');
      if (onPostSuccess) onPostSuccess();
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border dark:border-gray-800 transition-all">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary border-2 border-primary/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <textarea
            placeholder="Report a new civic issue..."
            className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl p-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all h-24"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-gray-400">
              <button className="hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg tooltip" title="Image Upload">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg" title="Location Picker">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg text-xl font-bold" title="Add Hashtags">
                #
              </button>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-8 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/20 transition-all font-outfit active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  POSTING...
                </>
              ) : 'POST'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
