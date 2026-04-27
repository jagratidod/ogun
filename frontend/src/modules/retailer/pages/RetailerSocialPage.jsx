import { useState, useRef, useEffect } from 'react';
import { RiSearch2Fill, RiArrowLeftFill, RiHeartLine, RiHeartFill, RiShareForwardFill, RiCompass3Fill } from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import SocialGrid from '../../../core/components/social/SocialGrid';
import { useSocialGrid } from '../../../core/hooks/useSocialGrid';

export default function RetailerSocialPage() {
  const { items } = useSocialGrid();
  const [selected, setSelected] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const scrollContainerRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    if (selected && itemRefs.current[selected.id]) {
      itemRefs.current[selected.id].scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [selected]);

  const toggleLike = (id) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedPosts(newLiked);
  };

  const handleShare = async (post) => {
    const shareData = {
      title: 'Partner Update from Ogun',
      text: post.label || 'New update from Ogun Ecosystem',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Could not share post');
      }
    }
  };

  const visibleGridItems = items.filter((i) => i?.enabled);

  if (selected) {
    const isLiked = (id) => likedPosts.has(id);
    const selectedIndex = visibleGridItems.findIndex(i => i.id === selected.id);

    return (
      <div 
        ref={scrollContainerRef}
        className="fixed inset-0 z-[100] bg-black flex flex-col animate-slide-up select-none overflow-y-auto snap-y snap-mandatory h-[-webkit-fill-available]"
      >
        {/* Detail Header - Fixed */}
        <div className="fixed top-0 inset-x-0 z-[110] p-5 flex items-center justify-between text-white bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <button 
            onClick={() => setSelected(null)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 active:scale-90 transition-all"
          >
            <RiArrowLeftFill className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[4px] opacity-60 mb-1">Explore Reel</span>
            <span className="text-[13px] font-black tracking-tight">{selected.label?.slice(0, 18)}...</span>
          </div>
          <div className="w-10 h-10" />
        </div>

        {/* Scrollable Container for Items */}
        <div className="flex-1 w-full bg-black">
          {visibleGridItems.map((item, idx) => (
            <div 
              key={item.id} 
              ref={el => itemRefs.current[item.id] = el}
              className="relative w-full h-[100dvh] flex items-center justify-center snap-start snap-always"
            >
              {/* Media Container */}
              <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden" onClick={() => setSelected(null)}>
                {item.type === 'video' || item.type === 'reel' ? (
                  <video
                    src={item.src}
                    controls={false}
                    autoPlay={idx === selectedIndex}
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.target.paused ? e.target.play() : e.target.pause();
                    }}
                  />
                ) : (
                  <img src={item.src} alt={item.label} className="w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
                )}
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-8 pb-16 bg-gradient-to-t from-black/90 via-black/30 to-transparent text-white pointer-events-none">
                <div className="flex items-end justify-between gap-6 translate-y-2">
                  <div className="flex-1 pointer-events-auto">
                    <p className="text-[13px] text-white/90 leading-relaxed font-bold line-clamp-2 mb-3 tracking-tight">
                      {item.label || 'Experience the latest from Ogun Ecosystem.'}
                    </p>

                    <div className="flex items-center gap-3 text-[8.5px] font-black text-white/40 uppercase tracking-[2px]">
                       <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-teal" /> {item.views.toLocaleString()} views</span>
                       <span>•</span>
                       <span>Shared by Admin</span>
                    </div>
                  </div>
                  
                  {/* Action Sidebar */}
                  <div className="flex flex-col items-center gap-5 pointer-events-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}
                      className="flex flex-col items-center group active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-1.5 border border-white/20 group-hover:bg-white/20">
                         {isLiked(item.id) ? (
                           <RiHeartFill className="w-6 h-6 text-brand-pink animate-pop" />
                         ) : (
                           <RiHeartLine className="w-6 h-6 text-white" />
                         )}
                      </div>
                      <span className="text-[8px] font-black tracking-widest uppercase opacity-80">{isLiked(item.id) ? 'Liked' : 'Like'}</span>
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                      className="flex flex-col items-center group active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-1.5 border border-white/20 group-hover:bg-white/20">
                         <RiShareForwardFill className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[8px] font-black tracking-widest uppercase opacity-80">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
           <div>
              <h2 className="text-xl font-black text-content-primary">Explore</h2>
              <p className="text-[8px] text-brand-teal font-black uppercase tracking-widest mt-1">Updates from Ogun HQ</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
              <RiCompass3Fill className="text-brand-teal w-5 h-5" />
           </div>
        </div>
        
        {visibleGridItems.length > 0 ? (
          <SocialGrid items={visibleGridItems} columns={3} onSelect={setSelected} />
        ) : (
          <div className="py-48 text-center px-10">
            <div className="w-20 h-20 rounded-full bg-surface-input flex items-center justify-center mx-auto mb-6">
               <RiSearch2Fill className="w-10 h-10 text-content-tertiary opacity-30" />
            </div>
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">No grid items shared yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
