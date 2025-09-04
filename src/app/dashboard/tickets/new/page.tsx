'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ticketsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Paperclip, X, Upload, File } from 'lucide-react';
import toast from 'react-hot-toast';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

function NewTicketContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const priority = watch('priority');

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    { value: 'TECHNICAL', label: 'Technical Issue' },
    { value: 'BILLING', label: 'Billing' },
    { value: 'FEATURE_REQUEST', label: 'Feature Request' },
    { value: 'BUG_REPORT', label: 'Bug Report' },
    { value: 'GENERAL', label: 'General Inquiry' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFileSize = 10 * 1024 * 1024; // 10MB limit
    const totalMaxSize = 50 * 1024 * 1024; // 50MB total limit
    
    // Check individual file sizes
    const validFiles = files.filter(file => file.size <= maxFileSize);
    
    if (validFiles.length !== files.length) {
      toast.error('Some files were too large. Maximum file size is 10MB per file.');
    }
    
    // Check total size
    const currentTotalSize = attachments.reduce((acc, file) => acc + file.size, 0);
    const newTotalSize = currentTotalSize + validFiles.reduce((acc, file) => acc + file.size, 0);
    
    if (newTotalSize > totalMaxSize) {
      toast.error('Total file size exceeds 50MB limit. Please reduce the number or size of files.');
      return;
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TicketFormData) => {
    try {
      setIsLoading(true);
      console.log('Creating ticket with data:', data);
      console.log('Attachments:', attachments);
      
      const ticketData = {
        ...data,
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      
      console.log('Sending ticket data:', ticketData);
      console.log('FormData size:', attachments.reduce((acc, file) => acc + file.size, 0), 'bytes');
      
      const result = await ticketsAPI.create(ticketData);
      console.log('Ticket created successfully:', result);
      
      toast.success('Ticket created successfully!');
      router.push('/dashboard/tickets');
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. The file may be too large or the server is slow. Please try again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You may not have permission to create tickets or your session has expired. Please try logging in again.');
        console.error('403 Forbidden - Check authentication and permissions');
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please reduce file size and try again.');
      } else if (error.response?.status === 415) {
        toast.error('Unsupported file type. Please use common file formats.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create ticket. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Create New Ticket</h1>
            <p className="text-muted-foreground mt-1">
              Submit a new support ticket
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>
                Provide detailed information about your issue or request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Subject */}
                <Input
                  {...register('subject')}
                  label="Subject"
                  placeholder="Brief description of the issue"
                  error={errors.subject?.message}
                />

                {/* Description */}
                <Textarea
                  {...register('description')}
                  label="Description"
                  placeholder="Please provide detailed information about your issue..."
                  error={errors.description?.message}
                  rows={6}
                />

                {/* Priority and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Priority"
                    options={priorityOptions}
                    value={priority}
                    onChange={(value) => setValue('priority', value as any)}
                    error={errors.priority?.message}
                  />
                  <Select
                    label="Category"
                    options={categoryOptions}
                    onChange={(value) => setValue('category', value)}
                    error={errors.category?.message}
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop files here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Maximum file size: 10MB per file, 50MB total
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Choose Files
                    </label>
                  </div>
                  
                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Selected Files:</p>
                        <p className="text-xs text-muted-foreground">
                          Total: {(attachments.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-accent rounded-md"
                        >
                          <div className="flex items-center space-x-2">
                            <File className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                  >
                    Create Ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function NewTicketPage() {
  return (
    <ProtectedRoute>
      <NewTicketContent />
    </ProtectedRoute>
  );
}
