import { Ticket, DashboardStats, User } from '@/types';

// Demo users
export const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'user@demo.com',
    role: 'ROLE_USER',
    avatar: undefined,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'agent@demo.com',
    role: 'ROLE_AGENT',
    avatar: undefined,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'ROLE_ADMIN',
    avatar: undefined,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Demo tickets
export const DEMO_TICKETS: Ticket[] = [
  {
    id: '1',
    subject: 'Cannot access my account',
    description: 'I am unable to log into my account. It says invalid credentials but I am sure I am using the correct password.',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'TECHNICAL',
    ownerId: DEMO_USERS[0].id,
    owner: DEMO_USERS[0],
    assigneeId: DEMO_USERS[1].id,
    assignee: DEMO_USERS[1],
    comments: [
      {
        id: '1',
        content: 'I have the same issue. Please help!',
        ticketId: '1',
        userId: DEMO_USERS[0].id,
        user: DEMO_USERS[0],
        createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        updatedAt: new Date('2024-01-15T10:30:00Z').toISOString(),
      },
             {
         id: '2',
         content: 'I am looking into this issue. Please try resetting your password.',
         ticketId: '1',
         userId: DEMO_USERS[1].id,
         user: DEMO_USERS[1],
         createdAt: new Date('2024-01-15T11:00:00Z').toISOString(),
         updatedAt: new Date('2024-01-15T11:00:00Z').toISOString(),
       },
    ],
    attachments: [],
    createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T11:00:00Z').toISOString(),
  },
  {
    id: '2',
    subject: 'Billing inquiry',
    description: 'I noticed an unexpected charge on my last bill. Can someone explain what this charge is for?',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'BILLING',
    ownerId: DEMO_USERS[0].id,
    owner: DEMO_USERS[0],
    assigneeId: DEMO_USERS[1].id,
    assignee: DEMO_USERS[1],
    comments: [
      {
        id: '3',
        content: 'I am investigating this charge. Will get back to you soon.',
        ticketId: '2',
        userId: DEMO_USERS[1].id,
        user: DEMO_USERS[1],
        createdAt: new Date('2024-01-14T14:20:00Z').toISOString(),
        updatedAt: new Date('2024-01-14T14:20:00Z').toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date('2024-01-14T13:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-14T14:20:00Z').toISOString(),
  },
  {
    id: '3',
    subject: 'Feature request: Dark mode',
    description: 'It would be great to have a dark mode option for the application. This would help reduce eye strain during night usage.',
    status: 'OPEN',
    priority: 'LOW',
    category: 'FEATURE_REQUEST',
    ownerId: DEMO_USERS[0].id,
    owner: DEMO_USERS[0],
    assignee: undefined,
    comments: [
      {
        id: '4',
        content: 'Great idea! I will forward this to the development team.',
        ticketId: '3',
        userId: DEMO_USERS[2].id,
        user: DEMO_USERS[2],
        createdAt: new Date('2024-01-13T16:45:00Z').toISOString(),
        updatedAt: new Date('2024-01-13T16:45:00Z').toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date('2024-01-13T15:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-13T16:45:00Z').toISOString(),
  },
  {
    id: '4',
    subject: 'Bug: Search not working',
    description: 'The search functionality is not working properly. When I search for tickets, it returns no results even when I know there are matching tickets.',
    status: 'RESOLVED',
    priority: 'HIGH',
    category: 'BUG_REPORT',
    ownerId: DEMO_USERS[0].id,
    owner: DEMO_USERS[0],
    assigneeId: DEMO_USERS[1].id,
    assignee: DEMO_USERS[1],
    comments: [
      {
        id: '5',
        content: 'I have identified the issue. It was a database query problem.',
        ticketId: '4',
        userId: DEMO_USERS[1].id,
        user: DEMO_USERS[1],
        createdAt: new Date('2024-01-12T11:15:00Z').toISOString(),
        updatedAt: new Date('2024-01-12T11:15:00Z').toISOString(),
      },
      {
        id: '6',
        content: 'Fixed and deployed. Please test the search functionality now.',
        ticketId: '4',
        userId: DEMO_USERS[1].id,
        user: DEMO_USERS[1],
        createdAt: new Date('2024-01-12T15:30:00Z').toISOString(),
        updatedAt: new Date('2024-01-12T15:30:00Z').toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date('2024-01-12T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-12T15:30:00Z').toISOString(),
  },
  {
    id: '5',
    subject: 'General inquiry about services',
    description: 'I would like to know more about your premium services and pricing plans.',
    status: 'CLOSED',
    priority: 'LOW',
    category: 'GENERAL',
    ownerId: DEMO_USERS[0].id,
    owner: DEMO_USERS[0],
    assigneeId: DEMO_USERS[1].id,
    assignee: DEMO_USERS[1],
    comments: [
      {
        id: '7',
        content: 'I have sent you an email with our pricing information.',
        ticketId: '5',
        userId: DEMO_USERS[1].id,
        user: DEMO_USERS[1],
        createdAt: new Date('2024-01-10T10:00:00Z').toISOString(),
        updatedAt: new Date('2024-01-10T10:00:00Z').toISOString(),
      },
      {
        id: '8',
        content: 'Thank you for the information. I will review it and get back to you.',
        ticketId: '5',
        userId: DEMO_USERS[0].id,
        user: DEMO_USERS[0],
        createdAt: new Date('2024-01-10T14:30:00Z').toISOString(),
        updatedAt: new Date('2024-01-10T14:30:00Z').toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date('2024-01-10T08:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-10T14:30:00Z').toISOString(),
  },
];

// Demo dashboard stats
export const DEMO_DASHBOARD_STATS: DashboardStats = {
  totalTickets: 5,
  openTickets: 2,
  inProgressTickets: 1,
  resolvedTickets: 1,
  closedTickets: 1,
  ticketsByPriority: {
    LOW: 2,
    MEDIUM: 1,
    HIGH: 2,
    URGENT: 0,
  },
  averageResolutionTime: 2.5, // days
};

// Helper function to get tickets by user role
export const getTicketsByUserRole = (userRole: string, userId: string): Ticket[] => {
  switch (userRole) {
    case 'ROLE_ADMIN':
      return DEMO_TICKETS; // Admin sees all tickets
    case 'ROLE_AGENT':
      return DEMO_TICKETS.filter(ticket => 
        ticket.assignee?.id === userId || ticket.status === 'OPEN'
      );
    case 'ROLE_USER':
      return DEMO_TICKETS.filter(ticket => ticket.ownerId === userId);
    default:
      return [];
  }
};

// Helper function to get dashboard stats by user role
export const getDashboardStatsByUserRole = (userRole: string, userId: string): DashboardStats => {
  const userTickets = getTicketsByUserRole(userRole, userId);
  
  const stats: DashboardStats = {
    totalTickets: userTickets.length,
    openTickets: userTickets.filter(t => t.status === 'OPEN').length,
    inProgressTickets: userTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolvedTickets: userTickets.filter(t => t.status === 'RESOLVED').length,
    closedTickets: userTickets.filter(t => t.status === 'CLOSED').length,
    ticketsByPriority: {
      LOW: userTickets.filter(t => t.priority === 'LOW').length,
      MEDIUM: userTickets.filter(t => t.priority === 'MEDIUM').length,
      HIGH: userTickets.filter(t => t.priority === 'HIGH').length,
      URGENT: userTickets.filter(t => t.priority === 'URGENT').length,
    },
         averageResolutionTime: 2.5,
  };
  
  return stats;
};
