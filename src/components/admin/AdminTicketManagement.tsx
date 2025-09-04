'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { 
  Ticket, 
  Search, 
  UserCog,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { Ticket as TicketType, User } from '@/types';
import { adminAPI } from '@/lib/api';
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface AdminTicketManagementProps {
  onTicketUpdate: () => void;
}

type SortField = 'createdAt' | 'priority' | 'status' | 'subject';
type SortOrder = 'asc' | 'desc';

export default function AdminTicketManagement({ onTicketUpdate }: AdminTicketManagementProps) {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const [assigningTicket, setAssigningTicket] = useState<TicketType | null>(null);
  const [assignData, setAssignData] = useState({
    assigneeId: ''
  });

  const filterAndSortTickets = useCallback(() => {
    let filtered = tickets;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Apply assignee filter
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(ticket => !ticket.assignee);
      } else {
        filtered = filtered.filter(ticket => ticket.assignee?.id === assigneeFilter);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string, bValue: number | string;

      switch (sortField) {
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
  }, [tickets, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortTickets();
  }, [filterAndSortTickets]);

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
      toast.error('Failed to load tickets and users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTicket = async () => {
    if (!assigningTicket) return;

    try {
      await adminAPI.assignTicket(assigningTicket.id, assignData.assigneeId);
      toast.success('Ticket assigned successfully');
      setAssigningTicket(null);
      setAssignData({ assigneeId: '' });
      fetchData();
      onTicketUpdate();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      toast.error('Failed to assign ticket');
    }
  };

  const startAssignTicket = (ticket: TicketType) => {
    setAssigningTicket(ticket);
    setAssignData({
      assigneeId: ticket.assignee?.id || ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CLOSED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Ticket className="w-4 h-4" />;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Ticket Management</h2>
        <p className="text-muted-foreground">
          Monitor and manage all system tickets with full administrative control
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'OPEN', label: 'Open' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'RESOLVED', label: 'Resolved' },
                  { value: 'CLOSED', label: 'Closed' }
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              />
            </div>
            <div>
              <Select
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'URGENT', label: 'Urgent' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' }
                ]}
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value)}
              />
            </div>
            <div>
              <Select
                options={[
                  { value: 'all', label: 'All Assignees' },
                  { value: 'unassigned', label: 'Unassigned' },
                  ...users.map(user => ({ value: user.id, label: user.name || user.email }))
                ]}
                value={assigneeFilter}
                onChange={(value) => setAssigneeFilter(value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>
            All system tickets with filtering and sorting capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      onClick={() => handleSort('subject')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Subject</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      onClick={() => handleSort('priority')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Priority</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Owner</th>
                  <th className="text-left py-3 px-4 font-medium">Assignee</th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Created</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{ticket.subject}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {ticket.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{ticket.owner?.name || 'Unknown'}</div>
                        <div className="text-muted-foreground">{ticket.owner?.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {ticket.assignee ? (
                          <>
                            <div className="font-medium">{ticket.assignee.name}</div>
                            <div className="text-muted-foreground">{ticket.assignee.email}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/tickets/${ticket.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {ticket.status !== 'CLOSED' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startAssignTicket(ticket)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <UserCog className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 italic">Closed</span>
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Ticket Modal */}
      {assigningTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl border-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Assign Ticket</h3>
            <p className="text-gray-600 mb-4">
              Assign ticket &quot;{assigningTicket.subject}&quot; to a support agent
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Support Agent</label>
                <Select
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
                  value={assignData.assigneeId}
                  onChange={(value) => setAssignData(prev => ({ ...prev, assigneeId: value }))}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={handleAssignTicket}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Assign Ticket
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAssigningTicket(null)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
