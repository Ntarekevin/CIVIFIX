import React, { useState, useRef } from 'react';
import { submitReport } from '../services/api';
import { useLanguage } from '../store/LanguageContext';

const HASHTAG_SUGGESTIONS = [
  '#RIB', '#RNP', '#RAB', '#MINAGRI', '#MINADEF',
  '#infrastructure', '#corruption', '#security', '#health', '#education'
];

export default function PostCreation({ onPostSuccess }) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // --- Image Upload ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const combined = [...mediaFiles, ...files].slice(0, 5); // max 5
    setMediaFiles(combined);
    const previews = combined.map(f => URL.createObjectURL(f));
    setMediaPreviews(previews);
  };

  const removeMedia = (idx) => {
    const updatedFiles = mediaFiles.filter((_, i) => i !== idx);
    const updatedPreviews = mediaPreviews.filter((_, i) => i !== idx);
    setMediaFiles(updatedFiles);
    setMediaPreviews(updatedPreviews);
  };

  // --- Location Picker ---
  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setLocationLoading(false);
      },
      () => {
        alert('Unable to get location. Please check browser permissions.');
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const clearLocation = () => setLocation(null);

  // --- Hashtag Insertion ---
  const insertHashtag = (tag) => {
    const textarea = textareaRef.current;
    const cursor = textarea ? textarea.selectionStart : content.length;
    const before = content.slice(0, cursor);
    const after = content.slice(cursor);
    const separator = before.length && !before.endsWith(' ') ? ' ' : '';
    const newContent = `${before}${separator}${tag} ${after}`;
    setContent(newContent);
    setShowHashtags(false);
    setTimeout(() => textarea && textarea.focus(), 0);
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', content);
      formData.append('category', 'general');
      if (location) {
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
      }
      mediaFiles.forEach(f => formData.append('media', f));

      const res = await submitReport(formData);
      
      // Store tracking token for notifications
      if (res.trackingToken) {
        const myReports = JSON.parse(localStorage.getItem('civifix_my_reports') || '[]');
        if (!myReports.includes(res.trackingToken)) {
          myReports.push(res.trackingToken);
          localStorage.setItem('civifix_my_reports', JSON.stringify(myReports));
        }
      }

      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setLocation(null);
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
            ref={textareaRef}
            placeholder={t('postPlaceholder')}
            className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl p-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all h-24"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />

          {/* Media previews */}
          {mediaPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {mediaPreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border dark:border-gray-700 group">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Location indicator */}
          {location && (
            <div className="mt-2 flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-lg w-fit">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              <button onClick={clearLocation} className="text-gray-400 hover:text-red-500 ml-1">✕</button>
            </div>
          )}

          {/* Hashtag suggestions dropdown */}
          {showHashtags && (
            <div className="mt-2 flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-700">
              {HASHTAG_SUGGESTIONS.map(tag => (
                <button
                  key={tag}
                  onClick={() => insertHashtag(tag)}
                  className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
              <button onClick={() => setShowHashtags(false)} className="text-xs text-gray-400 hover:text-red-500 ml-auto">Close</button>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-gray-400">
              {/* Image Upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,video/mp4"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg"
                title={t('attachMedia')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Location Picker */}
              <button
                onClick={handleLocationClick}
                disabled={locationLoading}
                className={`hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg ${location ? 'text-primary' : ''}`}
                title={t('attachLocation')}
              >
                {locationLoading ? (
                  <svg className="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>

              {/* Hashtag Picker */}
              <button
                onClick={() => setShowHashtags(!showHashtags)}
                className={`hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg text-xl font-bold ${showHashtags ? 'text-primary bg-primary/5' : ''}`}
                title={t('addHashtag')}
              >
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
                  {t('posting')}
                </>
              ) : t('post')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
