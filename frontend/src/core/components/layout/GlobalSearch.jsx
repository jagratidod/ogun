import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiSearchLine, RiCloseLine, RiLoader4Line,
  RiShoppingCartLine, RiTruckLine, RiStore2Line,
  RiUserLine, RiCustomerServiceLine, RiBox3Line
} from 'react-icons/ri';
import api from '../../api';

const CATEGORIES = [
  { key: 'orders',       label: 'Orders',       icon: RiShoppingCartLine, color: 'text-brand-teal' },
  { key: 'distributors', label: 'Distributors',  icon: RiTruckLine,        color: 'text-blue-500' },
  { key: 'retailers',    label: 'Retailers',     icon: RiStore2Line,       color: 'text-brand-pink' },
  { key: 'customers',    label: 'Customers',     icon: RiUserLine,         color: 'text-purple-500' },
  { key: 'tickets',      label: 'Service',       icon: RiCustomerServiceLine, color: 'text-amber-500' },
  { key: 'products',     label: 'Products',      icon: RiBox3Line,         color: 'text-green-500' },
];

const ROUTE_MAP = {
  orders:       (item) => `/admin/orders`,
  distributors: (item) => `/admin/distributors`,
  retailers:    (item) => `/admin/retailers`,
  customers:    (item) => `/admin/customers`,
  tickets:      (item) => `/admin/service`,
  products:     (item) => `/admin/inventory/products`,
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Flatten results for keyboard nav
  const flatResults = CATEGORIES.flatMap(cat =>
    (results[cat.key] || []).map(item => ({ ...item, _cat: cat.key }))
  );

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults({}); return; }
    setLoading(true);
    try {
      const [ordersRes, distRes, retailRes, custRes, ticketRes, prodRes] = await Promise.allSettled([
        api.get('/admin/orders'),
        api.get('/admin/distributors'),
        api.get('/admin/retailers'),
        api.get('/admin/customers'),
        api.get('/admin/service-requests'),
        api.get('/admin/products'),
      ]);

      const lower = q.toLowerCase();
      const match = (str) => String(str || '').toLowerCase().includes(lower);

      const orders = ordersRes.status === 'fulfilled'
        ? (ordersRes.value.data?.data || []).filter(o =>
            match(o.orderId) || match(o.buyer?.name) || match(o.buyer?.shopName)
          ).slice(0, 4).map(o => ({ id: o._id, label: o.orderId, sub: o.buyer?.shopName || o.buyer?.name }))
        : [];

      const distributors = distRes.status === 'fulfilled'
        ? (distRes.value.data?.data || []).filter(d =>
            match(d.name) || match(d.businessName) || match(d.email) || match(d.location)
          ).slice(0, 4).map(d => ({ id: d.id, label: d.businessName || d.name, sub: d.email }))
        : [];

      const retailers = retailRes.status === 'fulfilled'
        ? (retailRes.value.data?.data || []).filter(r =>
            match(r.name) || match(r.shopName) || match(r.email) || match(r.location)
          ).slice(0, 4).map(r => ({ id: r.id, label: r.shopName || r.name, sub: r.email }))
        : [];

      const customers = custRes.status === 'fulfilled'
        ? (custRes.value.data?.data || []).filter(c =>
            match(c.name) || match(c.email)
          ).slice(0, 4).map(c => ({ id: c.id, label: c.name, sub: c.email }))
        : [];

      const tickets = ticketRes.status === 'fulfilled'
        ? (ticketRes.value.data?.data || []).filter(t =>
            match(t.ticketId) || match(t.issueCategory) || match(t.customer?.name)
          ).slice(0, 4).map(t => ({ id: t._id, label: `#${t.ticketId}`, sub: `${t.issueCategory} — ${t.customer?.name}` }))
        : [];

      const products = prodRes.status === 'fulfilled'
        ? (prodRes.value.data?.data || []).filter(p =>
            match(p.name) || match(p.sku) || match(p.category)
          ).slice(0, 4).map(p => ({ id: p._id, label: p.name, sub: p.category }))
        : [];

      setResults({ orders, distributors, retailers, customers, tickets, products });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search(debouncedQuery); }, [debouncedQuery, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flatResults.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIdx >= 0) {
      const item = flatResults[activeIdx];
      if (item) { navigate(ROUTE_MAP[item._cat](item)); setOpen(false); setQuery(''); }
    }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  const handleSelect = (cat, item) => {
    navigate(ROUTE_MAP[cat](item));
    setOpen(false);
    setQuery('');
  };

  const totalResults = flatResults.length;
  const hasResults = totalResults > 0;

  return (
    <div className="relative">
      {/* Input */}
      <div className="relative flex items-center">
        <RiSearchLine className="absolute left-3 w-4 h-4 text-content-tertiary pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anything..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="input-field pl-10 pr-8 w-64 lg:w-80"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults({}); inputRef.current?.focus(); }}
            className="absolute right-3 text-content-tertiary hover:text-content-primary transition-colors"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-[420px] bg-surface-card border border-border shadow-dropdown z-50 overflow-hidden animate-scale-in"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-content-tertiary">
              <RiLoader4Line className="w-4 h-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center">
              <RiSearchLine className="w-8 h-8 text-content-tertiary mx-auto mb-2 opacity-40" />
              <p className="text-sm text-content-tertiary">No results for "<span className="font-semibold">{query}</span>"</p>
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
              {CATEGORIES.map(cat => {
                const items = results[cat.key] || [];
                if (!items.length) return null;
                const Icon = cat.icon;
                return (
                  <div key={cat.key}>
                    {/* Category header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border-b border-border">
                      <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      <span className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">{cat.label}</span>
                      <span className="ml-auto text-[10px] text-content-tertiary">{items.length}</span>
                    </div>
                    {/* Items */}
                    {items.map((item, i) => {
                      const globalIdx = flatResults.findIndex(f => f.id === item.id && f._cat === cat.key);
                      const isActive = globalIdx === activeIdx;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(cat.key, item)}
                          onMouseEnter={() => setActiveIdx(globalIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-border/40 last:border-0 ${
                            isActive ? 'bg-brand-teal/8 text-brand-teal' : 'hover:bg-surface-hover'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-teal' : cat.color} opacity-70`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isActive ? 'text-brand-teal' : 'text-content-primary'}`}>
                              {item.label}
                            </p>
                            {item.sub && (
                              <p className="text-xs text-content-tertiary truncate">{item.sub}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="px-4 py-2 border-t border-border bg-surface-elevated">
                <p className="text-[10px] text-content-tertiary">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} · Press <kbd className="px-1 py-0.5 bg-surface-input border border-border text-[9px] font-mono">↑↓</kbd> to navigate · <kbd className="px-1 py-0.5 bg-surface-input border border-border text-[9px] font-mono">Enter</kbd> to open · <kbd className="px-1 py-0.5 bg-surface-input border border-border text-[9px] font-mono">Esc</kbd> to close
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
