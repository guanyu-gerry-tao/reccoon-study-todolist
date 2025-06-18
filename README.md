# antist-todolist

A full-stack practice project focused on building a user-authenticated ToDo List application. The goal is to implement task management with clean UI, secure login, and multi-device access. It starts with web development and may later extend to iOS/macOS apps.


## Project Goals

- Implement secure user authentication (JWT)
- Build a user-friendly task interface with full CRUD
- Store tasks per user in a PostgreSQL database
- Structure the project with separate frontend and backend
- Prepare for production deployment and multi-platform expansion


## Tech Stack

- Frontend
  - React
  - React Router
  - TypeScript
  - Vite
- Backend
  - Node.js 
  - Express
- Database
  - PostgreSQL
- ORM
  - Prisma
- Auth
  - JWT + Bcrypt
- Deployment
  - Vercel (frontend)
  - Render (backend + DB)

## Folder Structure

```
antist-todolist/
├── client/      # React frontend
├── server/      # Express backend
├── prisma/      # Prisma schema and migrations
├── docs/        # Optional project docs
└── README.md    # This file
```

## Development Scope

### Phase 1: MVP
- [ ] Register / Login / Logout (with JWT)
- [ ] Create / Delete / Toggle tasks
- [ ] Display tasks per user

### Phase 2: In Progress
- [ ] Edit task content
- [ ] Add due date / categories
- [ ] Responsive layout & style polish
- [ ] Global state management (e.g., Zustand)

### Phase 3: Optional/Future
- [ ] SwiftUI iOS/macOS client
- [ ] Multi-device sync
- [ ] OAuth login (Google/GitHub)

---

Open to collaboration. Feel free to contact or submit issues if you'd like to join!