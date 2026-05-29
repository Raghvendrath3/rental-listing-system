/**
 * Format price for display.
 * IMPORTANT: price comes as a string from PostgreSQL, must convert to number first.
 */
export function formatPrice(price: string | number): string {
  const numericPrice = typeof price === 'string' ? Number(price) : price;
  
  if (isNaN(numericPrice)) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

/**
 * Format date for display.
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) {
    return '-';
  }
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
}

/**
 * Format date with time for display.
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) {
    return '-';
  }
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) {
    return '-';
  }
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return formatDate(dateString);
  } catch {
    return '-';
  }
}

/**
 * Capitalize first letter of each word.
 * Note: Backend lowercases title, type, city, area via DB triggers.
 * Use this for display purposes.
 */
export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
