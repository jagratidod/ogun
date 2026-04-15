import { useState } from 'react';
import { RiSearchLine, RiArrowLeftLine, RiHeartLine, RiHeartFill, RiShareForwardLine } from 'react-icons/ri';

import { toast } from 'react-hot-toast';
import Modal from '../../../core/components/ui/Modal';

import SocialGrid from '../../../core/components/social/SocialGrid';
import { useSocialGrid } from '../../../core/hooks/useSocialGrid';

export default function CustomerSocialPage() {
  const { items } = useSocialGrid();
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const visibleGridItems = items.filter((i) => 
    i?.enabled && (searchQuery === '' || i.label?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selected) {
    const isLiked = likedPosts.has(selected.id);
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col animate-slide-up select-none">
        {/* Detail Header */}
        <div className="absolute top-0 inset-x-0 z-10 p-4 pb-12 flex items-center justify-between text-white bg-gradient-to-b from-black/70 to-transparent">
          <button 
            onClick={() => setSelected(null)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md active:scale-90 transition-transform"
          >
            <RiArrowLeftLine className="w-7 h-7" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[3px] opacity-60">Reel Player</span>
            <span className="text-sm font-black tracking-tight">{selected.label?.slice(0, 15)}...</span>
          </div>
          <div className="w-12 h-12" />
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
        <div className="absolute bottom-0 inset-x-0 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white pointer-events-none">
          <div className="flex items-end justify-between gap-6">
            <div className="flex-1 pointer-events-auto">
              <p className="text-sm text-white/90 leading-relaxed font-medium line-clamp-3 mb-2">
                {selected.label || 'Experience the future of appliances with Ogun Ecosystem.'}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                 <span>{selected.views.toLocaleString()} views</span>
                 <span>•</span>
                 <span>12m ago</span>
              </div>
            </div>
            
            {/* Action Sidebar */}
            <div className="flex flex-col items-center gap-7 pb-2 pointer-events-auto">
              <button 
                onClick={() => toggleLike(selected.id)}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center mb-1 group-hover:bg-black/40">
                   {isLiked ? (
                     <RiHeartFill className="w-7 h-7 text-brand-pink animate-pop" />
                   ) : (
                     <RiHeartLine className="w-7 h-7 text-white" />
                   )}
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase">{isLiked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button 
                onClick={() => handleShare(selected)}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center mb-1 group-hover:bg-black/40">
                   <RiShareForwardLine className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-white">
      {/* Search Header - Light Style */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-border">
        <div className="relative group">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary group-focus-within:text-brand-teal transition-colors" />
          <input
            type="text"
            placeholder="Search with Meta AI"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-surface-hover rounded-xl pl-12 pr-4 text-sm font-semibold border-none focus:ring-1 focus:ring-brand-teal/20 transition-all placeholder:text-content-tertiary text-content-primary"
          />
        </div>
      </div>

      <div className="pb-20">
        {visibleGridItems.length > 0 ? (
          <SocialGrid items={visibleGridItems} columns={3} onSelect={setSelected} />
        ) : (
          <div className="py-40 text-center">
            <RiSearchLine className="w-12 h-12 mx-auto mb-4 text-border" />
            <p className="text-sm font-bold text-content-tertiary">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}


