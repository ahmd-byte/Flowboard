# 🚀 Flowboard - Modern Kanban Board Application

<div align="center">

![Flowboard Logo](https://img.shields.io/badge/Flowboard-Kanban%20Board-red?style=for-the-badge&logo=trello)

**A powerful, full-stack Kanban board application built with cutting-edge technologies**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

[Features](#features) • [Installation](#installation) • [Documentation](#api-documentation) • [Roadmap](#roadmap--future-features)

</div>

---

## 📖 About Flowboard

Flowboard is a modern, feature-rich Kanban board application inspired by Trello, designed for teams and individuals who need a powerful project management tool. Built with a focus on real-time collaboration, user experience, and performance, Flowboard combines the best of modern web technologies to deliver a seamless task management experience.

### ✨ What Makes Flowboard Special?

- **Real-time Collaboration**: See team members' cursors and changes as they happen
- **Offline-First**: Work seamlessly even when offline, with automatic sync when back online
- **Progressive Web App**: Install as a native app on any device
- **Beautiful UI**: Modern, responsive design with dark/light mode support
- **Enterprise-Ready**: Role-based permissions, email notifications, and comprehensive API

---

## 🎯 Features

### 🎨 Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **📋 Kanban Boards** | Create unlimited boards with custom backgrounds | ✅ Complete |
| **📝 Lists & Cards** | Organize tasks with drag-and-drop lists and cards | ✅ Complete |
| **👥 Team Collaboration** | Invite members with role-based permissions (Admin, Editor, Viewer) | ✅ Complete |
| **🔄 Real-time Sync** | WebSocket-based live updates across all clients | ✅ Complete |
| **👀 Live Cursors** | See where team members are working in real-time | ✅ Complete |
| **🌓 Dark/Light Mode** | Seamless theme switching with persistent preferences | ✅ Complete |
| **🔐 Authentication** | Secure JWT-based authentication with refresh tokens | ✅ Complete |
| **📱 PWA Support** | Install as Progressive Web App for offline access | ✅ Complete |

### 🚀 Advanced Features

| Feature | Description | Status |
|---------|-------------|--------|
| **📤 Export Boards** | Export boards as JSON or PDF | ✅ Complete |
| **🔍 Global Search** | Search across all boards and cards | ✅ Complete |
| **⌨️ Keyboard Shortcuts** | Power user shortcuts for faster navigation | ✅ Complete |
| **↩️ Undo/Redo** | Action history with undo/redo support | ✅ Complete |
| **🏷️ Card Labels** | Organize cards with color-coded labels | ✅ Complete |
| **📅 Due Dates** | Set and track deadlines for cards | ✅ Complete |
| **📧 Email Notifications** | Automated email alerts for board activities | ✅ Complete |
| **🎓 Onboarding Tour** | Interactive guide for new users | ✅ Complete |
| **📊 Dashboard Stats** | View statistics and insights | ✅ Complete |
| **💬 Comments** | Add comments to cards for collaboration | ✅ Complete |

### 🔧 Technical Features

- **RESTful API** with comprehensive Swagger documentation
- **WebSocket** for real-time bidirectional communication
- **Background Tasks** with Celery for async operations
- **Database Migrations** with Alembic
- **Error Handling** with comprehensive error boundaries
- **Responsive Design** optimized for all screen sizes
- **State Management** with Zustand for efficient state handling

---

## 🛠️ Technology Stack

### Frontend
- **React 19.2** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **React Beautiful DnD** - Drag and drop functionality
- **Axios** - HTTP client
- **React Hot Toast** - Beautiful toast notifications
- **Lucide React** - Modern icon library

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Token authentication
- **WebSockets** - Real-time communication
- **Celery** - Distributed task queue
- **Redis** - In-memory data store
- **PyMySQL** - MySQL database connector

### Database
- **MySQL 8.0+** / **TiDB** / **MariaDB** - Relational database

### DevOps & Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Alembic** - Database migrations
- **PWA** - Service workers for offline support

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **MySQL** 8.0+ or compatible database (TiDB, MariaDB)
- **Redis** (optional, for Celery background tasks)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # Windows
   .\venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment:**
   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=3306  # Standard MySQL port (use 4000 if using TiDB)
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=flowboard
   
   # Security
   SECRET_KEY=your-secret-key-here-change-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   
   # CORS
   CORS_ORIGINS=http://localhost:5173  # Frontend dev server port
   
   # Redis (Optional - for Celery)
   REDIS_URL=redis://localhost:6379/0
   CELERY_BROKER_URL=redis://localhost:6379/0
   CELERY_RESULT_BACKEND=redis://localhost:6379/0
   
   # Email (Optional - for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=noreply@flowboard.com
   ```

6. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_WS_URL=ws://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

### Background Tasks (Optional)

To enable email notifications and scheduled tasks:

1. **Start Redis:**
   ```bash
   redis-server
   ```

2. **Start Celery Worker:**
   ```bash
   celery -A app.tasks.celery_app worker --loglevel=info
   ```

3. **Start Celery Beat (Scheduler):**
   ```bash
   celery -A app.tasks.celery_app beat --loglevel=info
   ```

---

## 📁 Project Structure

```text
Flowboard/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/              # API endpoints (auth, boards, cards, etc.)
│   │   ├── core/                # Configuration, security, JWT
│   │   ├── db/
│   │   │   ├── models/          # SQLAlchemy database models
│   │   │   ├── base.py          # Base model class
│   │   │   └── session.py       # Database session
│   │   ├── schemas/             # Pydantic schemas for validation
│   │   ├── services/            # Business logic
│   │   │   ├── websocket_manager.py  # WebSocket connection management
│   │   │   └── email_service.py      # Email notification service
│   │   ├── tasks/               # Celery background tasks
│   │   │   ├── celery_app.py    # Celery configuration
│   │   │   ├── notifications.py # Notification tasks
│   │   │   └── automations.py   # Automation tasks
│   │   ├── cert/                # SSL certificates (for TiDB)
│   │   └── main.py              # FastAPI application entry point
│   ├── alembic/                 # Database migrations
│   │   ├── versions/            # Migration files
│   │   └── env.py               # Alembic environment
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # Backend-specific documentation
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # API service layer
│   │   │   ├── axios.js         # Axios configuration
│   │   │   └── services.js      # API service functions
│   │   ├── components/         # React components
│   │   │   ├── Board/          # Board-related components
│   │   │   ├── Layout/          # Layout components (Sidebar, Topbar)
│   │   │   └── UI/              # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useWebSocket.js  # WebSocket hook
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   ├── BoardPage.jsx   # Board view page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Profile.jsx      # User profile page
│   │   │   └── Settings.jsx    # Settings page
│   │   ├── store/               # Zustand state management
│   │   │   ├── boardStore.js    # Board state
│   │   │   ├── userStore.js     # User state
│   │   │   ├── themeStore.js    # Theme state
│   │   │   ├── historyStore.js  # Undo/redo history
│   │   │   └── offlineStore.js  # Offline queue
│   │   ├── utils/               # Utility functions
│   │   │   └── exportBoard.js   # Board export functionality
│   │   ├── App.jsx              # Main App component
│   │   └── main.jsx             # Application entry point
│   ├── public/                  # Static assets
│   │   ├── sw.js                # Service worker (PWA)
│   │   └── manifest.json        # PWA manifest
│   ├── package.json             # Node.js dependencies
│   └── vite.config.js           # Vite configuration
│
└── README.md                    # This file
```

---

## 🎮 Usage Guide

### Getting Started

1. **Sign Up**: Create a new account or log in
2. **Create Board**: Click "New Board" on the dashboard
3. **Add Lists**: Create lists to organize your workflow (e.g., "To Do", "In Progress", "Done")
4. **Add Cards**: Create cards within lists to represent tasks
5. **Invite Team**: Click the members icon to invite team members
6. **Collaborate**: Start working together in real-time!

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open global search |
| `Ctrl/Cmd + /` or `?` | Show keyboard shortcuts |
| `G + D` | Navigate to Dashboard |
| `G + P` | Navigate to Profile |
| `G + S` | Navigate to Settings |
| `Esc` | Close modals/dialogs |

### Real-time Collaboration

- **Live Cursors**: See where team members are working
- **Instant Updates**: Changes sync in real-time via WebSocket
- **Online Users**: View who's currently viewing the board
- **Role-Based Access**: Control who can view, edit, or administer boards

### Card Features

- **Labels**: Add color-coded labels to categorize cards
- **Due Dates**: Set deadlines and track overdue tasks
- **Comments**: Add comments for team discussions
- **Descriptions**: Add detailed descriptions to cards
- **Drag & Drop**: Move cards between lists easily

---

## 🧪 API Documentation

Once the backend is running, visit:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Main API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get access token
- `GET /api/v1/auth/me` - Get current user profile

#### Boards
- `GET /api/v1/boards/` - List user's boards
- `POST /api/v1/boards/` - Create new board
- `GET /api/v1/boards/{id}` - Get board details
- `GET /api/v1/boards/{id}/full` - Get board with all lists and cards
- `PUT /api/v1/boards/{id}` - Update board
- `DELETE /api/v1/boards/{id}` - Delete board

#### Lists
- `GET /api/v1/lists/board/{board_id}` - Get lists for a board
- `POST /api/v1/lists/` - Create new list
- `PUT /api/v1/lists/{id}` - Update list
- `PUT /api/v1/lists/{id}/position` - Update list position
- `DELETE /api/v1/lists/{id}` - Delete list

#### Cards
- `GET /api/v1/cards/list/{list_id}` - Get cards for a list
- `GET /api/v1/cards/{id}` - Get card details
- `POST /api/v1/cards/` - Create new card
- `PUT /api/v1/cards/{id}` - Update card
- `PUT /api/v1/cards/{id}/move` - Move card to different list/position
- `DELETE /api/v1/cards/{id}` - Delete card

#### Comments
- `GET /api/v1/comments/card/{card_id}` - Get comments for a card
- `POST /api/v1/comments/` - Add comment to card
- `DELETE /api/v1/comments/{id}` - Delete comment

#### Statistics
- `GET /api/v1/stats/dashboard` - Get dashboard statistics

#### WebSocket
- `WS /ws/boards/{board_id}` - Real-time board updates

---

## 🏗️ Architecture

### System Architecture

```text
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │◄────►│   FastAPI    │◄────►│    MySQL    │
│  Frontend   │ HTTP │   Backend    │ SQL  │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
      │                     │                     │
      │                     │                     │
      └─────────────────────┼─────────────────────┘
                            │
                            │ WebSocket
                            │
                     ┌──────▼──────┐
                     │   Redis     │
                     │  (Celery)   │
                     └─────────────┘
```

### Data Flow

1. **User Action** → Frontend (React)
2. **API Call** → Backend (FastAPI)
3. **Database Update** → MySQL
4. **WebSocket Broadcast** → All connected clients
5. **UI Update** → Real-time sync

---

## 🚀 Deployment

### Backend Deployment

1. **Set production environment variables**
2. **Use production ASGI server:**
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```
3. **Set up reverse proxy (Nginx)**
4. **Configure SSL/TLS certificates**
5. **Set up process manager (PM2, systemd, etc.)**

### Frontend Deployment

1. **Build production bundle:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy the `dist` folder** to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

3. **Update API base URL** for production environment

---

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL/TiDB is running
- Check database credentials in `.env`
- Ensure database exists
- Verify network connectivity

### WebSocket Connection Failed
- Check CORS settings in backend
- Verify WebSocket endpoint is accessible
- Check browser console for errors
- Ensure WebSocket is not blocked by firewall

### Email Notifications Not Working
- Verify SMTP credentials in `.env`
- Check if Celery worker is running
- Review email service logs
- Test SMTP connection manually

### Frontend Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version (requires 18+)

---

## 🗺️ Roadmap & Future Features

### 🎯 Planned Features

#### Short-term (Next Release)
- [ ] **📎 File Attachments** - Attach files and images to cards
- [ ] **📊 Advanced Analytics** - Detailed board and team analytics
- [ ] **🔔 Push Notifications** - Browser push notifications
- [ ] **📱 Mobile App** - Native iOS and Android apps
- [ ] **🌐 Multi-language Support** - i18n for multiple languages
- [ ] **🎨 Custom Themes** - User-defined color themes
- [ ] **📋 Templates** - Pre-built board templates
- [ ] **⏰ Time Tracking** - Track time spent on cards

#### Medium-term
- [ ] **📈 Reporting** - Advanced reporting and insights
- [ ] **🔗 Integrations** - Slack, GitHub, Jira integrations
- [ ] **🤖 AI Assistant** - AI-powered task suggestions
- [ ] **📝 Rich Text Editor** - Markdown support in descriptions
- [ ] **📸 Screenshots** - Capture and attach screenshots
- [ ] **🎥 Video Comments** - Record video comments
- [ ] **📅 Calendar View** - Calendar view for due dates
- [ ] **🔍 Advanced Filters** - Complex filtering and sorting

#### Long-term
- [ ] **🌍 Multi-tenant** - Support for organizations
- [ ] **💳 Subscription Plans** - Premium features
- [ ] **🔐 SSO Integration** - Single Sign-On support
- [ ] **📊 Custom Dashboards** - Build custom dashboards
- [ ] **🔄 Workflow Automation** - Visual workflow builder
- [ ] **📱 Offline Mobile App** - Full offline mobile support
- [ ] **🌐 API Webhooks** - Webhook support for integrations
- [ ] **📦 Plugin System** - Extensible plugin architecture

### 🎨 UI/UX Improvements
- [ ] **Dark Mode Variants** - Multiple dark theme options
- [ ] **Animations** - Smooth transitions and animations
- [ ] **Accessibility** - WCAG 2.1 AA compliance
- [ ] **Keyboard Navigation** - Full keyboard navigation support
- [ ] **Touch Gestures** - Mobile touch gesture support

### 🔧 Technical Improvements
- [ ] **Unit Tests** - Comprehensive test coverage
- [ ] **E2E Tests** - End-to-end testing
- [ ] **Performance Optimization** - Further performance improvements
- [ ] **Caching Strategy** - Advanced caching implementation
- [ ] **CDN Integration** - CDN for static assets
- [ ] **Monitoring** - Application monitoring and logging
- [ ] **Error Tracking** - Sentry or similar integration

---

## 📊 Project Status

### ✅ Completed Features

- ✅ User authentication and authorization
- ✅ Board, list, and card management
- ✅ Real-time collaboration with WebSocket
- ✅ Live cursor tracking
- ✅ Drag and drop functionality
- ✅ Dark/light mode
- ✅ PWA support
- ✅ Offline queue and sync
- ✅ Email notifications
- ✅ Role-based permissions
- ✅ Card labels and due dates
- ✅ Comments system
- ✅ Global search
- ✅ Export functionality
- ✅ Dashboard statistics
- ✅ Keyboard shortcuts
- ✅ Onboarding tour
- ✅ Undo/redo functionality

### 🔄 In Progress

- 🔄 Code optimization and refactoring
- 🔄 Performance improvements
- 🔄 Documentation enhancement

### 📝 Known Issues

- None currently reported

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add innovative feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Be respectful and professional

---

## 👥 Authors & Contributors

- **Ahmad Syafi** - *Initial work and development*

---

## 🙏 Acknowledgments

- Inspired by [Trello](https://trello.com/)
- Built with amazing open-source technologies
- Thanks to all contributors and users

---

## 📧 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/ahmd-byte/Flowboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ahmd-byte/Flowboard/discussions)
- **Email**: [support@flowboard.com](mailto:support@flowboard.com)

---

<div align="center">

**Made with ❤️ using React, FastAPI, and MySQL**

⭐ Star this repo if you find it helpful!

[⬆ Back to Top](#-flowboard---modern-kanban-board-application)

</div>
