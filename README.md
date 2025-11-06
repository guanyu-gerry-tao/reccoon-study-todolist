# Raccoon Study Todolist - An AI-Powered Task Manager

> A modern, full-stack task management application built with the MERN stack, featuring a microservices architecture and an integrated AI assistant powered by LangChain.js to intelligently supercharge your workflow.

---

![Raccoon Study Todolist Banner](docs/rsc/raccoon.png)

## 🚀 Live Demo

### **[🌐 Access the Application](https://raccoon-study-todolist.vercel.app/)**

**Demo Credentials:**
- **Email:** demouser001@raccoon.com  
- **Password:** password

*Experience the full-featured task management system with AI-powered conversation capabilities!*

## 📌 Quick Guide · Technical Highlights

- **Architecture**: Microservices decoupling (`web-client` / `server` / `ai-service`), independent deployment & horizontal scaling, REST communication.
- **Backend**: Doubly linked list storage (O(1) insert/delete), MongoDB `bulkWrite` atomic batch ops, stateless JWT auth, multi-tenant data isolation, payload validation middleware.
- **AI Integration**: LangChain + Zod structured output, intent routing, cross-service context passing, SSE streaming responses, custom IP rate limiting, conversation history.
- **Frontend UX**: Linked-list traversal rendering, optimistic updates with rollback, Framer Motion animation orchestration, Context + Immer lightweight state management, auto-resizing textarea.
- **Engineering**: Environment-specific configs (frontend/backend), strict TypeScript (`strict` enabled), observability & debug-friendly setup.

Read the full highlights with code locations: [`docs/technical_highlights.md`](docs/technical_highlights.md)

**High-quality screenshots or GIFs are crucial for showcasing your work. Consider adding visuals for the following features:*
- The main Kanban board view.
- Dragging and dropping a task.
- The AI chat panel in action.
- The user login page.

**[Placeholder for Project Screenshots/GIFs]**

---

## ✨ Overview

Raccoon Study Todolist was developed to address the limitations of traditional to-do applications. While standard task managers are great for simple lists, they often fall short in helping users break down complex goals or find motivation. This project reimagines task management by integrating a smart AI assistant directly into the user's workflow.

This application is more than just a CRUD app; it's a demonstration of a modern, microservices-oriented architecture. It features a clean React frontend, a robust Express.js backend for core business logic, and a dedicated AI microservice. This AI service leverages **LangChain.js** to manage interactions with large language models, enabling features like natural language conversation and intelligent task generation.

---

## ✨ Product Highlights

- Kanban board with smooth drag & drop
- Fast CRUD for projects and tasks
- Built‑in AI chat and smart task generation
- Secure authentication and polished, animated UI

---

## 💻 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, React Router, Framer Motion, Immer (for state management) |
| **Backend (Business Service)** | Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt.js |
| **Backend (AI Service)** | Node.js, Express, **LangChain.js**, OpenAI API, Zod (for validation), Redis (for caching/rate-limiting) |
| **DevOps & Tooling** | ESLint, Prettier, Nodemon, Concurrently (recommended for local dev) |

---

## 🏗️ Architecture

This project implements a **microservices-oriented architecture** to ensure separation of concerns and scalability.

**[Placeholder for a simple Architecture Diagram]**
*(You can create a simple diagram showing the three main components and data flow)*

- **`web-client`**: A responsive and modern Single Page Application (SPA) built with **React 19** and TypeScript. It handles all UI rendering and user interactions, communicating with the backend services via REST APIs.
- **`server`**: The core business logic service. This Express.js application manages user authentication, projects, and task data, persisting everything in a MongoDB database.
- **`ai-service`**: A dedicated microservice for handling all AI-related functionalities. It uses **LangChain.js** to create robust chains that process user input, manage prompts, and interface with the OpenAI API, returning structured data to the frontend.

---

## 🚀 Getting Started

Follow these steps to run the project locally:

**1. Prerequisites**
- Node.js (v18 or later)
- MongoDB instance (local or cloud)
- OpenAI API Key

**2. Clone the Repository**
```bash
git clone https://github.com/your-username/raccoon-study-todolist.git
cd raccoon-study-todolist
```

**3. Configure Environment Variables**
Create a `.env` file in both the `server` and `ai-service` directories.

- `server/.env`:
  ```
  PORT=3001
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ```
- `ai-service/.env`:
  ```
  PORT=3002
  OPENAI_API_KEY=your_openai_api_key
  ```

**4. Install Dependencies & Run**
It's recommended to run each service in a separate terminal.

- **Terminal 1: Start the Backend Business Service**
  ```bash
  cd server
  npm install
  npm start
  ```
- **Terminal 2: Start the Backend AI Service**
  ```bash
  cd ai-service
  npm install
  npm start
  ```
- **Terminal 3: Start the Frontend Application**
  ```bash
  cd web-client
  npm install
  npm run dev
  ```
The application should now be running on `http://localhost:5173` (or another port specified by Vite).

---

## 🤔 Challenges & Learnings

**Optimistic UI for Drag & Drop**
- Immediate visual feedback with state updated optimistically; background sync to server; automatic rollback on failure. Greatly improved perceived performance and UX.

More detailed, STAR‑style write‑ups (with code locations) are in [`docs/technical_highlights.md`](docs/technical_highlights.md).
