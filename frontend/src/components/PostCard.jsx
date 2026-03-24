import React from 'react';

const PostCard = ({ report }) => {
  const {
    publicId = "#24A102107",
    userRole = "Verified Resident",
    timestamp = "2 hours ago",
    location = "Nyantarama District",
    content = "Urgent attention needed: robbery issues in Nyantarama #RIB. Multiple incidents reported in the last 48 hours. Attached is the CCTV evidence from the street corner.",
    imageUrl = "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=1000",
    tags = ["#RIB"],
    commentsCount = 24,
  } = report || {};

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border dark:border-gray-800 transition-all hover:shadow-md group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src="https://ui-avatars.com/api/?name=User&background=random"
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
              {timestamp} • {location}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
          {content}
        </p>
      </div>

      {imageUrl && (
        <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shadow-inner">
          <img src={imageUrl} alt="Proof" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Post of proof
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-800">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-semibold group/btn">
            <div className="p-1.5 rounded-lg group-hover/btn:bg-primary/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            comments
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-semibold group/btn">
            <div className="p-1.5 rounded-lg group-hover/btn:bg-primary/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            reply to the post
          </button>
        </div>
        <button 
          onClick={async () => {
            if (window.confirm("Are you sure you want to escalate this report to authorities?")) {
              try {
                const { escalateReport } = await import('../services/api');
                await escalateReport(report.id);
                alert("Report escalated successfully!");
              } catch (err) {
                console.error("Escalation failed:", err);
                alert("Failed to escalate report.");
              }
            }
          }}
          className="flex items-center gap-2 text-red-500/80 hover:text-red-600 transition-colors text-sm font-bold uppercase tracking-wider group/btn"
        >
          <div className="p-1.5 rounded-lg group-hover/btn:bg-red-500/5 transition-colors">
             <span className="text-lg">!</span>
          </div>
          Escalate
        </button>
      </div>
    </div>
  );
};

export default PostCard;
