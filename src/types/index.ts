export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ROLE_USER' | 'ROLE_AGENT' | 'ROLE_ADMIN';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  ownerId: string;
  assigneeId?: string;
  owner: User;
  assignee?: User;
  comments: Comment[];
  attachments: Attachment[];
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  ticketId: string;
  uploadedBy: string;
  createdAt: string;
}

export interface TicketFormData {
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  attachments?: File[];
}

export interface CommentFormData {
  content: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'ROLE_USER' | 'ROLE_AGENT' | 'ROLE_ADMIN';
  email: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
}

export interface TicketFilters {
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  assigneeId?: string;
  search?: string;
  category?: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  ticketsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  totalUsers?: number;
  supportAgents?: number;
  recentActivity?: Array<{
    description: string;
    timestamp: string;
  }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId: string;
  ticketId?: string;
  createdAt: string;
}
