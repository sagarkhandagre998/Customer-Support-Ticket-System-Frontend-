'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn, getInitials, getRoleColor } from '@/lib/utils';

// Helper function to safely format role
const formatRole = (role: any): string => {
  if (typeof role === 'string') {
    return role.replace('ROLE_', '').replace('_', ' ');
  }
  if (role && typeof role === 'object' && role.name) {
    return role.name.replace('ROLE_', '').replace('_', ' ');
  }
  return 'Unknown';
};

import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  BarChart3,
  FileText,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ROLE_USER', 'ROLE_AGENT', 'ROLE_ADMIN'],
  },
  {
    name: 'My Tickets',
    href: '/dashboard/tickets',
    icon: Ticket,
    roles: ['ROLE_USER'], // Removed ROLE_AGENT since they have Agent Dashboard
  },
  {
    name: 'Agent Dashboard',
    href: '/dashboard/agent',
    icon: FileText,
    roles: ['ROLE_AGENT'],
  },
  {
    name: 'Admin Dashboard',
    href: '/dashboard/admin',
    icon: BarChart3,
    roles: ['ROLE_ADMIN'],
  },
  {
    name: 'All Tickets',
    href: '/dashboard/all-tickets',
    icon: FileText,
    roles: ['ROLE_ADMIN'],
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: ['ROLE_ADMIN'],
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    roles: ['ROLE_USER', 'ROLE_AGENT', 'ROLE_ADMIN'],
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['ROLE_USER', 'ROLE_AGENT', 'ROLE_ADMIN'],
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Helper function to extract role name from role object or string
  const getRoleName = (role: any): string => {
    if (typeof role === 'string') {
      return role;
    }
    if (role && typeof role === 'object' && role.name) {
      return role.name;
    }
    return '';
  };

  const filteredNavigation = navigationItems.filter(item => {
    const userRole = getRoleName(user.role);
    return item.roles.includes(userRole);
  });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Modern Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 20 }}
        className={cn(
          'h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-professional-lg',
          // Mobile: fixed positioning with slide animation
          'fixed left-0 top-0 z-50 lg:hidden',
          // Desktop: static positioning, always visible
          'lg:relative lg:translate-x-0 lg:z-auto lg:block',
          // Mobile animation states
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TicketPro</span>
            </Link>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white shadow-sm">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium mt-1">
                  {formatRole(user.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
