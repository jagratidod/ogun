import { useMemo, useState } from 'react';
import {
  RiImage2Line,
  RiAddLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiRefreshLine,
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, Modal } from '../../../core';
import { socialGridAssets } from '../../../data/socialGridAssets';
import { useSocialGrid } from '../../../core/hooks/useSocialGrid';
import SocialGrid from '../../../core/components/social/SocialGrid';

function getAssetByValue(value) {
  return socialGridAssets.find((a) => a.value === value) || socialGridAssets[0];
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `sg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function stripInternal(row) {
  if (!row) return row;
  // DataTable row may include internal keys like `_index`
  // Keep only persisted fields.
  const { _index, ...rest } = row;
  return rest;
}

export default function SocialGridManagerPage() {
  const { items, addItem, updateItem, removeItem, moveItem, resetDefaults } = useSocialGrid();
  const [assetValue, setAssetValue] = useState(socialGridAssets[0]?.value || 'image1');
  const [postType, setPostType] = useState(getAssetByValue(assetValue)?.type || 'image');
  const [views, setViews] = useState('1000');
  const [enabled, setEnabled] = useState(true);
  const [editItem, setEditItem] = useState(null);

  const asset = useMemo(() => getAssetByValue(assetValue), [assetValue]);
  const typeOptions = useMemo(() => {
    if (asset?.type === 'video') {
      return [
        { label: 'Reel', value: 'reel' },
        { label: 'Video', value: 'video' },
      ];
    }
    return [{ label: 'Image', value: 'image' }];
  }, [asset?.type]);

  const tableData = useMemo(() => items.map((it, idx) => ({ ...it, _index: idx + 1 })), [items]);

  const columns = useMemo(() => ([
    {
      key: '_index',
      label: '#',
      align: 'center',
      render: (val) => <span className="text-xs font-bold text-content-tertiary">{val}</span>,
    },
    {
      key: 'preview',
      label: 'Preview',
      render: (_, row) => (
        <div className="w-12 h-12 overflow-hidden border border-border bg-surface-elevated">
          {row.type === 'video' || row.type === 'reel' ? (
            <video src={row.src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
          ) : (
            <img src={row.src} alt={row.label} className="w-full h-full object-cover" />
          )}
        </div>
      ),
    },
    {
      key: 'label',
      label: 'Asset',
      sortable: false,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-content-primary">{val}</span>
          <span className="text-xs text-content-tertiary">{row.value}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      align: 'center',
      render: (val) => (
        <Badge variant={val === 'image' ? 'teal' : 'purple'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'views',
      label: 'Views',
      align: 'right',
      render: (val) => <span className="font-semibold text-content-primary">{Number(val || 0).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'enabled',
      label: 'Status',
      align: 'center',
      render: (val) => (
        <Badge status={val ? 'success' : 'danger'}>
          {val ? 'Enabled' : 'Hidden'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="icon"
            title="Move up"
            onClick={(e) => {
              e.stopPropagation();
              moveItem(row.id, 'up');
            }}
          >
            <RiArrowUpSLine className="w-4 h-4" />
          </Button>
          <Button
            variant="icon"
            title="Move down"
            onClick={(e) => {
              e.stopPropagation();
              moveItem(row.id, 'down');
            }}
          >
            <RiArrowDownSLine className="w-4 h-4" />
          </Button>
          <Button
            variant="icon"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              setEditItem(stripInternal(row));
            }}
          >
            <RiEdit2Line className="w-4 h-4 text-brand-teal" />
          </Button>
          <Button
            variant="icon"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              removeItem(row.id);
              toast.success('Removed item');
            }}
          >
            <RiDeleteBin6Line className="w-4 h-4 text-state-danger" />
          </Button>
        </div>
      ),
    },
  ]), [moveItem, removeItem]);

  const handleAssetChange = (val) => {
    setAssetValue(val);
    const next = getAssetByValue(val);
    setPostType(next?.type === 'video' ? 'reel' : (next?.type || 'image'));
  };

  const handleAdd = () => {
    const picked = getAssetByValue(assetValue);
    const numericViews = Math.max(0, Number(views || 0));

    addItem({
      id: newId(),
      enabled,
      label: picked.label,
      value: picked.value,
      type: picked.type === 'video' ? postType : 'image',
      src: picked.src,
      views: numericViews,
    });

    toast.success('Added to social grid');
  };

  return (
    <div className="page-container max-w-6xl mx-auto">
      <PageHeader
        title="Social Grid"
        subtitle="Manage footer social posts (images, reels, and videos) shown to customers"
      >
        <Button
          variant="secondary"
          icon={RiRefreshLine}
          onClick={() => {
            resetDefaults();
            toast.success('Reset to defaults');
          }}
        >
          Reset Defaults
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 w-full">
              <div>
                <CardTitle>Current Grid</CardTitle>
                <CardDescription>Order is top-to-bottom, left-to-right</CardDescription>
              </div>
              <Badge variant="info">{items.length} items</Badge>
            </div>
          </CardHeader>
          <div className="p-6">
            <SocialGrid items={items.filter((i) => i.enabled).slice(0, 12)} columns={4} />
            <p className="text-xs text-content-tertiary mt-3">
              Tip: only <span className="font-bold">Enabled</span> items appear on customer home footer.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New</CardTitle>
            <CardDescription>Pick from `src/assets/grid`</CardDescription>
          </CardHeader>
          <div className="p-6 space-y-4">
            <Select
              label="Asset"
              value={assetValue}
              onChange={(e) => handleAssetChange(e.target.value)}
              options={socialGridAssets.map((a) => ({ label: a.label, value: a.value }))}
            />
            <Select
              label="Post Type"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              options={typeOptions}
            />
            <Input
              label="Views"
              type="number"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              min="0"
            />

            <div className="flex items-center justify-between p-3 border border-border bg-surface-elevated">
              <div className="flex items-center gap-2">
                <RiImage2Line className="w-4 h-4 text-brand-teal" />
                <div>
                  <p className="text-sm font-bold text-content-primary">Visibility</p>
                  <p className="text-xs text-content-tertiary">Show this in customer footer</p>
                </div>
              </div>
              <Button
                variant={enabled ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setEnabled((v) => !v)}
              >
                {enabled ? 'Enabled' : 'Hidden'}
              </Button>
            </div>

            <Button icon={RiAddLine} onClick={handleAdd} className="w-full">
              Add Item
            </Button>

            <div className="pt-2 border-t border-border">
              <div className="w-full h-24 overflow-hidden border border-border bg-surface-elevated">
                {asset?.type === 'video' ? (
                  <video src={asset.src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                ) : (
                  <img src={asset?.src} alt={asset?.label} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Manage Items</CardTitle>
          <CardDescription>Edit, reorder, or hide items</CardDescription>
        </CardHeader>
        <DataTable
          columns={columns}
          data={tableData}
          onRowClick={(row) => setEditItem(stripInternal(row))}
        />
      </Card>

      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Social Grid Item"
        footer={editItem ? (
          <>
            <Button variant="secondary" onClick={() => setEditItem(null)}>Close</Button>
            <Button
              onClick={() => {
                updateItem(editItem.id, stripInternal(editItem));
                toast.success('Updated item');
                setEditItem(null);
              }}
            >
              Save
            </Button>
          </>
        ) : null}
      >
        {editItem && (
          <div className="space-y-4">
            <div className="w-full h-40 overflow-hidden border border-border bg-surface-elevated">
              {editItem.type === 'video' || editItem.type === 'reel' ? (
                <video src={editItem.src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
              ) : (
                <img src={editItem.src} alt={editItem.label} className="w-full h-full object-cover" />
              )}
            </div>

            <Input
              label="Views"
              type="number"
              value={String(editItem.views ?? 0)}
              onChange={(e) => setEditItem((p) => ({ ...p, views: Math.max(0, Number(e.target.value || 0)) }))}
              min="0"
            />

            <Select
              label="Type"
              value={editItem.type}
              onChange={(e) => setEditItem((p) => ({ ...p, type: e.target.value }))}
              options={
                getAssetByValue(editItem.value)?.type !== 'video'
                  ? [{ label: 'Image', value: 'image' }]
                  : [
                      { label: 'Reel', value: 'reel' },
                      { label: 'Video', value: 'video' },
                    ]
              }
            />

            <div className="flex items-center justify-between p-3 border border-border bg-surface-elevated">
              <div>
                <p className="text-sm font-bold text-content-primary">Visibility</p>
                <p className="text-xs text-content-tertiary">Toggle customer footer display</p>
              </div>
              <Button
                variant={editItem.enabled ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setEditItem((p) => ({ ...p, enabled: !p.enabled }))}
              >
                {editItem.enabled ? 'Enabled' : 'Hidden'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
