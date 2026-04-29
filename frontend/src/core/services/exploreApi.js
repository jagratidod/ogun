import api from '../api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Build the full media URL from a relative fileUrl stored in the DB.
 * e.g.  /uploads/explore/foo.mp4  →  http://localhost:5000/uploads/explore/foo.mp4
 */
export function buildMediaUrl(fileUrl) {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl; // already absolute
  // Strip /api/v1 suffix from BASE_URL to get the server root
  const serverRoot = BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${serverRoot}${fileUrl}`;
}

// ─── Public (no auth) ─────────────────────────────────────────────────────────

/**
 * Fetch all enabled explore items – used by Customer / Retailer / Distributor / Sales pages
 */
export const getExploreItems = () => api.get('/explore');

// ─── Admin (requires admin JWT) ───────────────────────────────────────────────

/**
 * Get ALL explore items (including disabled) for the admin management page
 */
export const getAdminExploreItems = () => api.get('/admin/explore');

/**
 * Upload a new explore item with a real file
 * @param {FormData} formData  – must include field "file" + title / type / caption / views / enabled / order
 */
export const createExploreItem = (formData) =>
  api.post('/admin/explore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Update an explore item (optionally with a new file)
 * @param {string} id
 * @param {FormData} formData
 */
export const updateExploreItem = (id, formData) =>
  api.put(`/admin/explore/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Bulk reorder items
 * @param {string[]} orderedIds  – array of item IDs in the desired order
 */
export const reorderExploreItems = (orderedIds) =>
  api.patch('/admin/explore/reorder', { orderedIds });

/**
 * Permanently delete an explore item and its file from disk
 * @param {string} id
 */
export const deleteExploreItem = (id) => api.delete(`/admin/explore/${id}`);
