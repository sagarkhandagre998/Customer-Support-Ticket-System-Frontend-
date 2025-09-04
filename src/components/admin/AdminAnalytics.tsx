'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Calendar,
  Target
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AdminAnalyticsProps {
  stats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
    ticketsByStatus: Record<string, number>;
    ticketsByPriority: Record<string, number>;
    recentActivity?: Array<{ description: string; timestamp: string }>;
  };
}

export default function AdminAnalytics({ stats }: AdminAnalyticsProps) {
  // Calculate additional metrics
  const totalTickets = stats.totalTickets || 0;
  const openTickets = stats.openTickets || 0;
  const resolvedTickets = stats.resolvedTickets || 0;
  const pendingTickets = stats.pendingTickets || 0;
  
  const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
  const avgResponseTime = 2.5; // This would come from backend
  const customerSatisfaction = 4.2; // This would come from backend

  // Mock data for charts (in real app, this would come from backend)
  const weeklyData = [
    { week: 'Week 1', tickets: 45, resolved: 38 },
    { week: 'Week 2', tickets: 52, resolved: 45 },
    { week: 'Week 3', tickets: 38, resolved: 35 },
    { week: 'Week 4', tickets: 61, resolved: 52 },
  ];

  const categoryData = [
    { category: 'Technical Issues', count: 25, percentage: 35 },
    { category: 'Account Access', count: 18, percentage: 25 },
    { category: 'Billing', count: 15, percentage: 20 },
    { category: 'Feature Requests', count: 12, percentage: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <p className="text-muted-foreground">
          Comprehensive system analytics and performance metrics
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resolutionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tickets successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {avgResponseTime}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to first response
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {customerSatisfaction}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Average rating from users
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {openTickets + pendingTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Weekly Ticket Trends</span>
            </CardTitle>
            <CardDescription>
              New tickets vs resolved tickets over the last 4 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((week, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{week.week}</span>
                    <span className="text-muted-foreground">
                      {week.tickets} new, {week.resolved} resolved
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-2"
                        style={{ width: `${(week.tickets / 70) * 100}%` }}
                      />
                      <div 
                        className="bg-green-500 h-2"
                        style={{ width: `${(week.resolved / 70) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Ticket Categories</span>
            </CardTitle>
            <CardDescription>
              Distribution of tickets by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">
                      {category.count} tickets ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Status Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ticketsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ 
                          width: `${(count as number / totalTickets) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Priority Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ticketsByPriority || {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {priority}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ 
                          width: `${(count as number / totalTickets) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity: { description: string; timestamp: string }, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered insights to improve system performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">Positive Trends</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Resolution rate improved by 15% this month</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Average response time decreased to 2.5 hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Customer satisfaction score increased to 4.2/5</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-600">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>High priority tickets taking longer to resolve</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Consider adding more support agents during peak hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Implement automated responses for common issues</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
