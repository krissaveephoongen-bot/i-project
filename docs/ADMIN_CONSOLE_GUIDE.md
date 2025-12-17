# Admin Console Guide

## Overview

The Admin Console is a powerful system monitoring and management dashboard exclusively for administrators. Access it at `/admin-console` or through the sidebar menu (visible only to admins).

## Features

### 1. Overview Tab

Real-time system metrics:

- **Total Users** - Active and inactive user count
- **Total Projects** - Active and inactive project count
- **Total Tasks** - Tasks completed and completion percentage
- **Database Size** - Current database size and last backup time
- **System Uptime** - How long the system has been running
- **Task Completion Rate** - Overall project completion percentage

### 2. Health Tab

System health status monitoring:

- **Database Status**
  - Healthy (green) - Normal operation
  - Warning (yellow) - Minor issues
  - Critical (red) - Requires attention

- **API Status** - REST API endpoint health
- **Storage Status** - Disk space and storage health
- **Cache Status** - Application cache performance

#### Maintenance Actions

- **Run Database Maintenance**
  - Optimizes database performance
  - Cleans up old records
  - Rebuilds indexes
  - Runs regular checks

- **Clear Application Cache**
  - Removes cached data
  - Clears temporary files
  - Resets cache timers
  - Forces fresh data loading

### 3. Logs Tab

System activity logs showing:

- **Log Level**
  - Info (blue) - General information
  - Warning (yellow) - Potential issues
  - Error (red) - Errors that occurred

- **Timestamp** - When the event occurred
- **Action** - What was done
- **User** - Who performed the action
- **Message** - Detailed log message

Logs are displayed with the most recent first. Scroll to see more historical logs.

### 4. Settings Tab

System configuration options:

- **Debug Mode** - Enable verbose logging
- **Audit Logging** - Track all user actions
- **Auto Backup** - Enable automatic backups
- **Rate Limiting** - Prevent API abuse
- **Session Duration** - Max session timeout
- **Upload Size** - Maximum file upload size

## How to Access

### From Sidebar
1. Ensure you're logged in as an admin
2. Look for "Admin Console" in the sidebar (with shield icon)
3. Click to navigate to the admin console

### Via URL
Direct navigation: `/admin-console`

## Key Responsibilities

As an admin, monitor:

1. **System Health** - Check status regularly
2. **User Activity** - Review logs for suspicious activity
3. **Database Performance** - Run maintenance when needed
4. **Resource Usage** - Monitor storage and memory
5. **System Configuration** - Keep settings optimal

## Common Tasks

### Monitor System Health

```
1. Go to Admin Console → Health tab
2. Check all service statuses
3. If any shows "warning" or "critical", investigate
4. Run maintenance if needed
```

### Clear Cache When Needed

```
1. Go to Admin Console → Health tab
2. Click "Clear Application Cache"
3. Wait for confirmation message
4. Users may need to refresh their browsers
```

### Run Database Maintenance

```
1. Go to Admin Console → Health tab
2. Click "Run Database Maintenance"
3. Wait for completion (may take a few minutes)
4. Check health status improves
```

### Review Recent Activity

```
1. Go to Admin Console → Logs tab
2. Review recent log entries
3. Look for errors or suspicious activity
4. Investigate any critical errors
```

## Performance Tips

- Review logs at least weekly
- Run database maintenance monthly
- Clear cache when experiencing slowness
- Monitor database size growth
- Check disk space regularly

## Troubleshooting

### "Permission Denied" when accessing Admin Console
- Verify you're logged in as an admin
- Check your user role in the system

### Metrics not updating
- Click the "Refresh" button in the header
- Check API connectivity
- Review error logs for details

### Database maintenance taking too long
- This is normal for large databases
- Don't interrupt the process
- Try during off-peak hours if possible

### Cache clearing not helping
- Restart the application
- Check for larger issues in error logs
- Contact support if problems persist

## API Endpoints (Backend)

The Admin Console uses these API endpoints:

- `GET /api/admin/metrics` - System metrics
- `GET /api/admin/health` - System health status
- `GET /api/admin/logs` - System logs
- `POST /api/admin/maintenance/database` - Run DB maintenance
- `POST /api/admin/cache/clear` - Clear application cache

## Best Practices

✅ **Do:**
- Check system health regularly
- Review logs for unusual activity
- Run maintenance proactively
- Keep settings updated
- Monitor user actions

❌ **Don't:**
- Ignore critical alerts
- Let cache grow indefinitely
- Skip database maintenance
- Delete logs unnecessarily
- Make unnecessary setting changes

## Security Considerations

- Admin Console is only accessible to administrators
- All actions are logged
- Sensitive operations require confirmation
- Database maintenance is safe and non-destructive
- Cache clearing is non-destructive

## Support

For issues with the Admin Console:
1. Check system logs for errors
2. Verify admin user permissions
3. Try refreshing the page
4. Restart the application if needed

## Related Documentation

- README_START_HERE.md - Getting started
- PROJECT_STRUCTURE.md - System architecture
- FRESH_START_GUIDE.md - Database management
