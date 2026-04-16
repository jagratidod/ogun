import { useState } from 'react';
import { RiSearch2Fill, RiArrowLeftFill, RiHeartLine, RiHeartFill, RiShareForwardFill } from 'react-icons/ri';

import { toast } from 'react-hot-toast';
import Modal from '../../../core/components/ui/Modal';

import SocialGrid from '../../../core/components/social/SocialGrid';
import { useSocialGrid } from '../../../core/hooks/useSocialGrid';

export default function CustomerSocialPage() {
  const { items } = useSocialGrid();
  const [selected, setSelected] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const toggleLike = (id) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedPosts(newLiked);
  };

  const handleShare = async (post) => {
    const shareData = {
      title: 'Check out this post on Ogun',
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
    const isLiked = likedPosts.has(selected.id);
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col animate-slide-up select-none">
        {/* Detail Header */}
        <div className="absolute top-0 inset-x-0 z-10 p-5 flex items-center justify-between text-white bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <button 
            onClick={() => setSelected(null)}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 active:scale-90 transition-all"
          >
            <RiArrowLeftFill className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[4px] opacity-60 mb-1">Explore Reel</span>
            <span className="text-[13px] font-black tracking-tight">{selected.label?.slice(0, 18)}...</span>
          </div>
          <div className="w-11 h-11" />
        </div>

        {/* Media Container */}
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden" onClick={() => setSelected(null)}>
          {selected.type === 'video' || selected.type === 'reel' ? (
            <video
              src={selected.src}
              controls={false}
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain"
              onClick={(e) => {
                e.stopPropagation();
                e.target.paused ? e.target.play() : e.target.pause();
              }}
            />
          ) : (
            <img src={selected.src} alt={selected.label} className="w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/30 to-transparent text-white pointer-events-none">
          <div className="flex items-end justify-between gap-6 translate-y-2">
            <div className="flex-1 pointer-events-auto">
              <p className="text-[14px] text-white/90 leading-relaxed font-bold line-clamp-2 mb-3 tracking-tight">
                {selected.label || 'Experience the future of appliances with Ogun Ecosystem.'}
              </p>

              <div className="flex items-center gap-3 text-[9px] font-black text-white/40 uppercase tracking-[2px]">
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-teal" /> {selected.views.toLocaleString()} views</span>
                 <span>•</span>
                 <span>Just Now</span>
              </div>
            </div>
            
            {/* Action Sidebar */}
            <div className="flex flex-col items-center gap-6 pointer-events-auto">
              <button 
                onClick={() => toggleLike(selected.id)}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-1.5 border border-white/20 group-hover:bg-white/20">
                   {isLiked ? (
                     <RiHeartFill className="w-7 h-7 text-brand-pink animate-pop" />
                   ) : (
                     <RiHeartLine className="w-7 h-7 text-white" />
                   )}
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-80">{isLiked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button 
                onClick={() => handleShare(selected)}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-1.5 border border-white/20 group-hover:bg-white/20">
                   <RiShareForwardFill className="w-7 h-7 text-white" />
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-80">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-24">
        {visibleGridItems.length > 0 ? (
          <SocialGrid items={visibleGridItems} columns={3} onSelect={setSelected} />
        ) : (
          <div className="py-48 text-center px-10">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
               <RiSearch2Fill className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">No feeds matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}


