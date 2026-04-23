import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../../../core/context/AuthContext';
import { generateId } from '../../../core/utils/helpers';

import productsSeed from '../../../data/products.json';
import ordersSeed from '../../../data/orders.json';
import entitiesSeed from '../../../data/entities.json';
import accountsSeed from '../../../data/accounts.json';
import rewardsSeed from '../../../data/rewards.json';

const STORAGE_PREFIX = 'ogun.distributor.state.v1';

function storageKeyForUser(user) {
  const email = (user?.email || 'anonymous').toLowerCase();
  return `${STORAGE_PREFIX}:${email}`;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function seedStateForUser(user) {
  const distributorName = user?.name || 'Distributor';

  // Clone so we don't accidentally mutate imported JSON.
  const products = clone(productsSeed);

  // Normalize orders: keep two buckets: "Order" and "Restock Request".
  const orders = clone(ordersSeed).map((o) => {
    const normalized = { ...o };
    if (!normalized.type) normalized.type = 'Order';
    if (normalized.type === 'Order') {
      normalized.distributor = distributorName;
      normalized.status = normalized.status || 'Processing';
      normalized.paymentStatus = normalized.paymentStatus || 'Pending';
    }
    if (normalized.type === 'Restock Request') {
      // Assign requests to current distributor so the flow is usable for any logged-in distributor.
      normalized.distributor = distributorName;
      normalized.itemsCount = normalized.itemsCount ?? (Array.isArray(normalized.items) ? normalized.items.length : 0);
      normalized.status = normalized.status || 'Requested';
    }
    return normalized;
  });

  // Make retailers "belong" to current distributor.
  const retailers = clone(entitiesSeed.retailers || []).map((r) => ({
    ...r,
    distributor: distributorName,
  }));

  // Minimal shipment tracking created from approved/dispatched requests.
  const shipments = [];

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    distributor: {
      name: distributorName,
      email: user?.email || '',
    },
    products,
    retailers,
    orders,
    shipments,
    // These are read-only in UI for now, but kept here for future server sync.
    accounts: clone(accountsSeed),
    rewards: clone(rewardsSeed),
  };
}

function loadState(user) {
  try {
    const raw = localStorage.getItem(storageKeyForUser(user));
    if (!raw) return seedStateForUser(user);
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return seedStateForUser(user);
    return parsed;
  } catch {
    return seedStateForUser(user);
  }
}

function saveState(user, state) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(storageKeyForUser(user), JSON.stringify(next));
  return next;
}

export function useDistributorStore() {
  const { user } = useAuthContext();
  const [state, setState] = useState(() => loadState(user));

  // Reload store when switching users (logout/login).
  useEffect(() => {
    setState(loadState(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return saveState(user, next);
    });
  }, [user]);

  const products = state.products || [];
  const retailers = state.retailers || [];
  const orders = state.orders || [];
  const shipments = state.shipments || [];

  const restockRequests = useMemo(
    () => orders.filter((o) => o.type === 'Restock Request'),
    [orders]
  );

  const normalOrders = useMemo(
    () => orders.filter((o) => o.type === 'Order'),
    [orders]
  );

  const approveRestockRequest = useCallback((requestId) => {
    persist((prev) => ({
      ...prev,
      orders: (prev.orders || []).map((o) =>
        o.id === requestId ? { ...o, status: 'Approved' } : o
      ),
    }));
  }, [persist]);

  const dispatchRestockRequest = useCallback((requestId, { carrier, eta }) => {
    persist((prev) => {
      const req = (prev.orders || []).find((o) => o.id === requestId);
      if (!req) return prev;

      const shipmentId = generateId('SHP');
      const createdAt = new Date().toISOString();

      const shipment = {
        id: shipmentId,
        requestId,
        retailer: req.retailer,
        items: req.itemsCount || (Array.isArray(req.items) ? req.items.length : 0),
        status: 'In Transit',
        carrier: carrier || 'Local Delivery Service',
        eta: eta || 'Tomorrow, 10:00 AM',
        createdAt,
        lastUpdate: createdAt,
      };

      return {
        ...prev,
        orders: (prev.orders || []).map((o) =>
          o.id === requestId ? { ...o, status: 'Dispatched' } : o
        ),
        shipments: [shipment, ...(prev.shipments || [])],
      };
    });
  }, [persist]);

  const forceDeliverShipment = useCallback((shipmentId) => {
    persist((prev) => {
      const shp = (prev.shipments || []).find((s) => s.id === shipmentId);
      const now = new Date().toISOString();
      return {
        ...prev,
        shipments: (prev.shipments || []).map((s) =>
          s.id === shipmentId ? { ...s, status: 'Delivered', lastUpdate: now } : s
        ),
        orders: (prev.orders || []).map((o) =>
          shp?.requestId && o.id === shp.requestId ? { ...o, status: 'Delivered' } : o
        ),
      };
    });
  }, [persist]);

  const addManualShipment = useCallback(({ retailer, items, carrier, eta }) => {
    persist((prev) => {
      const now = new Date().toISOString();
      const shipment = {
        id: generateId('SHP'),
        requestId: null,
        retailer: retailer || 'Unknown Retailer',
        items: Number(items || 0),
        status: 'In Transit',
        carrier: carrier || 'Local Delivery Service',
        eta: eta || 'Tomorrow, 10:00 AM',
        createdAt: now,
        lastUpdate: now,
      };
      return { ...prev, shipments: [shipment, ...(prev.shipments || [])] };
    });
  }, [persist]);

  const requestWarehouseReplenish = useCallback((productId, qty) => {
    persist((prev) => {
      const id = generateId('REP');
      const now = new Date().toISOString();
      const product = (prev.products || []).find((p) => p.id === productId);
      const order = {
        id,
        type: 'Warehouse Replenishment',
        productId,
        productName: product?.name || 'Unknown Product',
        quantity: Number(qty || 0),
        status: 'Requested',
        date: now,
      };
      return { ...prev, orders: [order, ...(prev.orders || [])] };
    });
  }, [persist]);

  const kpis = useMemo(() => {
    const pending = restockRequests.filter((r) => r.status === 'Requested').length;
    const monthlySales = normalOrders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    const rewardsPoints = (state.rewards?.entities || []).find((e) => e.name === state.distributor?.name)?.totalPoints || 0;
    return {
      totalRetailers: retailers.length,
      pendingOrders: pending,
      monthlySales,
      rewardsPoints,
    };
  }, [normalOrders, restockRequests, retailers.length, state.distributor?.name, state.rewards?.entities]);

  return {
    user,
    state,
    products,
    retailers,
    orders,
    shipments,
    restockRequests,
    normalOrders,
    kpis,
    actions: {
      approveRestockRequest,
      dispatchRestockRequest,
      forceDeliverShipment,
      addManualShipment,
      requestWarehouseReplenish,
    },
  };
}

