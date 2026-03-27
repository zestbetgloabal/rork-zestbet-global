export function formatCoins(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins}m`;
  if (diffHours < 24) return `vor ${diffHours}h`;
  if (diffDays < 7) return `vor ${diffDays}d`;

  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const end = new Date(expiresAt);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return 'Abgelaufen';

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);

  if (days > 0) return `${days}d ${hours}h übrig`;
  if (hours > 0) return `${hours}h übrig`;

  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `${mins}m übrig`;
}

export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    sports: '⚽',
    gaming: '🎮',
    fitness: '💪',
    knowledge: '🧠',
    fun: '🎲',
    custom: '✨',
  };
  return map[category] ?? '🎯';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Offen',
    active: 'Aktiv',
    waiting_result: 'Ergebnis eingeben',
    disputed: 'Streitig',
    completed: 'Abgeschlossen',
    expired: 'Abgelaufen',
    cancelled: 'Storniert',
  };
  return map[status] ?? status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: '#FBBF24',
    active: '#34D399',
    waiting_result: '#F5A623',
    disputed: '#EF4444',
    completed: '#8E92A4',
    expired: '#5A5E6E',
    cancelled: '#5A5E6E',
  };
  return map[status] ?? '#8E92A4';
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ZEST-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
