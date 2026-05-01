# 🚀 TaskFlow — Team Task Manager

A full-stack web application where teams can create projects, assign tasks, and track progress with role-based access control (Admin/Member).

## 🌐 Live URLs
- **Frontend (Vercel):** https://team-task.vercel.app
- **Backend (Railway):** https://team-task-production.up.railway.app
- **GitHub Repo:** https://github.com/AbhinavGupta0612/Team-Task

---

## ✨ Features

- 🔐 **Authentication** — Signup/Login with JWT tokens
- 👑 **Role-based Access** — Admin & Member roles with different permissions
- 📁 **Project Management** — Create, edit, delete projects with team members
- ✅ **Task Management** — Create tasks, assign to members, set priority & due dates
- 🗃️ **Kanban Board** — Visual board view (To Do / In Progress / Done)
- 📋 **List View** — Detailed task list with filters
- 📊 **Dashboard** — Stats overview with progress tracking
- ⚠️ **Overdue Detection** — Automatic overdue task highlighting
- 🏷️ **Tags** — Add tags to tasks for better organization

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Styling | Custom CSS with CSS Variables |
| Notifications | react-hot-toast |
| Frontend Deployment | Vercel |
| Backend Deployment | Railway |

---

## 📁 Project Structure

```
Team-Task/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (name, email, password, role)
│   │   ├── Project.js       # Project schema with members
│   │   └── Task.js          # Task schema with status, priority, dueDate
│   ├── routes/
│   │   ├── auth.js          # Register, Login, Get Me
│   │   ├── projects.js      # CRUD + member management
│   │   ├── tasks.js         # CRUD + dashboard stats
│   │   └── users.js         # Get all users
│   ├── middleware/
│   │   └── authMiddleware.js # JWT protect + adminOnly
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Projects.js
│   │   │   ├── ProjectDetail.js
│   │   │   └── MyTasks.js
│   │   ├── components/
│   │   │   └── Layout.js    # Sidebar + responsive navigation
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── utils/
│   │   │   └── api.js       # Axios instance with interceptors
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

---

## 🔌 REST API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Get all user projects | Private |
| POST | `/api/projects` | Create project | Admin |
| PUT | `/api/projects/:id` | Update project | Admin (owner) |
| DELETE | `/api/projects/:id` | Delete project | Admin (owner) |
| POST | `/api/projects/:id/members` | Add member | Admin (owner) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin (owner) |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks/project/:id` | Get tasks for project | Private |
| GET | `/api/tasks/my` | Get my tasks | Private |
| GET | `/api/tasks/dashboard` | Get dashboard stats | Private |
| POST | `/api/tasks` | Create task | Admin |
| PUT | `/api/tasks/:id` | Update task | Admin/Assignee |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

---

## 🗃️ Database Schema

### User
```js
{ name, email, password (hashed), role: 'admin'|'member' }
```

### Project
```js
{ name, description, status, createdBy (ref User), members: [{ user, role }], deadline }
```

### Task
```js
{ title, description, status: 'todo'|'in-progress'|'done', priority: 'low'|'medium'|'high', dueDate, project (ref), assignedTo (ref User), createdBy (ref User), tags[] }
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/AbhinavGupta0612/Team-Task.git
cd Team-Task
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

The app will be running at `http://localhost:3000`

---

## 🌐 Deployment

### Backend — Railway
- Root Directory: `backend`
- Start Command: `node server.js`
- Environment Variables:
  ```
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_secret_key
  NODE_ENV=production
  ```

### Frontend — Vercel
- Root Directory: `frontend`
- Framework: Create React App
- Environment Variable:
  ```
  REACT_APP_API_URL=https://team-task-production.up.railway.app/api
  ```

---

## 👤 How to Use

### As Admin:
1. Register with role **Admin**
2. Create a project
3. Add members to the project (they must register first)
4. Create tasks and assign them to members
5. Track progress on the dashboard

### As Member:
1. Register with role **Member**
2. Wait to be added to a project by an Admin
3. View your assigned tasks in **My Tasks**
4. Update task status as you work

---

## 📄 License

MIT License
