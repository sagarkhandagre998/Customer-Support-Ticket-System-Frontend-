'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Check } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-scaleIn">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join us and start managing your tickets
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="animate-slideInLeft">
                <Input
                  {...register('name')}
                  type="text"
                  placeholder="Enter your full name"
                  label="Full Name"
                  error={errors.name?.message}
                  className="w-full"
                />
              </div>

              <div className="animate-slideInLeft">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  label="Email Address"
                  error={errors.email?.message}
                  className="w-full"
                />
              </div>

              <div className="animate-slideInLeft">
                <div className="relative">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    label="Password"
                    error={errors.password?.message}
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="animate-slideInLeft">
                <div className="relative">
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    label="Confirm Password"
                    error={errors.confirmPassword?.message}
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="animate-slideInUp">
                  <p className="text-sm text-muted-foreground">Password strength:</p>
                  <div className="space-y-1">
                    {[
                      { condition: password.length >= 8, text: 'At least 8 characters' },
                      { condition: /[A-Z]/.test(password), text: 'One uppercase letter' },
                      { condition: /[a-z]/.test(password), text: 'One lowercase letter' },
                      { condition: /\d/.test(password), text: 'One number' },
                    ].map((rule, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check
                          className={`w-4 h-4 ${
                            rule.condition ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            rule.condition ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {rule.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="animate-slideInUp">
                <Button type="submit" className="w-full" loading={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center animate-fadeIn">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fadeIn">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Accounts</h3>
              <div className="space-y-2 text-xs text-blue-800">
                <div className="flex justify-between">
                  <span>User:</span>
                  <span>user@demo.com / user123</span>
                </div>
                <div className="flex justify-between">
                  <span>Support Agent:</span>
                  <span>agent@demo.com / agent123</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin:</span>
                  <span>admin@demo.com / admin123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
