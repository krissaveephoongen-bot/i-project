When updating or modifying the project
- Always maintain strict separation between User Portal and Admin Console
- User Portal pages must be in `user-portal/` directory with white/light theme
- Admin Console pages must be in `admin-console/` directory with navy/dark theme
- Shared authentication logic goes through `login.html` with role-based routing
- Users with role 'employee' or 'manager' route to `/user-portal/dashboard.html`
- Users with role 'admin' route to `/admin-console/dashboard.html`
- Keep User Portal mobile-first and action-oriented
- Keep Admin Console desktop-first and data-dense
- Use Modern Corporate Glass design system with glassmorphism effects