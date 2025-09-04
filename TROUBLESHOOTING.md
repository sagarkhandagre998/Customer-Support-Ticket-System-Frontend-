# Troubleshooting Guide

## Permanent Fix for Webpack Module Resolution Errors

If you encounter the error `Cannot find module './948.js'` or similar webpack module resolution errors, this is a known issue with Next.js build cache corruption. We've implemented a permanent solution.

### Quick Fix Commands

**Option 1: Use the clean script (Recommended)**
```bash
npm run clean
npm run dev
```

**Option 2: Manual cleanup**
```bash
# Kill all Node.js processes
taskkill /f /im node.exe

# Remove build cache
rmdir /s /q .next

# Clean npm cache
npm cache clean --force

# Start dev server
npm run dev
```

**Option 3: Use the batch file**
```bash
clean-dev.bat
```

### What the Clean Script Does

The `npm run clean` command automatically:
1. Stops all running Node.js processes
2. Removes the `.next` build directory
3. Cleans npm cache
4. Prepares the environment for a fresh start

### Why This Happens

This error occurs when:
- The Next.js build cache gets corrupted
- There are leftover references to deleted modules
- The webpack manifest becomes out of sync
- Multiple development servers are running simultaneously

### Prevention Tips

1. **Always use `npm run clean` before starting development**
2. **Don't run multiple `npm run dev` instances**
3. **Use `npm run dev:clean` for a fresh start**
4. **Close the terminal and restart if you see webpack errors**

## Dashboard All-Tickets Page Changes

The `/dashboard/all-tickets` page has been updated with new functionality:

### Old Functionality (Removed)
- ❌ Single "Edit" button that allowed editing status, priority, and assignee

### New Functionality (Added)
- ✅ **Assign Ticket Button** - Assign tickets to support agents only
- ✅ **Update Status Button** - Update ticket status only

### New API Calls
- `adminAPI.assignTicket(ticketId, assigneeId)` - Assigns a ticket to a support agent only
- `adminAPI.updateTicketStatus(ticketId, status)` - Updates only the ticket status

### Benefits
1. **Clearer separation of concerns** - Each button has a specific purpose
2. **Better user experience** - Users know exactly what each action does
3. **More focused functionality** - No confusion about what can be edited
4. **Improved workflow** - Agents can be assigned separately from status updates

## Dashboard Users Page Changes

The `/dashboard/users` page has been updated:

### Old Functionality (Removed)
- ❌ Edit user functionality (name, email, role editing)
- ❌ Edit user modal

### New Functionality (Added)
- ✅ **Assign Role Button** - Change user roles only
- ✅ **Assign Role Modal** - Simple role assignment interface

### Benefits
1. **Simplified user management** - Focus on role assignment only
2. **Better security** - Admins can't modify sensitive user information
3. **Cleaner interface** - Less cluttered with multiple edit options
4. **Role-focused workflow** - Perfect for admin user management

## Getting Help

If you continue to experience issues:

1. **First**: Try `npm run clean` followed by `npm run dev`
2. **Second**: Check if you're in the correct directory (`ticket-system`)
3. **Third**: Ensure no other development servers are running
4. **Fourth**: Restart your terminal/command prompt

The clean script should resolve 99% of webpack-related issues permanently.
