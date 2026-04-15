import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import defaultSocialGridItems from '../../data/socialGridDefaults';

const STORAGE_KEY = 'ogun_social_grid_items_v1';

function safeArray(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

export function useSocialGrid() {
  const [rawItems, setRawItems] = useLocalStorage(STORAGE_KEY, defaultSocialGridItems);

  const items = useMemo(() => safeArray(rawItems, defaultSocialGridItems), [rawItems]);

  const actions = useMemo(() => {
    const setItems = (updater) => {
      setRawItems((prev) => {
        const current = safeArray(prev, defaultSocialGridItems);
        return typeof updater === 'function' ? updater(current) : updater;
      });
    };

    return {
      setItems,
      addItem: (item) => setItems((prev) => [item, ...prev]),
      updateItem: (id, patch) =>
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it))),
      removeItem: (id) => setItems((prev) => prev.filter((it) => it.id !== id)),
      moveItem: (id, direction) =>
        setItems((prev) => {
          const idx = prev.findIndex((it) => it.id === id);
          if (idx < 0) return prev;
          const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (nextIdx < 0 || nextIdx >= prev.length) return prev;
          const copy = [...prev];
          const temp = copy[idx];
          copy[idx] = copy[nextIdx];
          copy[nextIdx] = temp;
          return copy;
        }),
      resetDefaults: () => setRawItems(defaultSocialGridItems),
    };
  }, [setRawItems]);

  return { items, ...actions };
}

