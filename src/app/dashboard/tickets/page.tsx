'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
import { Ticket, TicketFilters } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { formatDate, getPriorityColor, getStatusColor } from '@/lib/utils';
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
} from 'lucide-react';

function TicketsContent() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 User: Fetching my tickets...');
        console.log('🔍 User: Current user:', user);
        console.log('🔍 User: Token:', localStorage.getItem('token'));
        console.log('🔍 User: Demo User ID:', localStorage.getItem('demoUserId'));
        
        const data = await dashboardAPI.getMyTickets();
        console.log('✅ User: Fetched my tickets:', data);
        console.log('✅ User: Number of tickets:', data.length);
        setTickets(data);
        setFilteredTickets(data);
      } catch (error) {
        console.error('❌ User: Failed to fetch my tickets:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  useEffect(() => {
    let filtered = tickets;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filters]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="w-4 h-4" />;
      case 'RESOLVED':
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <TicketIcon className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back to Dashboard Button */}
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Tickets</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your support tickets
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link href="/dashboard/tickets/new">
                <Plus className="w-4 h-4 mr-2" />
                Create New Ticket
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                options={statusOptions}
                value={filters.status || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
              />
              <Select
                options={priorityOptions}
                value={filters.priority || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, priority: value as any }))}
              />
            </div>
            {(searchTerm || filters.status || filters.priority) && (
              <div className="mt-4 flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  {filteredTickets.length} of {tickets.length} tickets
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TicketIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground mb-4">
                  {tickets.length === 0 
                    ? "You haven't created any tickets yet."
                    : "No tickets match your current filters."
                  }
                </p>
                <Button asChild>
                  <Link href="/dashboard/tickets/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ticket
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Created {formatDate(ticket.createdAt)}</span>
                          {ticket.assignee && (
                            <span>Assigned to {ticket.assignee.name}</span>
                          )}
                          <span>{ticket.comments?.length || 0} comments</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/tickets/${ticket.id}`}>
                          View
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TicketsPage() {
  return (
    <ProtectedRoute>
      <TicketsContent />
    </ProtectedRoute>
  );
}