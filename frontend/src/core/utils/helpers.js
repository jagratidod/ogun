export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function getStatusColor(status) {
  const colors = {
    active: 'text-state-success',
    inactive: 'text-state-danger',
    pending: 'text-state-warning',
    approved: 'text-state-success',
    rejected: 'text-state-danger',
    delivered: 'text-state-success',
    dispatched: 'text-state-warning',
    open: 'text-state-warning',
    closed: 'text-state-success',
    in_progress: 'text-brand-teal',
    assigned: 'text-state-info',
  };
  return colors[status] || 'text-content-secondary';
}

export function truncate(str, maxLen = 40) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
