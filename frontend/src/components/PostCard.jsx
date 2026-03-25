import React, { useState, useEffect } from 'react';
import { getReportComments, commentReport, updateReport } from '../services/api';

const PostCard = ({ report, isHighlighted = false }) => {
  const {
    id,
    publicId = "#24A102107",
    userRole = "Verified Resident",
    timestamp = "2 hours ago",
    location = "Nyantarama District",
    content = "No content provided.",
    media = [],
    tags = [],
    commentsCount: initialCommentsCount = 0,
  } = report || {};

  const [showComments, setShowComments] = useState(isHighlighted);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [updating, setUpdating] = useState(false);

  // Check ownership
  const myTokens = JSON.parse(localStorage.getItem('civifix_report_tokens') || '[]');
  const myTokenObj = myTokens.find(t => t.publicId === publicId);
  const isOwner = !!myTokenObj;

  const cardRef = React.useRef(null);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
        setTimeout(() => {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }
  }, [isHighlighted]);

  useEffect(() => {
    if (showComments && id) {
      fetchComments();
    }
  }, [showComments, id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const data = await getReportComments(id);
      setComments(data);
      setCommentsCount(data.length);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim() || updating) return;
    setUpdating(true);
    try {
      await updateReport(myTokenObj.token, { description: editContent });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update report: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('civifix_user') || '{}');
      const authorName = user.username || 'Anonymous Citizen';
      
      const savedComment = await commentReport(id, newComment, authorName);
      setComments(prev => [...prev, savedComment]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md group ${isHighlighted ? 'border-primary ring-2 ring-primary/20 animate-pulse-subtle' : 'dark:border-gray-800'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${publicId.replace('#', '')}&background=random`}
            alt="Avatar"
            className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white font-outfit">User {publicId}</h3>
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/20">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {timestamp} {location ? `• ${location}` : ''}
            </p>
          </div>
        </div>
        
        {isOwner && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            title="Edit your report"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-primary/20 rounded-2xl p-4 text-[15px] dark:text-white outline-none focus:border-primary/50 transition-all resize-none min-h-[100px]"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={updating}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(content); }}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                disabled={updating}
              >
                CANCEL
              </button>
              <button 
                onClick={handleUpdate}
                className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center gap-2"
                disabled={updating || !editContent.trim()}
              >
                {updating && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {updating ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
            {isEditing ? editContent : (editContent !== content ? editContent : content)}
          </p>
        )}
      </div>

      {/* Media Grid */}
      {media && media.length > 0 && (
        <div className={`grid gap-2 mb-6 rounded-2xl overflow-hidden ${media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {media.map((item, i) => (
            <div 
              key={i} 
              className={`relative bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shadow-inner overflow-hidden ${media.length > 2 && i === 0 ? 'col-span-2 aspect-[21/9]' : 'aspect-video'}`}
            >
              <img 
                src={item.url} 
                alt={`Proof ${i + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.05]" 
              />
              {i === 0 && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Evidence Attached
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <span key={tag} className="text-xs text-primary font-semibold bg-primary/5 px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-start gap-6 pt-4 border-t dark:border-gray-800">
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 transition-colors text-sm font-semibold group/btn ${showComments ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
        >
          <div className={`p-1.5 rounded-lg transition-colors ${showComments ? 'bg-primary/10' : 'group-hover/btn:bg-primary/5'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          {commentsCount} Comments
        </button>
        <button 
          onClick={() => setShowComments(true)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-semibold group/btn"
        >
          <div className="p-1.5 rounded-lg group-hover/btn:bg-primary/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          Reply
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-4 mb-6">
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {comment.author_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.author_name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-gray-500 py-4 italic">No comments yet. Be the first to reply!</p>
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="Write a reply..."
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 border-none rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 transition-all active:scale-90"
            >
              {submitting ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
