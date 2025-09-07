'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Ticket, Comment, User } from '@/types';
import { ticketsAPI, commentsAPI } from '@/lib/api';
import { formatDate, getPriorityColor, getStatusColor, getStatusIcon, getInitials } from '@/lib/utils';
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Download,
  Edit,
  Save,
  X,
  Clock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  FileText,
  Plus,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
  return (
    <ProtectedRoute>
      <TicketDetailContent />
    </ProtectedRoute>
  );
}

function TicketDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editData, setEditData] = useState({
    subject: '',
    description: '',
    priority: '' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    status: '' as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
  });

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setIsLoading(true);
        const [ticketData, commentsData] = await Promise.all([
          ticketsAPI.getById(ticketId),
          commentsAPI.getByTicketId(ticketId),
        ]);
        
        setTicket(ticketData);
        setComments(commentsData);
        
        // Initialize edit data
        setEditData({
          subject: ticketData.subject,
          description: ticketData.description,
          priority: ticketData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
          status: ticketData.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
        });
      } catch (error) {
        console.error('Failed to fetch ticket data:', error);
        toast.error('Failed to load ticket details');
      } finally {
        setIsLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId]);

  const handleSaveTicket = async () => {
    try {
      setIsLoading(true);
      const updatedTicket = await ticketsAPI.update(ticketId, editData);
      setTicket(updatedTicket);
      setIsEditing(false);
      toast.success('Ticket updated successfully');
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      const commentData = {
        content: newComment,
        ticketId: ticketId,
      };
      
      const newCommentData = await commentsAPI.create(ticketId, commentData);
      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
      setIsAddingComment(false);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if user can add comments
  const canAddComment = () => {
    if (!user || !ticket) return false;
    const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
    
    // Agents cannot add comments to closed tickets
    if (userRole === 'ROLE_AGENT' && ticket.status === 'CLOSED') {
      return false;
    }
    
    // Regular users can add comments to their own tickets (except closed ones)
    if (userRole === 'ROLE_USER' && ticket.owner?.id === user.id && ticket.status !== 'CLOSED') {
      return true;
    }
    
    // Agents can add comments to assigned tickets (except closed ones)
    if (userRole === 'ROLE_AGENT' && ticket.assignee?.id === user.id && ticket.status !== 'CLOSED') {
      return true;
    }
    
    return false;
  };

  const canEditTicket = () => {
    if (!user || !ticket) return false;
        return user.role === 'ROLE_ADMIN' || 
            user.role === 'ROLE_AGENT' || 
            ticket.owner?.id === user.id;
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

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The ticket you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href={(() => {
              const userRole = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name;
              if (userRole === 'ROLE_ADMIN') return '/dashboard/all-tickets';
              if (userRole === 'ROLE_AGENT') return '/dashboard/agent';
              return '/dashboard/tickets'; // Regular users
            })()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={(() => {
              const userRole = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name;
              if (userRole === 'ROLE_ADMIN') return '/dashboard/all-tickets';
              if (userRole === 'ROLE_AGENT') return '/dashboard/agent';
              return '/dashboard/tickets'; // Regular users
            })()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Link>
          </Button>
          <div className="h-4 w-px bg-border"></div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Ticket Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">{ticket.subject}</h1>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                </span>
                <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Created by {ticket.owner?.name || 'Unknown'} on {formatDate(ticket.createdAt)}
            </p>
          </div>
          {canEditTicket() && (
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTicket} loading={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input
                        value={editData.subject}
                        onChange={(e) => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Ticket subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Ticket description"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Priority</label>
                        <Select
                          options={[
                            { value: 'LOW', label: 'Low' },
                            { value: 'MEDIUM', label: 'Medium' },
                            { value: 'HIGH', label: 'High' },
                            { value: 'URGENT', label: 'Urgent' },
                          ]}
                          value={editData.priority}
                          onChange={(value) => setEditData(prev => ({ ...prev, priority: value as any }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <Select
                          options={[
                            { value: 'OPEN', label: 'Open' },
                            { value: 'IN_PROGRESS', label: 'In Progress' },
                            { value: 'RESOLVED', label: 'Resolved' },
                            { value: 'CLOSED', label: 'Closed' },
                          ]}
                          value={editData.status}
                          onChange={(value) => setEditData(prev => ({ ...prev, status: value as any }))}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                      <p className="text-sm">{ticket.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Priority</label>
                        <p className="text-sm">{ticket.priority}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                        <p className="text-sm">{ticket.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                {canAddComment() ? (
                  !isAddingComment ? (
                    <Button variant="outline" onClick={() => setIsAddingComment(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment..."
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleAddComment} loading={isLoading}>
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingComment(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {ticket.status === 'CLOSED' ? (
                      <p>Comments cannot be added to closed tickets.</p>
                    ) : (
                      <p>You don't have permission to add comments to this ticket.</p>
                    )}
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {comment.user?.name ? getInitials(comment.user.name) : 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{comment.user?.name || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Created: {formatDate(ticket.createdAt)}</span>
                </div>
                {ticket.updatedAt && (
                  <div className="flex items-center space-x-2">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Updated: {formatDate(ticket.updatedAt)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Owner: {ticket.owner?.name || 'Unknown'}</span>
                </div>
                {ticket.assignee && (
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Assigned to: {ticket.assignee.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Paperclip className="w-5 h-5 mr-2" />
                    Attachments ({ticket.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ticket.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{attachment.filename}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
