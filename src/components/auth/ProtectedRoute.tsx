'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ROLE_USER' | 'ROLE_AGENT' | 'ROLE_ADMIN';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requiredRole) {
        const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
        const roleHierarchy = {
          'ROLE_USER': 1,
          'ROLE_AGENT': 2,
          'ROLE_ADMIN': 3,
        };

        if (roleHierarchy[userRole as keyof typeof roleHierarchy] < roleHierarchy[requiredRole]) {
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (requiredRole) {
    const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?.name;
    const roleHierarchy = {
      'ROLE_USER': 1,
      'ROLE_AGENT': 2,
      'ROLE_ADMIN': 3,
    };

    if (roleHierarchy[userRole as keyof typeof roleHierarchy] < roleHierarchy[requiredRole]) {
      return null; // Will redirect to dashboard
    }
  }

  return <>{children}</>;
}
