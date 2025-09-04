'use client';

import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getInitials, getRoleColor, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  Edit,
  Save,
  X,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';

function ProfileContent() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      // Here you would typically save the profile changes to the backend
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions = {
      ROLE_USER: 'Regular user who can create and manage their own tickets',
  ROLE_AGENT: 'Support agent who can handle and resolve tickets',
    ROLE_ADMIN: 'Administrator with full system access and management capabilities',
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
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
        <div className="flex items-center justify-between animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account information and preferences
            </p>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  loading={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Profile Card */}
            <div
              className="lg:col-span-1 animate-fadeIn"
              style={{ animationDelay: '0.1s' }}
            >
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
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
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    {formatRole(user.role)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {roleDescriptions[user.role as keyof typeof roleDescriptions]}
                </p>
              </CardContent>
            </Card>
          </div>

                      {/* Profile Details */}
            <div
              className="lg:col-span-2 space-y-6 animate-fadeIn"
              style={{ animationDelay: '0.2s' }}
            >
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your basic account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Full Name
                    </label>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Role
                    </label>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatRole(user.role)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <LogOut className="w-5 h-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-800">Sign Out</h4>
                    <p className="text-sm text-red-600">
                      Sign out of your account
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                    loading={isLoading}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
