export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function getTimeUntilExpiry(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry - now;

  if (diffMs <= 0) return { text: 'Expired', percent: 0, urgent: true };

  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text;
  if (diffHours >= 24) {
    text = `${Math.floor(diffHours / 24)}d ${Math.floor(diffHours % 24)}h left`;
  } else if (diffHours >= 1) {
    text = `${Math.floor(diffHours)}h ${diffMins}m left`;
  } else {
    text = `${diffMins}m left`;
  }

  // Percent freshness assuming 48h max window for visual ring
  const percent = Math.max(0, Math.min(100, (diffHours / 48) * 100));
  const urgent = diffHours < 2;

  return { text, percent, urgent };
}

export function statusLabel(status) {
  if (!status) return '';
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}
