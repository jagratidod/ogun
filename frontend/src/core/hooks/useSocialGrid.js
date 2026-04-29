import { useState, useEffect, useCallback } from 'react';
import { getExploreItems, buildMediaUrl } from '../services/exploreApi';

/**
 * useSocialGrid — fetches Explore items from the backend API.
 *
 * API surface kept intentionally compatible with the old localStorage version
 * so that CustomerSocialPage / RetailerSocialPage / DistributorSocialPage /
 * SalesSocialPage require zero changes.
 *
 * Items are shaped to match what SocialGrid.jsx expects:
 *   { id, label, type, src, views, enabled }
 */
export function useSocialGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getExploreItems();
      const raw = res.data?.data ?? [];

      // Map backend fields → component-friendly shape
      const mapped = raw.map((item) => ({
        id: item._id,
        label: item.title,
        caption: item.caption || '',
        type: item.type,
        src: buildMediaUrl(item.fileUrl),  // full absolute URL
        views: item.views ?? 0,
        enabled: item.enabled,
        order: item.order ?? 0,
      }));

      setItems(mapped);
    } catch (err) {
      console.error('[useSocialGrid] Failed to fetch explore items:', err.message);
      setError(err);
      setItems([]); // graceful fallback — show empty grid
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}

