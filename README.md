# 🚀 TaskFlow — Team Task Manager

A full-stack web application where teams can create projects, assign tasks, and track progress with role-based access control (Admin/Member).

**Live URL:** `https://your-app.railway.app` *(replace after deployment)*  
**GitHub Repo:** `https://github.com/yourusername/team-task-manager`

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
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Styling | Custom CSS with CSS Variables |
| Notifications | react-hot-toast |
| Deployment | Railway |

---

## 📁 Project Structure

```
team-task-manager/
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
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
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
npm install
# For local dev, proxy is already set to localhost:5000
npm start
```

The app will be running at `http://localhost:3000`

---

## 🌐 Deployment on Railway

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/team-task-manager.git
git push -u origin main
```

### Step 2: Deploy Backend
1. Go to [railway.app](https://railway.app) → New Project
2. Select **Deploy from GitHub** → pick your repo
3. Set **Root Directory** to `backend`
4. Add environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   FRONTEND_URL=https://your-frontend.railway.app
   ```
5. Deploy ✅

### Step 3: Deploy Frontend
1. Add new service in same Railway project
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
4. Deploy ✅

### Step 4: Get MongoDB on Railway
1. In Railway project → Add Plugin → MongoDB
2. Copy the `MONGO_PUBLIC_URL` value
3. Paste as `MONGO_URI` in backend environment variables

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

## 📸 Screenshots

*(Add screenshots after deployment)*

---

## 🤝 Contributing

Pull requests are welcome!

---

## 📄 License

MIT License
