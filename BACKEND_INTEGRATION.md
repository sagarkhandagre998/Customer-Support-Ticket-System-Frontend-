# 🔗 Backend Integration Guide

This guide will help you connect your Next.js frontend to your Spring Boot backend.

## 📋 Prerequisites

1. **Backend Running**: Your Spring Boot backend should be running on `http://localhost:8080`
2. **CORS Configured**: Backend should allow requests from `http://localhost:3000`
3. **API Endpoints**: Backend should have the required API endpoints

## 🚀 Step-by-Step Integration

### Step 1: Backend Configuration

#### 1.1 CORS Configuration (Backend)
Add this to your Spring Boot application:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

#### 1.2 Health Check Endpoint (Backend)
Add a health check endpoint to your backend:

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", new Date().toString());
        return ResponseEntity.ok(response);
    }
}
```

### Step 2: Frontend Configuration

#### 2.1 Environment Variables
The `.env.local` file is already configured with:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

#### 2.2 API Endpoints Mapping
Your frontend expects these endpoints:

| Frontend Endpoint | Backend Endpoint | Method | Description |
|------------------|------------------|--------|-------------|
| `/auth/login` | `/api/auth/login` | POST | User login |
| `/auth/register` | `/api/auth/register` | POST | User registration |
| `/auth/me` | `/api/auth/me` | GET | Get current user |
| `/auth/logout` | `/api/auth/logout` | POST | User logout |
| `/tickets` | `/api/tickets` | GET | Get all tickets |
| `/tickets/{id}` | `/api/tickets/{id}` | GET | Get ticket by ID |
| `/tickets` | `/api/tickets` | POST | Create new ticket |
| `/tickets/{id}` | `/api/tickets/{id}` | PUT | Update ticket |
| `/tickets/{id}/status` | `/api/tickets/{id}/status` | PATCH | Update ticket status |
| `/tickets/{id}/assign` | `/api/tickets/{id}/assign` | PATCH | Assign ticket |
| `/tickets/{id}/comments` | `/api/tickets/{id}/comments` | GET | Get ticket comments |
| `/tickets/{id}/comments` | `/api/tickets/{id}/comments` | POST | Add comment |
| `/users` | `/api/users` | GET | Get all users |
| `/users/{id}` | `/api/users/{id}` | GET | Get user by ID |
| `/dashboard/stats` | `/api/dashboard/stats` | GET | Get dashboard statistics |
| `/dashboard/my-tickets` | `/api/dashboard/my-tickets` | GET | Get user's tickets |
| `/dashboard/assigned-tickets` | `/api/dashboard/assigned-tickets` | GET | Get assigned tickets |

### Step 3: Authentication Integration

#### 3.1 JWT Token Handling
The frontend expects JWT tokens in this format:

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**User Object:**
```json
{
  "id": "1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "avatar": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3.2 Authorization Header
The frontend automatically adds the JWT token to requests:
```
Authorization: Bearer <token>
```

### Step 4: Data Models

#### 4.1 Ticket Model
```json
{
  "id": "1",
  "subject": "Cannot access my account",
  "description": "I am unable to log into my account...",
  "status": "OPEN",
  "priority": "HIGH",
  "category": "TECHNICAL",
  "owner": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "assignee": {
    "id": "2",
    "name": "Sarah Smith",
    "email": "sarah@example.com",
    "role": "ROLE_SUPPORT_AGENT"
  },
  "comments": [
    {
      "id": "1",
      "content": "I have the same issue. Please help!",
      "author": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "attachments": [],
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### 4.2 Dashboard Stats Model
```json
{
  "totalTickets": 5,
  "openTickets": 2,
  "inProgressTickets": 1,
  "resolvedTickets": 1,
  "closedTickets": 1,
  "ticketsByPriority": {
    "LOW": 2,
    "MEDIUM": 1,
    "HIGH": 2,
    "URGENT": 0
  },
  "ticketsByStatus": {
    "OPEN": 2,
    "IN_PROGRESS": 1,
    "RESOLVED": 1,
    "CLOSED": 1
  },
  "ticketsByCategory": {
    "TECHNICAL": 1,
    "BILLING": 1,
    "FEATURE_REQUEST": 1,
    "BUG_REPORT": 1,
    "GENERAL": 1
  },
  "averageResolutionTime": 2.5,
  "customerSatisfaction": 4.2
}
```

### Step 5: Testing the Integration

#### 5.1 Start Both Applications
```bash
# Terminal 1: Start Backend
cd your-backend-directory
./mvnw spring-boot:run

# Terminal 2: Start Frontend
cd ticket-system
npm run dev
```

#### 5.2 Check Backend Status
1. Open `http://localhost:3000`
2. Login with any demo account
3. Check the "Backend Status" card on the dashboard
4. It should show "Backend Connected" if everything is working

#### 5.3 Test API Calls
1. Open browser developer tools (F12)
2. Go to Network tab
3. Perform actions like creating tickets, viewing tickets
4. Check that API calls are being made to your backend

### Step 6: Troubleshooting

#### 6.1 Common Issues

**CORS Errors:**
- Ensure CORS is properly configured on backend
- Check that frontend origin is allowed

**401 Unauthorized:**
- Check JWT token format
- Verify token is being sent in Authorization header
- Ensure token is valid and not expired

**404 Not Found:**
- Verify API endpoints match exactly
- Check base URL configuration
- Ensure backend routes are properly mapped

**Network Errors:**
- Verify backend is running on correct port
- Check firewall settings
- Ensure no proxy interference

#### 6.2 Debug Mode
Enable debug logging in your backend:

```properties
# application.properties
logging.level.org.springframework.web=DEBUG
logging.level.com.yourpackage=DEBUG
```

#### 6.3 Frontend Debug
Check browser console for:
- Network request errors
- CORS errors
- Authentication errors

### Step 7: Production Deployment

#### 7.1 Environment Variables
For production, update `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

#### 7.2 CORS Configuration
Update backend CORS for production:
```java
.allowedOrigins("https://your-frontend-domain.com")
```

## 🎯 Next Steps

1. **Test All Features**: Ensure all CRUD operations work
2. **Error Handling**: Test error scenarios
3. **Performance**: Monitor API response times
4. **Security**: Review authentication and authorization
5. **Deployment**: Deploy both applications

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify backend logs
3. Test API endpoints directly (using Postman/curl)
4. Ensure all environment variables are set correctly

---

**Happy Coding! 🚀**
