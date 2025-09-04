'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Bell, Search, Plus, User, Settings, LogOut, ChevronDown, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { getInitials, getRoleColor, getDisplayName } from '@/lib/utils';

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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Modern Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Search bar */}
              <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets, users, or anything..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                  3
                </span>
              </button>

              {/* New Ticket Button - Only show for non-admin users */}
              {formatRole(user.role) !== 'ADMIN' && (
                <Button size="sm" className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              )}

              {/* User menu */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">{formatRole(user.role)}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white shadow-sm">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User Avatar'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
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
                      
                      <div className="p-2">
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-gray-100 my-2" />
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
