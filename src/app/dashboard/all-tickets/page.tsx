'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { 
  Ticket, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ArrowLeft,
  User,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Ticket as TicketType, User as UserType } from '@/types';
import { adminAPI } from '@/lib/api';
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AllTicketsPage() {
  return (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <AllTicketsPageContent />
    </ProtectedRoute>
  );
}

function AllTicketsPageContent() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [assigningTicket, setAssigningTicket] = useState<TicketType | null>(null);
  const [assignData, setAssignData] = useState({
    assigneeId: ''
  });
  const [updatingStatus, setUpdatingStatus] = useState<TicketType | null>(null);
  const [statusData, setStatusData] = useState({
    status: 'OPEN' as TicketType['status']
  });

  // Sorting state
  const [sortField, setSortField] = useState<'createdAt' | 'priority' | 'status' | 'subject'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter, assigneeFilter, userFilter, sortField, sortOrder]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ticketsData, usersData] = await Promise.all([
        adminAPI.getAllTickets(),
        adminAPI.getAllUsers()
      ]);
      setTickets(ticketsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load tickets data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTickets = () => {
    let filtered = [...tickets];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        (ticket.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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

    // Filter by assignee (agents only)
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(ticket => {
        if (assigneeFilter === 'unassigned') {
          return !ticket.assignee;
        }
        return ticket.assignee?.id === assigneeFilter;
      });
    }

    // Filter by user (ticket owner)
    if (userFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.ownerId === userFilter);
    }

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { HIGH: 4, MEDIUM: 3, LOW: 2, URGENT: 5 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'status':
          const statusOrder = { OPEN: 1, IN_PROGRESS: 2, RESOLVED: 3, CLOSED: 4 };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        case 'subject':
          aValue = (a.subject || '').toLowerCase();
          bValue = (b.subject || '').toLowerCase();
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

  const handleAssignTicket = async () => {
    if (!assigningTicket) return;

    try {
      await adminAPI.assignTicket(assigningTicket.id, assignData.assigneeId);
      const isReassign = assigningTicket.assignee;
      toast.success(`Ticket ${isReassign ? 'reassigned' : 'assigned'} successfully`);
      setAssigningTicket(null);
      setAssignData({ assigneeId: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      const isReassign = assigningTicket.assignee;
      toast.error(`Failed to ${isReassign ? 'reassign' : 'assign'} ticket`);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updatingStatus) return;

    try {
      await adminAPI.updateTicketStatus(updatingStatus.id, statusData.status);
      toast.success('Ticket status updated successfully');
      setUpdatingStatus(null);
      setStatusData({ status: 'OPEN' });
      fetchData();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Ticket className="w-4 h-4" />;
    }
  };

  const getAssigneeName = (ticket: TicketType) => {
    // First try to use the assignee object if available
    if (ticket.assignee && ticket.assignee.name) {
      return ticket.assignee.name;
    }
    
    // Fallback to assigneeId lookup
    if (ticket.assigneeId) {
      const user = users.find(u => u.id === ticket.assigneeId);
      return user ? user.name : 'Unknown User';
    }
    
    return 'Unassigned';
  };

  const getOwnerName = (ticket: TicketType) => {
    // First try to use the owner object if available
    if (ticket.owner && ticket.owner.name) {
      return ticket.owner.name;
    }
    
    // Fallback to ownerId lookup
    if (ticket.ownerId) {
      const user = users.find(u => u.id === ticket.ownerId);
      return user ? user.name : 'Unknown User';
    }
    
    return 'Unknown';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
              <h1 className="text-3xl font-bold text-gray-900">All Tickets</h1>
              <p className="text-gray-600">Manage and monitor all tickets in the system</p>
            </div>
          </div>
          <Button 
            onClick={fetchData}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-100 shadow-sm">
                  <Ticket className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'OPEN').length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-orange-100 shadow-sm">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-yellow-100 shadow-sm">
                  <Clock className="w-7 h-7 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Closed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'CLOSED').length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-green-100 shadow-sm">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets by subject or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'OPEN', label: 'Open' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'CLOSED', label: 'Closed' }
                  ]}
                />
              </div>
              <div>
                <Select
                  value={priorityFilter}
                  onChange={(value) => setPriorityFilter(value)}
                  options={[
                    { value: 'all', label: 'All Priority' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'LOW', label: 'Low' }
                  ]}
                />
              </div>
              <div>
                <Select
                  value={assigneeFilter}
                  onChange={(value) => setAssigneeFilter(value)}
                  options={[
                    { value: 'all', label: 'All Agents' },
                    { value: 'unassigned', label: 'Unassigned' },
                    ...users.filter(user => {
                      // Handle both string and object role formats
                      const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
                      return userRole === 'ROLE_AGENT';
                    }).map(user => ({
                      value: user.id,
                      label: user.name || 'Unknown Agent'
                    }))
                  ]}
                />
              </div>
              <div>
                <Select
                  value={userFilter}
                  onChange={(value) => setUserFilter(value)}
                  options={[
                    { value: 'all', label: 'All Users' },
                    ...users.filter(user => {
                      // Handle both string and object role formats
                      const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
                      return userRole === 'ROLE_USER';
                    }).map(user => ({
                      value: user.id,
                      label: user.name || 'Unknown User'
                    }))
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Ticket className="w-5 h-5 mr-2" />
                  Tickets ({filteredTickets.length})
                </CardTitle>
                <CardDescription>
                  Manage and monitor all system tickets
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortField('createdAt');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortField('priority');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Priority</span>
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || userFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No tickets have been created yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {ticket.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Owner: {getOwnerName(ticket)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Assignee: {getAssigneeName(ticket)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {formatDate(ticket.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          <Link href={`/dashboard/tickets/${ticket.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {ticket.status !== 'CLOSED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAssigningTicket(ticket);
                              setAssignData({
                                assigneeId: ticket.assignee?.id || ''
                              });
                            }}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <User className="w-4 h-4" />
                            <span className="ml-1">{ticket.assignee ? 'Reassign' : 'Assign'}</span>
                          </Button>
                        )}
                        {ticket.status !== 'CLOSED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUpdatingStatus(ticket);
                              setStatusData({
                                status: 'CLOSED'
                              });
                            }}
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="ml-1">Close</span>
                          </Button>
                        )}
                        {ticket.status === 'CLOSED' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 italic">Ticket Closed</span>
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assign/Reassign Ticket Modal */}
        {assigningTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle>{assigningTicket.assignee ? 'Reassign Ticket' : 'Assign Ticket'}</CardTitle>
                <CardDescription>
                  {assigningTicket.assignee ? 'Reassign' : 'Assign'} ticket &quot;{assigningTicket.subject}&quot; to a support agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Agent
                  </label>
                  <Select
                    value={assignData.assigneeId}
                    onChange={(value) => setAssignData({ ...assignData, assigneeId: value })}
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...users.filter(user => {
                        // Handle both string and object role formats
                        const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
                        return userRole === 'ROLE_AGENT';
                      }).map(user => ({
                        value: user.id,
                        label: `${user.name} (Support Agent)`
                      }))
                    ]}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleAssignTicket}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {assigningTicket.assignee ? 'Reassign Ticket' : 'Assign Ticket'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAssigningTicket(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Update Status Modal */}
        {updatingStatus && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Close Ticket</CardTitle>
                <CardDescription>Close ticket &quot;{updatingStatus.subject}&quot;</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={statusData.status}
                    onChange={(value) => setStatusData({ ...statusData, status: value as TicketType['status'] })}
                    options={[
                      { value: 'CLOSED', label: 'Close Ticket' }
                    ]}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateStatus}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Close Ticket
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUpdatingStatus(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
