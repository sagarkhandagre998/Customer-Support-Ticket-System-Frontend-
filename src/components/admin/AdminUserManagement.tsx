'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  UserCheck, 
  UserX, 
  Trash2,
  UserCog
} from 'lucide-react';
import { User } from '@/types';
import { adminAPI, debugAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AdminUserManagementProps {
  onUserUpdate?: () => void;
}

export default function AdminUserManagement({ onUserUpdate }: AdminUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [assigningRole, setAssigningRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<User['role']>('ROLE_USER');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ROLE_USER' as User['role']
  });

  console.log('🚀 AdminUserManagement component loaded');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await adminAPI.getAllUsers();
      setUsers(usersData);
      console.log('🚀 Fetched users data:', usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
        return userRole === roleFilter;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    try {
      console.log('🚀 Adding new user:', newUser);
      await adminAPI.createUser(newUser);
      toast.success('User created successfully');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'ROLE_USER' });
      fetchUsers();
      onUserUpdate?.();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Additional safety check: prevent deleting admin users
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete && formatRole(userToDelete.role) === 'Admin') {
        toast.error('Cannot delete admin users');
        setDeleteConfirm(null);
        return;
      }

      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers();
      onUserUpdate?.();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleAssignRole = async () => {
    if (!assigningRole) return;

    try {
      await adminAPI.updateUserRole(assigningRole.id, newRole);
      toast.success('User role updated successfully');
      setAssigningRole(null);
      setNewRole('ROLE_USER');
      fetchUsers();
      onUserUpdate?.();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const startAssignRole = (user: User) => {
    setAssigningRole(user);
    // Extract role name correctly
    const currentRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
    setNewRole(currentRole as User['role']);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'ROLE_AGENT':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'ROLE_USER':
        return <UserX className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ROLE_AGENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ROLE_USER':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRole = (role: any) => {
    if (typeof role === 'string') {
      return role.replace('ROLE_', '');
    }
    if (role && typeof role === 'object' && 'name' in role) {
      return (role as any).name.replace('ROLE_', '');
    }
    return 'Unknown';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('🚀 Simple test button clicked - this should work');
              alert('Test button clicked! Check console for logs.');
            }}
            className="text-xs bg-green-100 text-green-700"
          >
            Test Button
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              debugAPI();
              toast.success('API debug info logged to console');
            }}
            className="text-xs"
          >
            Debug API
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('🚨 Triggering test error for Next.js error overlay');
                  throw new Error('Test error to trigger Next.js error overlay');
                }}
                className="text-xs bg-red-100 text-red-700 hover:bg-red-200"
              >
                Test Error
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('🚨 Triggering API test error');
                  // This will trigger an API error that should show in the overlay
                  adminAPI.createUser({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'test123',
                    role: 'ROLE_USER'
                  }).catch(error => {
                    console.log('API error caught, re-throwing to trigger overlay');
                    throw error;
                  });
                }}
                className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200"
              >
                Test API Error
              </Button>
            </>
          )}
          <Button onClick={() => setShowAddUser(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select
                value={roleFilter}
                onChange={(value) => setRoleFilter(value)}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'ROLE_USER', label: 'User' },
                  { value: 'ROLE_AGENT', label: 'Support Agent' },
                  { value: 'ROLE_ADMIN', label: 'Admin' }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                    {getInitials(user.name || user.email)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.name || 'No Name'}</h3>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(user.role)}`}>
                    {formatRole(user.role)}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startAssignRole(user)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <UserCog className="w-4 h-4" />
                  </Button>

                  {/* Only show delete button for non-admin users */}
                  {formatRole(user.role) !== 'Admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl border-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
                <Select
                  options={[
                    { value: 'ROLE_USER', label: 'User' },
                    { value: 'ROLE_AGENT', label: 'Support Agent' },
                    { value: 'ROLE_ADMIN', label: 'Admin' }
                  ]}
                  value={newUser.role}
                  onChange={(value) => setNewUser(prev => ({ ...prev, role: value as 'ROLE_ADMIN' | 'ROLE_AGENT' | 'ROLE_USER' }))}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={() => {
                  console.log('🚀 Add User button clicked');
                  console.log('🚀 Current newUser state:', newUser);
                  handleAddUser();
                }} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add User
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddUser(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {assigningRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl border-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Assign Role</h3>
            <p className="text-gray-600 mb-4">
              Assign a new role to {assigningRole.name || assigningRole.email}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
                <Select
                  options={[
                    { value: 'ROLE_USER', label: 'User' },
                    { value: 'ROLE_AGENT', label: 'Support Agent' },
                    { value: 'ROLE_ADMIN', label: 'Admin' }
                  ]}
                  value={newRole}
                  onChange={(value) => setNewRole(value as User['role'])}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={handleAssignRole}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Assign Role
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAssigningRole(null)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl border-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirm(null)}
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
