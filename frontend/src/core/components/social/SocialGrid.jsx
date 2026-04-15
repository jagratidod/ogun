import { RiEyeLine, RiPlayFill } from 'react-icons/ri';

function formatViews(n) {
  const num = Number(n || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 100_000 ? 0 : 1)}K`;
  return `${num}`;
}

function isVideo(type) {
  return type === 'video' || type === 'reel';
}

export default function SocialGrid({ items = [], columns = 3, onSelect }) {
  const gridCols =
    columns === 4 ? 'grid-cols-4' :
    columns === 2 ? 'grid-cols-2' :
    'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-0.5 bg-white`}>

      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item)}
          className="relative aspect-[9/16] overflow-hidden bg-zinc-900 active:opacity-90 transition-opacity outline-none animate-fade-in"
          title={item.label || 'Social Post'}
        >
          {isVideo(item.type) ? (
            <video
              src={item.src}
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={item.src} alt={item.label || 'Social Post'} className="w-full h-full object-cover" />
          )}

          {/* Views Overlay - matching screenshot */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white/95">
            <RiEyeLine className="w-4 h-4 shadow-sm" />
            <span className="text-[12px] font-bold tracking-tight drop-shadow-md">{formatViews(item.views)}</span>
          </div>

          {isVideo(item.type) && (
            <div className="absolute top-2 right-2 flex items-center justify-center">
              <RiPlayFill className="w-5 h-5 text-white/50" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}


