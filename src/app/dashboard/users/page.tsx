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
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  ArrowLeft,
  UserCog
} from 'lucide-react';
import { User } from '@/types';
import { adminAPI } from '@/lib/api';
import { formatDate, getRoleColor, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <UsersPageContent />
    </ProtectedRoute>
  );
}

function UsersPageContent() {
  console.log('🚀 UsersPageContent is loading');
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [assigningRole, setAssigningRole] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ROLE_USER' as User['role']
  });

  // Assign role form state
  const [newRole, setNewRole] = useState<User['role']>('ROLE_USER');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showAddUser) {
      console.log('🚀 Add User modal is being shown in /dashboard/users');
    }
  }, [showAddUser]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await adminAPI.getAllUsers();
      console.log('🔵 Fetched users data:', usersData);
      console.log('🔵 Users with roles:', usersData.map(u => ({ name: u.name, role: u.role, roleType: typeof u.role })));
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    console.log('🔵 filterUsers called with roleFilter:', roleFilter);
    console.log('🔵 Total users:', users.length);
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      console.log('🔵 Filtering by role:', roleFilter);
      filtered = filtered.filter(user => {
        console.log('🔵 Checking user:', user.name, 'role:', user.role, 'type:', typeof user.role);
        if (typeof user.role === 'string') {
          const matches = user.role === roleFilter;
          console.log('🔵 String role match:', matches);
          return matches;
        }
        if (user.role && typeof user.role === 'object' && 'name' in user.role) {
          const matches = (user.role as any).name === roleFilter;
          console.log('🔵 Object role match:', matches);
          return matches;
        }
        console.log('🔵 No role match found');
        return false;
      });
    }

    console.log('🔵 Filtered users count:', filtered.length);
    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    console.log('🚀 handleAddUser function called in /dashboard/users');
    console.log('🚀 New user data:', newUser);
    
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        console.log('❌ Validation failed - missing required fields');
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('✅ Validation passed, calling adminAPI.createUser');
      console.log('🚀 About to call API with data:', newUser);
      
      await adminAPI.createUser(newUser);
      
      console.log('✅ API call successful');
      toast.success('User created successfully');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'ROLE_USER' });
      fetchUsers();
    } catch (error: any) {
      console.error('❌ Failed to create user:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Full error object:', error);
      
      // Show detailed error message
      const errorMessage = error.message || 'Failed to create user';
      toast.error(`Create User Error: ${errorMessage}`);
      
      // Re-throw to trigger Next.js error overlay for debugging
      console.error('🚨 Re-throwing error to trigger Next.js error overlay');
      throw error;
    }
  };

  const startAssignRole = (user: User) => {
    setAssigningRole(user);
    // Extract role name from object or use string directly
    const roleName = typeof user.role === 'string' ? user.role : (user.role as any)?.name || 'ROLE_USER';
    setNewRole(roleName as User['role']);
  };

  const handleAssignRole = async () => {
    if (!assigningRole) return;

    try {
      console.log('🔵 Assigning role:', { userId: assigningRole.id, newRole });
      await adminAPI.updateUserRole(assigningRole.id, newRole);
      toast.success('User role updated successfully');
      setAssigningRole(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'ROLE_USER', label: 'User' },
    { value: 'ROLE_AGENT', label: 'Support Agent' },
    { value: 'ROLE_ADMIN', label: 'Admin' }
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage all users in the system</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              console.log('🚀 Add User modal button clicked in /dashboard/users');
              console.log('🚀 Setting showAddUser to true');
              setShowAddUser(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-100 shadow-sm">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Regular Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => {
                      if (typeof u.role === 'string') {
                        return u.role === 'ROLE_USER';
                      }
                      if (u.role && typeof u.role === 'object' && 'name' in u.role) {
                        return (u.role as any).name === 'ROLE_USER';
                      }
                      return false;
                    }).length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-green-100 shadow-sm">
                  <UserCheck className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Support Agents</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(() => {
                      const supportAgents = users.filter(u => {
                        if (typeof u.role === 'string') {
                          return u.role === 'ROLE_AGENT';
                        }
                        if (u.role && typeof u.role === 'object' && 'name' in u.role) {
                          return (u.role as any).name === 'ROLE_AGENT';
                        }
                        return false;
                      });
                      console.log('🔵 Support agents found:', supportAgents.length, supportAgents.map(u => ({ name: u.name, role: u.role })));
                      return supportAgents.length;
                    })()}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-100 shadow-sm">
                  <Shield className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Administrators</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => {
                      if (typeof u.role === 'string') {
                        return u.role === 'ROLE_ADMIN';
                      }
                      if (u.role && typeof u.role === 'object' && 'name' in u.role) {
                        return (u.role as any).name === 'ROLE_ADMIN';
                      }
                      return false;
                    }).length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-orange-100 shadow-sm">
                  <UserX className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
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
              <div className="sm:w-48">
                              <Select
                value={roleFilter}
                onChange={(value) => {
                  console.log('🔵 Role filter changed to:', value);
                  setRoleFilter(value);
                }}
                options={roleOptions}
              />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first user.'
                  }
                </p>
                {!searchTerm && roleFilter === 'all' && (
                  <Button onClick={() => setShowAddUser(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First User
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
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
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getRoleColor(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startAssignRole(user)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(user.id)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Create a new user account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Select
                    value={newUser.role}
                    onChange={(value) => setNewUser({ ...newUser, role: value as User['role'] })}
                    options={[
                      { value: 'ROLE_USER', label: 'User' },
                      { value: 'ROLE_AGENT', label: 'Support Agent' },
                      { value: 'ROLE_ADMIN', label: 'Admin' }
                    ]}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => {
                      console.log('🚀 Create User button clicked in modal');
                      console.log('🚀 Current newUser state:', newUser);
                      handleAddUser();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddUser(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assign Role Modal */}
        {assigningRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Assign Role</CardTitle>
                <CardDescription>
                  Update role for {assigningRole.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {assigningRole.avatar ? (
                        <img
                          src={assigningRole.avatar}
                          alt={assigningRole.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(assigningRole.name)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{assigningRole.name}</h3>
                      <p className="text-sm text-gray-600">{assigningRole.email}</p>
                      <p className="text-xs text-gray-500">
                        Current role: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(assigningRole.role)}`}>
                          {formatRole(assigningRole.role)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Role
                  </label>
                  <Select
                    value={newRole}
                    onChange={(value) => setNewRole(value as User['role'])}
                    options={[
                      { value: 'ROLE_USER', label: 'User' },
                      { value: 'ROLE_AGENT', label: 'Support Agent' },
                      { value: 'ROLE_ADMIN', label: 'Admin' }
                    ]}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleAssignRole}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Role
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAssigningRole(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-red-600">Delete User</CardTitle>
                <CardDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleDeleteUser(deleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
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
