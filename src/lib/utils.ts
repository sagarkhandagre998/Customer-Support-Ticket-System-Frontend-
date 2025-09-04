import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(date);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'HIGH':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'LOW':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'IN_PROGRESS':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'RESOLVED':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'CLOSED':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'OPEN':
      return '🔵';
    case 'IN_PROGRESS':
      return '🟡';
    case 'RESOLVED':
      return '🟢';
    case 'CLOSED':
      return '⚫';
    default:
      return '⚪';
  }
}

export function getRoleColor(role: any): string {
  // Handle different role types
  let roleString = role;
  if (typeof role === 'object' && role.name) {
    roleString = role.name;
  } else if (typeof role !== 'string') {
    roleString = String(role);
  }
  
  switch (roleString) {
    case 'ROLE_ADMIN':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'ROLE_AGENT':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'ROLE_USER':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getDisplayName(user: { name?: string; email: string }): string {
  return user.name || user.email.split('@')[0] || 'Unknown User';
}

export function getInitials(user: { name?: string; email: string } | string | undefined | null): string {
  let name: string;
  
  if (typeof user === 'string') {
    name = user;
  } else if (user && typeof user === 'object') {
    name = getDisplayName(user);
  } else {
    return 'U';
  }
  
  if (!name || typeof name !== 'string') {
    return 'U';
  }
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateTicketId(): string {
  return 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
