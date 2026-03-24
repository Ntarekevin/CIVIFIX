import React from 'react';

const trendingCategories = [
  { name: 'Security', tag: '#RIB', count: 1242 },
  { name: 'Infrastructure', tag: '#RAB', count: 845 },
  { name: 'Public Safety', tag: '#RNP', count: '2.1k' },
  { name: 'Agriculture', tag: '#MINAGRI', count: 512 },
  { name: 'National Defense', tag: '#MINADEF', count: 156 },
];

export default function RightSidebar() {
  return (
    <div className="w-80 hidden xl:flex flex-col gap-6 sticky top-24 self-start">
      {/* Trending Section */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border dark:border-gray-800 transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg font-outfit text-gray-900 dark:text-white">Trending</h3>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="fill" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {trendingCategories.map((item) => (
            <div key={item.tag} className="group cursor-pointer">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-primary">
                Trending in {item.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.tag}</h4>
                <p className="text-xs text-gray-500">{item.count} Reports today</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-2.5 text-sm font-bold text-primary hover:bg-blue-50 dark:hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/20">
          View More Trends
        </button>
      </div>

      {/* Hotspot Mapping Section */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border dark:border-gray-800 transition-all">
        <h3 className="font-bold text-lg font-outfit text-gray-900 dark:text-white mb-2">Hotspot Mapping</h3>
        <p className="text-[11px] text-gray-500 mb-4">Real-time incident density</p>
        
        <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shadow-inner group">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000" 
            alt="Heatmap" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" 
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay group-hover:bg-primary/5 transition-colors"></div>
          
          {/* Mock Heatmap dots */}
          <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-red-500/40 rounded-full blur-md animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-orange-500/30 rounded-full blur-lg animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-red-600/50 rounded-full blur-sm animate-ping"></div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Live
          </div>
          
          <div className="absolute bottom-3 right-3 text-[8px] text-white/70 font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
            Kigali, Sector 04
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
            {[
                { label: 'Security', color: 'bg-red-500' },
                { label: 'Public Safety', color: 'bg-blue-500' },
            ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${l.color}`}></span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{l.label}</span>
                </div>
            ))}
        </div>
      </div>
      
      {/* Footer links */}
      <div className="px-4 flex flex-wrap gap-x-4 gap-y-1">
        {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility', 'Ads info'].map(link => (
          <button key={link} className="text-[10px] text-gray-400 hover:text-gray-600 hover:underline">
            {link}
          </button>
        ))}
        <p className="text-[10px] text-gray-400 mt-2 w-full">© 2024 Civic Curator Corp.</p>
      </div>
    </div>
  );
}
