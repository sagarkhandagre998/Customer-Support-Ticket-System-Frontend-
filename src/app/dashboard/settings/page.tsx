'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save, 
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function SettingsContent() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: 'UTC',
    language: 'en',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    ticketUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true,
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false,
    fontSize: 'medium',
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  const handleSaveSettings = async (section: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${section} settings saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          value={profileSettings.name}
          onChange={(e) => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter your full name"
        />
        <Input
          label="Email Address"
          type="email"
          value={profileSettings.email}
          onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Timezone"
          options={[
            { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
            { value: 'EST', label: 'Eastern Time (EST)' },
            { value: 'PST', label: 'Pacific Time (PST)' },
            { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
            { value: 'CET', label: 'Central European Time (CET)' },
          ]}
          value={profileSettings.timezone}
          onChange={(value) => setProfileSettings(prev => ({ ...prev, timezone: value }))}
        />
        <Select
          label="Language"
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'zh', label: 'Chinese' },
          ]}
          value={profileSettings.language}
          onChange={(value) => setProfileSettings(prev => ({ ...prev, language: value }))}
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => handleSaveSettings('Profile')}
          loading={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Profile Settings
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Email Notifications</h3>
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-600">
                {key === 'emailNotifications' && 'Receive notifications via email'}
                {key === 'pushNotifications' && 'Receive push notifications in browser'}
                {key === 'ticketUpdates' && 'Get notified when tickets are updated'}
                {key === 'systemAlerts' && 'Receive important system alerts'}
                {key === 'weeklyReports' && 'Get weekly summary reports'}
                {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
              </p>
            </div>
            <button
              onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !value }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => handleSaveSettings('Notification')}
          loading={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Notification Settings
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Session Timeout</h4>
          <p className="text-sm text-gray-600 mb-3">
            Automatically log out after a period of inactivity
          </p>
          <Select
            options={[
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '1 hour' },
              { value: '120', label: '2 hours' },
              { value: '0', label: 'Never' },
            ]}
            value={securitySettings.sessionTimeout}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Login Alerts</h4>
            <p className="text-sm text-gray-600">
              Get notified when someone logs into your account
            </p>
          </div>
          <button
            onClick={() => setSecuritySettings(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              securitySettings.loginAlerts ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => handleSaveSettings('Security')}
          loading={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </Button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Theme</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', preview: 'bg-white border-2 border-gray-300' },
              { value: 'dark', label: 'Dark', preview: 'bg-gray-800 border-2 border-gray-600' },
              { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-800 border-2 border-gray-400' },
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: theme.value }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  appearanceSettings.theme === theme.value
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-full h-8 rounded ${theme.preview} mb-2`} />
                <span className="text-sm font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Font Size</h3>
          <Select
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
            value={appearanceSettings.fontSize}
            onChange={(value) => setAppearanceSettings(prev => ({ ...prev, fontSize: value }))}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Layout Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Collapse Sidebar</h4>
              <p className="text-sm text-gray-600">Make the sidebar smaller to save space</p>
            </div>
            <button
              onClick={() => setAppearanceSettings(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                appearanceSettings.sidebarCollapsed ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  appearanceSettings.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Compact Mode</h4>
              <p className="text-sm text-gray-600">Reduce spacing for a more compact view</p>
            </div>
            <button
              onClick={() => setAppearanceSettings(prev => ({ ...prev, compactMode: !prev.compactMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                appearanceSettings.compactMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  appearanceSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => handleSaveSettings('Appearance')}
          loading={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Appearance Settings
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account preferences and system settings
              </p>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              {tabs.find(tab => tab.id === activeTab)?.name} Settings
            </CardTitle>
            <CardDescription>
              {activeTab === 'profile' && 'Manage your personal information and preferences'}
              {activeTab === 'notifications' && 'Configure how you receive notifications'}
              {activeTab === 'security' && 'Manage your account security settings'}
              {activeTab === 'appearance' && 'Customize the look and feel of your dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
