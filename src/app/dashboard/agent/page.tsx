'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { 
  Ticket, 
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Ticket as TicketType } from '@/types';
import { agentAPI } from '@/lib/api';
import { formatDate, getStatusColor, getPriorityColor, getStatusIcon } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AgentDashboard() {
  return (
    <ProtectedRoute requiredRole="ROLE_AGENT">
      <AgentDashboardContent />
    </ProtectedRoute>
  );
}

function AgentDashboardContent() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug: Log when component loads
  console.log('🔍 Agent Dashboard: Component loaded');
  console.log('🔍 Agent Dashboard: User from useAuth:', user);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Stats
  const [stats, setStats] = useState({
    totalAssigned: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0
  });

  useEffect(() => {
    if (user) {
      console.log('🔍 Agent: User loaded, fetching assigned tickets...');
      console.log('🔍 Agent: User role check:', user.role);
      
      // Check if user is actually an agent
      const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
      if (userRole === 'ROLE_AGENT') {
        console.log('🔍 Agent: User is an agent, proceeding with fetch...');
        fetchAssignedTickets();
      } else {
        console.log('🔍 Agent: User is not an agent, role:', userRole);
        setIsLoading(false);
      }
    } else {
      console.log('🔍 Agent: User not loaded yet, waiting...');
    }
  }, [user]);

  useEffect(() => {
    filterAndSortTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  const fetchAssignedTickets = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Agent: Fetching assigned tickets...');
      console.log('🔍 Agent: Current user:', user);
      console.log('🔍 Agent: User role:', user?.role);
      console.log('🔍 Agent: Token:', localStorage.getItem('token'));
      
      // Get assigned tickets for the current agent
      const assignedTickets = await agentAPI.getAssignedTickets();
      console.log('✅ Agent: Fetched assigned tickets:', assignedTickets);
      
      setTickets(assignedTickets);
      
      // Calculate stats
      const totalAssigned = assignedTickets.length;
      const openTickets = assignedTickets.filter(t => t.status === 'OPEN').length;
      const inProgressTickets = assignedTickets.filter(t => t.status === 'IN_PROGRESS').length;
      const resolvedTickets = assignedTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      
      setStats({
        totalAssigned,
        openTickets,
        inProgressTickets,
        resolvedTickets
      });
      
      console.log('✅ Agent: Stats calculated:', { totalAssigned, openTickets, inProgressTickets, resolvedTickets });
    } catch (error) {
      console.error('❌ Agent: Failed to fetch assigned tickets:', error);
      toast.error('Failed to load assigned tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTickets = () => {
    let filtered = [...tickets];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          const statusOrder = { 'OPEN': 1, 'IN_PROGRESS': 2, 'RESOLVED': 3, 'CLOSED': 4 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case 'subject':
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTickets(filtered);
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      console.log('🔍 Agent: Updating ticket status:', { ticketId, newStatus });
      await agentAPI.updateTicketStatus(ticketId, newStatus);
      toast.success(`Ticket ${newStatus.toLowerCase()} successfully`);
      fetchAssignedTickets(); // Refresh the list
    } catch (error) {
      console.error('❌ Agent: Failed to update ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  if (isLoading) {
    console.log('🔍 Agent Dashboard: Showing loading state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assigned tickets...</p>
            <p className="text-sm text-gray-500 mt-2">User: {user ? user.name : 'Not loaded'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Agent Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || user?.email}. Manage your assigned tickets.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssigned}</div>
              <p className="text-xs text-muted-foreground">
                Tickets assigned to you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressTickets}</div>
              <p className="text-xs text-muted-foreground">
                Currently working on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
              <p className="text-xs text-muted-foreground">
                Successfully resolved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Select
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'OPEN', label: 'Open' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'RESOLVED', label: 'Resolved' },
                    { value: 'CLOSED', label: 'Closed' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                
                <Select
                  options={[
                    { value: 'all', label: 'All Priority' },
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'URGENT', label: 'Urgent' }
                  ]}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                />
                
                <Select
                  options={[
                    { value: 'createdAt', label: 'Sort by Date' },
                    { value: 'priority', label: 'Sort by Priority' },
                    { value: 'status', label: 'Sort by Status' },
                    { value: 'subject', label: 'Sort by Subject' }
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Owner: {ticket.owner?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {formatDate(ticket.createdAt)}</span>
                          </div>
                          {ticket.comments && ticket.comments.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{ticket.comments.length} comments</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/dashboard/tickets/${ticket.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        
                        {ticket.status === 'OPEN' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Start Work
                          </Button>
                        )}
                        
                        {ticket.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(ticket.id, 'RESOLVED')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                        
                        {ticket.status === 'RESOLVED' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(ticket.id, 'CLOSED')}
                            className="bg-gray-600 hover:bg-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-500">
                    {tickets.length === 0 
                      ? "You don't have any assigned tickets yet."
                      : "No tickets match your current filters."
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
