import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RiUploadCloud2Line,
  RiAddLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiEyeLine,
  RiEyeOffLine,
  RiFilmLine,
  RiImageLine,
  RiRefreshLine,
  RiCloseLine,
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import {
  PageHeader, Card, CardHeader, CardTitle, CardDescription,
  DataTable, Badge, Button, Input, Select, Modal
} from '../../../core';
import {
  getAdminExploreItems,
  createExploreItem,
  updateExploreItem,
  deleteExploreItem,
  reorderExploreItems,
  buildMediaUrl,
} from '../../../core/services/exploreApi';

const TYPE_OPTIONS = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Reel', value: 'reel' },
];

const EMPTY_FORM = {
  title: '',
  caption: '',
  type: 'image',
  views: '0',
  enabled: true,
};

function MediaPreview({ src, type, className = '' }) {
  if (!src) return null;
  const isVideo = type === 'video' || type === 'reel';
  return isVideo ? (
    <video
      src={src}
      muted
      playsInline
      preload="metadata"
      className={`w-full h-full object-cover ${className}`}
    />
  ) : (
    <img src={src} alt="preview" className={`w-full h-full object-cover ${className}`} />
  );
}

export default function SocialGridManagerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editFile, setEditFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const editFileInputRef = useRef(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminExploreItems();
      setItems(res.data?.data ?? []);
    } catch (err) {
      toast.error('Failed to load explore items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ─── File selection (Add form) ──────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    // Auto-detect type
    if (file.type.startsWith('video/')) {
      setForm((p) => ({ ...p, type: 'reel' }));
    } else {
      setForm((p) => ({ ...p, type: 'image' }));
    }

    // Revoke old preview
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(URL.createObjectURL(file));
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Add new item ────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!selectedFile) return toast.error('Please select a file to upload.');
    if (!form.title.trim()) return toast.error('Title is required.');

    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('title', form.title.trim());
    fd.append('caption', form.caption.trim());
    fd.append('type', form.type);
    fd.append('views', form.views || '0');
    fd.append('enabled', String(form.enabled));
    fd.append('order', String(items.length)); // append at end

    try {
      setSubmitting(true);
      await createExploreItem(fd);
      toast.success('Explore item added!');
      setForm(EMPTY_FORM);
      clearFileSelection();
      await fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Reorder ─────────────────────────────────────────────────────────────
  const moveItem = async (id, direction) => {
    const idx = items.findIndex((i) => i._id === id);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= items.length) return;

    const copy = [...items];
    [copy[idx], copy[nextIdx]] = [copy[nextIdx], copy[idx]];
    setItems(copy); // optimistic update

    try {
      await reorderExploreItems(copy.map((i) => i._id));
    } catch {
      toast.error('Reorder failed');
      fetchItems(); // rollback
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this explore item? This cannot be undone.')) return;
    try {
      await deleteExploreItem(id);
      toast.success('Item deleted');
      fetchItems();
    } catch {
      toast.error('Delete failed');
    }
  };

  // ─── Toggle enabled ────────────────────────────────────────────────────────
  const handleToggleEnabled = async (item) => {
    const fd = new FormData();
    fd.append('enabled', String(!item.enabled));
    try {
      await updateExploreItem(item._id, fd);
      toast.success(item.enabled ? 'Item hidden' : 'Item enabled');
      fetchItems();
    } catch {
      toast.error('Update failed');
    }
  };

  // ─── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      title: item.title,
      caption: item.caption || '',
      type: item.type,
      views: String(item.views ?? 0),
      enabled: item.enabled,
    });
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditFile(file);
    if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    setEditPreviewUrl(URL.createObjectURL(file));
  };

  const handleEditSave = async () => {
    if (!editForm.title.trim()) return toast.error('Title is required.');
    const fd = new FormData();
    if (editFile) fd.append('file', editFile);
    fd.append('title', editForm.title.trim());
    fd.append('caption', editForm.caption.trim());
    fd.append('type', editForm.type);
    fd.append('views', editForm.views || '0');
    fd.append('enabled', String(editForm.enabled));

    try {
      setEditSubmitting(true);
      await updateExploreItem(editItem._id, fd);
      toast.success('Item updated!');
      setEditItem(null);
      setEditFile(null);
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
      setEditPreviewUrl(null);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      key: '_index',
      label: '#',
      align: 'center',
      render: (val) => (
        <span className="text-xs font-bold text-content-tertiary">{val}</span>
      ),
    },
    {
      key: 'preview',
      label: 'Preview',
      render: (_, row) => (
        <div className="w-12 h-12 overflow-hidden border border-border bg-surface-elevated flex-shrink-0">
          <MediaPreview src={buildMediaUrl(row.fileUrl)} type={row.type} />
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-content-primary">{val}</span>
          {row.caption && (
            <span className="text-xs text-content-tertiary line-clamp-1">{row.caption}</span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      align: 'center',
      render: (val) => (
        <Badge variant={val === 'image' ? 'teal' : 'purple'}>{val}</Badge>
      ),
    },
    {
      key: 'views',
      label: 'Views',
      align: 'right',
      render: (val) => (
        <span className="font-semibold text-content-primary">
          {Number(val || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'enabled',
      label: 'Status',
      align: 'center',
      render: (val) => (
        <Badge status={val ? 'success' : 'danger'}>{val ? 'Enabled' : 'Hidden'}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row, idx) => (
        <div className="flex justify-end gap-1">
          <Button variant="icon" title="Move up" onClick={(e) => { e.stopPropagation(); moveItem(row._id, 'up'); }}>
            <RiArrowUpSLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Move down" onClick={(e) => { e.stopPropagation(); moveItem(row._id, 'down'); }}>
            <RiArrowDownSLine className="w-4 h-4" />
          </Button>
          <Button
            variant="icon"
            title={row.enabled ? 'Hide item' : 'Enable item'}
            onClick={(e) => { e.stopPropagation(); handleToggleEnabled(row); }}
          >
            {row.enabled
              ? <RiEyeOffLine className="w-4 h-4 text-content-tertiary" />
              : <RiEyeLine className="w-4 h-4 text-brand-teal" />
            }
          </Button>
          <Button variant="icon" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
            <RiEdit2Line className="w-4 h-4 text-brand-teal" />
          </Button>
          <Button variant="icon" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }}>
            <RiDeleteBin6Line className="w-4 h-4 text-state-danger" />
          </Button>
        </div>
      ),
    },
  ];

  const tableData = items.map((item, idx) => ({ ...item, _index: idx + 1 }));

  const enabledCount = items.filter((i) => i.enabled).length;

  return (
    <div className="page-container max-w-6xl mx-auto">
      <PageHeader
        title="Explore Manager"
        subtitle="Upload images, videos & reels shown in the Explore section for all users"
      >
        <Button variant="secondary" icon={RiRefreshLine} onClick={fetchItems}>
          Refresh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Upload Card ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New</CardTitle>
            <CardDescription>Add an image or video to the Explore grid</CardDescription>
          </CardHeader>
          <div className="p-6 space-y-4">
            {/* Drop zone */}
            <div
              className={`relative border-2 border-dashed transition-colors rounded-sm cursor-pointer
                ${filePreviewUrl
                  ? 'border-brand-teal bg-brand-teal/5'
                  : 'border-border hover:border-brand-teal/60 bg-surface-elevated'
                }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {filePreviewUrl ? (
                <div className="relative w-full h-40">
                  <MediaPreview src={filePreviewUrl} type={form.type} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearFileSelection(); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <RiCloseLine className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] font-bold px-3 py-1 line-clamp-1">
                    {selectedFile?.name}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <RiUploadCloud2Line className="w-10 h-10 text-content-tertiary" />
                  <p className="text-sm font-bold text-content-secondary">Click to select file</p>
                  <p className="text-xs text-content-tertiary">JPG, PNG, WebP, MP4, MOV — up to 100MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <Input
              label="Title *"
              placeholder="e.g. Summer Promo Reel"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              label="Caption"
              placeholder="Short description shown on the post"
              value={form.caption}
              onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
            />
            <Select
              label="Media Type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              options={TYPE_OPTIONS}
            />
            <Input
              label="Views (display count)"
              type="number"
              min="0"
              value={form.views}
              onChange={(e) => setForm((p) => ({ ...p, views: e.target.value }))}
            />

            {/* Enabled toggle */}
            <div className="flex items-center justify-between p-3 border border-border bg-surface-elevated">
              <div className="flex items-center gap-2">
                {form.type === 'image'
                  ? <RiImageLine className="w-4 h-4 text-brand-teal" />
                  : <RiFilmLine className="w-4 h-4 text-brand-purple" />
                }
                <div>
                  <p className="text-sm font-bold text-content-primary">Visibility</p>
                  <p className="text-xs text-content-tertiary">Show in Explore section</p>
                </div>
              </div>
              <Button
                variant={form.enabled ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setForm((p) => ({ ...p, enabled: !p.enabled }))}
              >
                {form.enabled ? 'Enabled' : 'Hidden'}
              </Button>
            </div>

            <Button
              icon={RiAddLine}
              onClick={handleAdd}
              loading={submitting}
              disabled={submitting || !selectedFile}
              className="w-full"
            >
              {submitting ? 'Uploading…' : 'Upload & Add'}
            </Button>
          </div>
        </Card>

        {/* ── Live Grid Preview ───────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 w-full">
              <div>
                <CardTitle>Current Explore Grid</CardTitle>
                <CardDescription>Shows enabled items as customers see them</CardDescription>
              </div>
              <Badge variant="info">{enabledCount} visible / {items.length} total</Badge>
            </div>
          </CardHeader>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-content-tertiary text-sm">
                Loading…
              </div>
            ) : items.filter((i) => i.enabled).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-content-tertiary">
                <RiUploadCloud2Line className="w-12 h-12 opacity-30" />
                <p className="text-sm font-bold">No enabled items yet. Upload your first file!</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-0.5 bg-border">
                {items.filter((i) => i.enabled).slice(0, 12).map((item) => (
                  <div key={item._id} className="relative aspect-[9/16] overflow-hidden bg-zinc-900">
                    <MediaPreview src={buildMediaUrl(item.fileUrl)} type={item.type} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 right-1">
                      <Badge variant={item.type === 'image' ? 'teal' : 'purple'} className="text-[8px]">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-content-tertiary mt-3">
              Tip: Only <span className="font-bold">Enabled</span> items appear in the Explore section.
              Showing first 12 enabled items.
            </p>
          </div>
        </Card>
      </div>

      {/* ── Items Table ─────────────────────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Manage Items</CardTitle>
          <CardDescription>Edit, reorder, enable/disable, or delete explore items</CardDescription>
        </CardHeader>
        <DataTable
          columns={columns}
          data={tableData}
          onRowClick={(row) => openEdit(row)}
        />
      </Card>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editItem}
        onClose={() => { setEditItem(null); setEditFile(null); setEditPreviewUrl(null); }}
        title="Edit Explore Item"
        footer={editItem ? (
          <>
            <Button variant="secondary" onClick={() => { setEditItem(null); }}>Cancel</Button>
            <Button onClick={handleEditSave} loading={editSubmitting} disabled={editSubmitting}>
              {editSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </>
        ) : null}
      >
        {editItem && (
          <div className="space-y-4">
            {/* Current / New media preview */}
            <div
              className="relative w-full h-44 overflow-hidden border border-border bg-surface-elevated cursor-pointer"
              onClick={() => editFileInputRef.current?.click()}
              title="Click to replace file"
            >
              <MediaPreview
                src={editPreviewUrl || buildMediaUrl(editItem.fileUrl)}
                type={editForm.type}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                <span className="text-white text-xs font-bold flex items-center gap-2">
                  <RiUploadCloud2Line className="w-5 h-5" /> Replace File
                </span>
              </div>
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleEditFileChange}
              />
              {editFile && (
                <div className="absolute bottom-0 inset-x-0 bg-brand-teal/90 text-white text-[10px] font-bold px-3 py-1">
                  New: {editFile.name}
                </div>
              )}
            </div>

            <Input
              label="Title *"
              value={editForm.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              label="Caption"
              value={editForm.caption}
              onChange={(e) => setEditForm((p) => ({ ...p, caption: e.target.value }))}
            />
            <Select
              label="Media Type"
              value={editForm.type}
              onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
              options={TYPE_OPTIONS}
            />
            <Input
              label="Views"
              type="number"
              min="0"
              value={editForm.views}
              onChange={(e) => setEditForm((p) => ({ ...p, views: e.target.value }))}
            />
            <div className="flex items-center justify-between p-3 border border-border bg-surface-elevated">
              <div>
                <p className="text-sm font-bold text-content-primary">Visibility</p>
                <p className="text-xs text-content-tertiary">Toggle Explore section display</p>
              </div>
              <Button
                variant={editForm.enabled ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setEditForm((p) => ({ ...p, enabled: !p.enabled }))}
              >
                {editForm.enabled ? 'Enabled' : 'Hidden'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
