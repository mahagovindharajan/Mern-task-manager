# Task Manager — Full Stack MERN Application

A production-ready task management app built with MongoDB, Express, React, and Node.js. Features JWT authentication, full CRUD operations, filtering, searching, sorting, and dashboard statistics.

🔗 **Live Demo:** https://task-manager-yourname.netlify.app  
🔗 **API Base:** https://task-manager-api.onrender.com

---

## Screenshots

> Add your screenshots here after deployment

---

## Features

### Authentication
- Register and login with JWT-based authentication
- Passwords hashed with bcrypt
- Protected routes — unauthenticated users redirected to login
- Token persists across page refreshes via localStorage
- Auto-logout on token expiry

### Task Management
- Create tasks with title, description, priority, and due date
- Edit any field of an existing task
- Delete tasks with a 2-click confirmation guard
- Toggle task completion with instant UI feedback

### Filtering, Search & Sort
- Filter by status: **All / Completed / Pending**
- Search tasks by title or description (debounced, case-insensitive)
- Sort by: **Newest / Oldest / Priority / Due Date**
- All filters combinable in one query

### Dashboard Statistics
- Total tasks count
- Completed tasks count
- Pending tasks count
- Overdue tasks count (past due date, not completed)
- Completion rate percentage

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js 18, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| HTTP | Axios with request/response interceptors |
| Deployment | Netlify (frontend), Render (backend) |

---

## Project Structure

```bash
task-manager/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── _redirects
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskFilters.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useTasks.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── taskService.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Local Development Setup

## Prerequisites

Install:

- Node.js v18+
- Git
- MongoDB Atlas account

---

## 1) Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

---

## 2) Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

Backend:

```bash
http://localhost:5000
```

Health check:

```bash
http://localhost:5000/
```

Response:

```json
{
  "message": "Task Manager API is running 🚀"
}
```

---

## 3) Frontend Setup

Open new terminal:

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend:

```bash
http://localhost:5173
```

---

## Deployment

## Backend — Render

| Setting | Value |
|--------|------|
| Root Directory | backend |
| Build Command | npm install |
| Start Command | npm start |

Environment variables:

```env
MONGO_URI=your MongoDB Atlas connection string
JWT_SECRET=your production secret key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.netlify.app
```

---

## Frontend — Netlify

| Setting | Value |
|--------|------|
| Base directory | frontend |
| Build command | npm run build |
| Publish directory | frontend/dist |

Environment variable:

```env
VITE_API_BASE_URL=https://your-api.onrender.com/api
```

---

## API Reference

## Authentication

| Method | Endpoint | Access | Description |
|------|----------|-------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login user |
| GET | /api/auth/me | Private | Current logged in user |

Register:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Login:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "123",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

---

## Tasks

Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

| Method | Endpoint | Description |
|------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create task |
| GET | /api/tasks/stats | Task statistics |
| GET | /api/tasks/:id | Single task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PATCH | /api/tasks/:id/toggle | Toggle complete |

Query params:

```bash
filter=all|completed|pending
search=keyword
sort=newest|oldest|priority|dueDate
```

Example:

```bash
GET /api/tasks?filter=pending&search=meeting&sort=priority
```

Create task:

```json
{
  "title": "Build frontend",
  "description": "Set up React app",
  "priority": "High",
  "dueDate": "2025-07-01"
}
```

Stats response:

```json
{
  "success": true,
  "stats": {
    "totalTasks": 12,
    "completedTasks": 7,
    "pendingTasks": 5,
    "overdueTasks": 2,
    "completionRate": "58%"
  }
}
```

---

## Environment Variables

## Backend

| Variable | Required | Description |
|---------|---------|-------------|
| PORT | No | Server port |
| MONGO_URI | Yes | MongoDB connection |
| JWT_SECRET | Yes | JWT signing secret |
| JWT_EXPIRE | Yes | Expiry |
| FRONTEND_URL | Yes | Allowed frontend URL |

## Frontend

| Variable | Required | Description |
|---------|---------|-------------|
| VITE_API_BASE_URL | Yes | API URL |

---

## Security Features

- Password hashing using bcrypt
- JWT authentication
- Token expiry
- Route protection
- CORS restriction
- User-scoped task access
- Safe update whitelisting
- Search sanitization

---

## License

MIT License

---

## Author

Built by **YOUR_NAME**  
GitHub: https://github.com/YOUR_USERNAME
