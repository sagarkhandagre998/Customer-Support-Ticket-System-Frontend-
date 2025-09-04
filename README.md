# 🎫 Ticket Management System

A modern, full-stack ticket management system built with Next.js, TypeScript, and Tailwind CSS. This application provides a comprehensive solution for managing support tickets with role-based access control, real-time updates, and an intuitive admin dashboard.

Frontend - https://github.com/sagarkhandagre998/Customer-Support-Ticket-System-Frontend-
backend - https://github.com/sagarkhandagre998/Customer-Support-Ticket-System-Backend

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure JWT-based authentication**
- **Role-based access control (RBAC)**
- **Protected routes and components**
- **User session management**

### 👥 User Roles
- **Regular Users**: Create and manage their own tickets
- **Support Agents**: Handle assigned tickets and customer support
- **Administrators**: Full system access and user management

### 🎫 Ticket Management
- **Create, view, and update tickets**
- **Advanced filtering and search**
- **Priority and status management**
- **File attachments support**
- **Real-time status updates**

### 🛠️ Admin Dashboard
- **User management** (add, edit, assign roles)
- **Ticket oversight** (view all tickets, assign agents)
- **System analytics** and reporting
- **Role assignment** and permissions

### 🎨 Modern UI/UX
- **Responsive design** for all devices
- **Dark/Light theme support**
- **Smooth animations** with Framer Motion
- **Professional dashboard** layout
- **Intuitive navigation**

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Backend API** (Spring Boot with PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticket-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/
   NEXT_PUBLIC_APP_NAME=Ticket Management System
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
ticket-system/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── admin/          # Admin panel
│   │   │   ├── all-tickets/    # All tickets view
│   │   │   ├── users/          # User management
│   │   │   └── tickets/        # Ticket management
│   │   ├── login/              # Authentication
│   │   └── register/           # User registration
│   ├── components/             # Reusable components
│   │   ├── admin/              # Admin-specific components
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # UI components
│   ├── contexts/               # React contexts
│   ├── lib/                    # Utilities and API
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
└── tailwind.config.js          # Tailwind CSS configuration
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database & Backend
npm run db:setup     # Setup database (if applicable)
npm run api:start    # Start backend API (if included)
```

## 🎯 Demo Credentials

### Regular User
- **Email**: `user@demo.com`
- **Password**: `user123`
- **Role**: `USER`
- **Access**: Create and view own tickets

### Support Agent
- **Email**: `agent@demo.com`
- **Password**: `agent123`
- **Role**: `ROLE_AGENT`
- **Access**: Handle assigned tickets

### Administrator
- **Email**: `admin@demo.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Access**: Full system management

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend Integration
- **Spring Boot** - Java backend framework
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **RESTful API** - API design

## 📱 Features Overview

### Dashboard
- **Role-based navigation**
- **Quick actions** for common tasks
- **Recent activity** overview
- **Statistics** and metrics

### Ticket Management
- **Create tickets** with detailed information
- **Filter and search** functionality
- **Status tracking** (Open, In Progress, Resolved, Closed)
- **Priority levels** (Low, Medium, High, Urgent)
- **Agent assignment**

### Admin Panel
- **User management** (CRUD operations)
- **Role assignment** and permissions
- **Ticket oversight** and assignment
- **System analytics** and reporting

## 🔒 Security Features

- **JWT token authentication**
- **Protected API routes**
- **Role-based access control**
- **Input validation** and sanitization
- **CORS configuration**
- **Secure session management**

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=Your App Name
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review the [Backend Integration Guide](BACKEND_INTEGRATION.md)
3. Create an issue in the repository
4. Contact the development team

## 🎉 Acknowledgments

- Built with ❤️ using Next.js and TypeScript
- UI components inspired by modern design systems
- Backend integration with Spring Boot and PostgreSQL

---

**Happy Ticket Managing! 🎫✨**
