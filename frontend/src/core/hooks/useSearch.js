import { useState, useMemo } from 'react';

export function useSearch(data, searchFields = []) {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;
    const lower = query.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(lower);
      })
    );
  }, [data, query, searchFields]);

  return { query, setQuery, filteredData };
}
