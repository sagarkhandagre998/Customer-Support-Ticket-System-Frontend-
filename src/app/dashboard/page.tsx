'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
import { DashboardStats, Ticket } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { formatDate, getPriorityColor, getStatusColor } from '@/lib/utils';


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

import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Plus,
  ArrowRight,
  BarChart3,
  FileText,
  User,
  Settings,
  Shield,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsData, ticketsData] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getMyTickets(),
        ]);
        setStats(statsData);
        setRecentTickets(ticketsData.slice(0, 5)); // Show only 5 recent tickets
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats?.totalTickets || 0,
      icon: TicketIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Open Tickets',
      value: stats?.openTickets || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Resolved',
      value: stats?.resolvedTickets || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressTickets || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    // Admin-specific stats
    ...(getRoleName(user?.role) === 'ROLE_ADMIN' ? [
      {
        title: 'Total Users',
        value: stats?.totalUsers || 0,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: 'Support Agents',
        value: stats?.supportAgents || 0,
        icon: Users,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      }
    ] : []),
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-blue-100 text-lg">
                {getRoleName(user?.role) === 'ROLE_ADMIN' 
                  ? 'You have full administrative access to the system. Monitor tickets, manage users, and oversee operations.'
                  : 'Here\'s what\'s happening with your tickets today.'
                }
              </p>
              {getRoleName(user?.role) === 'ROLE_ADMIN' && (
                <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                  <Shield className="w-4 h-4 mr-2" />
                  Administrator Access
                </div>
              )}
            </div>
            <div className="mt-6 sm:mt-0">
              {getRoleName(user?.role) !== 'ROLE_ADMIN' && (
                <Button className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-lg" asChild>
                  <Link href="/dashboard/tickets/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Ticket
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-sm`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Priority Distribution */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                  Ticket Priority Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Overview of tickets by priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(stats.ticketsByPriority).map(([priority, count]) => (
                    <div key={priority} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getPriorityColor(priority)} mb-3`}>
                        {priority}
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Tickets - Only show for non-admin users */}
        {getRoleName(user?.role) !== 'ROLE_ADMIN' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="w-6 h-6 mr-3 text-blue-600" />
                      Recent Tickets
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Your latest ticket activity
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                    <Link href="/dashboard/tickets">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TicketIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No tickets yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first support ticket.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                      <Link href="/dashboard/tickets/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Ticket
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTickets.map((ticket) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Created {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100" asChild>
                          <Link href={`/dashboard/tickets/${ticket.id}`}>
                            View
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Admin Dashboard Section */}
        {getRoleName(user?.role) === 'ROLE_ADMIN' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl text-purple-800">
                  <BarChart3 className="w-6 h-6 mr-3 text-purple-600" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Administrative overview and quick actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-800 mb-2">User Management</h3>
                    <p className="text-sm text-purple-600 mb-4">Manage system users and roles</p>
                    <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100" asChild>
                      <Link href="/dashboard/users">
                        Manage Users
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-800 mb-2">All Tickets</h3>
                    <p className="text-sm text-purple-600 mb-4">View and manage all system tickets</p>
                    <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100" asChild>
                      <Link href="/dashboard/all-tickets">
                        View All Tickets
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-800 mb-2">System Analytics</h3>
                    <p className="text-sm text-purple-600 mb-4">Advanced analytics and reporting</p>
                    <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100" asChild>
                      <Link href="/dashboard/admin">
                        Admin Panel
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
         >
           <Card className="border-0 shadow-md">
             <CardHeader className="pb-4">
               <CardTitle className="flex items-center text-xl">
                 <Settings className="w-6 h-6 mr-3 text-blue-600" />
                 Quick Actions
               </CardTitle>
               <CardDescription className="text-gray-600">
                 Common tasks and shortcuts
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {getRoleName(user?.role) !== 'ROLE_ADMIN' && (
                   <Button variant="outline" className="h-auto p-6 flex-col border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200" asChild>
                     <Link href="/dashboard/tickets/new">
                       <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                         <Plus className="w-6 h-6 text-blue-600" />
                       </div>
                       <span className="font-medium">New Ticket</span>
                     </Link>
                   </Button>
                 )}
                 {getRoleName(user?.role) !== 'ROLE_ADMIN' && (
                   <Button variant="outline" className="h-auto p-6 flex-col border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200" asChild>
                     <Link href="/dashboard/tickets">
                       <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                         <TicketIcon className="w-6 h-6 text-green-600" />
                       </div>
                       <span className="font-medium">My Tickets</span>
                     </Link>
                   </Button>
                 )}
                 <Button variant="outline" className="h-auto p-6 flex-col border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200" asChild>
                   <Link href="/dashboard/profile">
                     <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                       <User className="w-6 h-6 text-purple-600" />
                     </div>
                     <span className="font-medium">Profile</span>
                   </Link>
                 </Button>
                 
                 {getRoleName(user?.role) === 'ROLE_ADMIN' && (
                   <Button variant="outline" className="h-auto p-6 flex-col border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200" asChild>
                     <Link href="/dashboard/admin">
                       <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                         <BarChart3 className="w-6 h-6 text-orange-600" />
                       </div>
                       <span className="font-medium">Admin Panel</span>
                     </Link>
                   </Button>
                 )}
                 {getRoleName(user?.role) !== 'ROLE_ADMIN' && (
                   <Button variant="outline" className="h-auto p-6 flex-col border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200" asChild>
                     <Link href="/dashboard/settings">
                       <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                         <Settings className="w-6 h-6 text-gray-600" />
                       </div>
                       <span className="font-medium">Settings</span>
                     </Link>
                   </Button>
                 )}
               </div>
             </CardContent>
           </Card>
         </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
