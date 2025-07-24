# Heritage Jakarta Volunteer Management System

Backend API for managing volunteers and tasks for the Indonesian Heritage Society.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PORT=3000
```

3. Run the development server:
```bash
npm run dev
```

## Database Setup

### For New Installations
Run the SQL commands in `schema_hierarchical.sql` in your Supabase SQL editor to set up the necessary tables with the hierarchical structure.

### For Existing Installations
If you already have data in your database and want to add the new status columns without losing data:

1. Run the SQL commands in `migration_add_status_columns.sql` in your Supabase SQL editor
2. This will add:
   - `status_volunteer` column to the profiles table (default: 'open')
   - `status_project` column to the projects table (default: 'on_going')
   - Update the user creation trigger to include the new columns


## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/logout`: Logout user

### User
- `GET /api/users/profile`: Get user profile (requires authentication)
- `PATCH /api/users/profile`: Update user profile (requires authentication)
- `POST /api/users/toggle-status`: Toggle volunteer status between 'open' and 'closed' (requires authentication)

### Projects
- `GET /api/projects`: Get all projects
- `GET /api/projects/active`: Get all ongoing projects
- `GET /api/projects/:id`: Get a specific project
- `POST /api/projects/:id/apply`: Apply for a project (requires authentication)
- `GET /api/projects/recommended/me`: Get recommended projects for the current user (requires authentication)
- `GET /api/projects/applications/me`: Get user's project applications (requires authentication)
- `POST /api/projects`: Create a new project (requires admin)
- `PUT /api/projects/:id`: Update a project (requires admin)
- `DELETE /api/projects/:id`: Delete a project (requires admin)

### Tasks
- `GET /api/tasks`: Get all tasks
- `GET /api/tasks/active`: Get all open tasks
- `GET /api/tasks/:id`: Get a specific task
- `POST /api/tasks/:id/apply`: Apply for a task (requires authentication)
- `GET /api/tasks/recommended/me`: Get recommended tasks for the current user (requires authentication)

### Admin
- `GET /api/admin/users`: Get all users (requires admin)
- `PATCH /api/admin/users/role`: Update user role (requires admin)
- `PATCH /api/admin/users/:userId/status`: Update volunteer status (requires admin)
- `GET /api/admin/tasks`: Get all tasks (requires admin)
- `POST /api/admin/tasks`: Create a new task (requires admin)
- `PUT /api/admin/tasks/:id`: Update a task (requires admin)
- `DELETE /api/admin/tasks/:id`: Delete a task (requires admin)
- `GET /api/admin/applications`: Get all volunteer applications (requires admin)
- `PATCH /api/admin/applications/:id/status`: Update application status (requires admin)
- `POST /api/admin/projects/:projectId/assign`: Assign volunteers to a project (requires admin)
- `PATCH /api/admin/projects/:projectId/status`: Update project status (requires admin)

## Status Values

### Volunteer Status
- `open`: Volunteer is available for new assignments
- `closed`: Volunteer is not accepting new assignments

### Project Status
- `on_going`: Project is active and accepting applications
- `done`: Project is completed and no longer accepting applications

### Task Status
- `open`: Task is active and accepting applications
- `closed`: Task is no longer accepting applications

### Application Status
- `applied`: User has applied but not yet reviewed
- `recommended`: AI has recommended this volunteer
- `confirmed`: Application has been approved
- `rejected`: Application has been rejected