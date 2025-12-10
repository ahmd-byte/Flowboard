# Flowboard - Kanban Board Application

A modern, full-stack Kanban board application built with React, FastAPI, and MySQL. Features real-time collaboration, dark/light mode, PWA support, and more.

## 🚀 Features

### Core Features
- **Kanban Boards**: Create and manage multiple boards with lists and cards
- **Drag & Drop**: Intuitive drag-and-drop interface for organizing tasks
- **Real-time Collaboration**: WebSocket-based live updates and cursor sharing
- **Dark/Light Mode**: Seamless theme switching with persistent preferences
- **User Authentication**: Secure JWT-based authentication system
- **Team Collaboration**: Invite members to boards with role-based permissions

### Advanced Features
- **PWA Support**: Install as a Progressive Web App for offline access
- **Offline Support**: Queue actions when offline, sync when back online
- **Export Functionality**: Export boards as JSON or PDF
- **Undo/Redo**: Action history with keyboard shortcuts
- **Search**: Global search across boards and cards
- **Onboarding Tour**: Interactive guide for new users
- **Keyboard Shortcuts**: Power user shortcuts for faster navigation
- **Email Notifications**: Automated email alerts for board activities
- **Card Labels & Due Dates**: Organize and track tasks with labels and deadlines

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **MySQL** 8.0+ or compatible database (TiDB, MariaDB)
- **Redis** (optional, for Celery background tasks)

## 🛠️ Installation

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
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and `SECRET_KEY`
   - Optional: Configure SMTP settings for email notifications

6. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
Flowboard/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/             # Config, security, JWT
│   │   ├── db/               # Database models and session
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic, WebSocket, Email
│   │   └── tasks/            # Celery background tasks
│   ├── alembic/             # Database migrations
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API service layer
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets, PWA files
│   └── package.json
│
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=mysql+pymysql://user:password@localhost:4000/flowboard

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@flowboard.com
```

### Frontend Configuration

The frontend API base URL is configured in `frontend/src/api/axios.js`. Update it if your backend runs on a different port.

## 🎮 Usage

### Creating Your First Board

1. Sign up or log in to your account
2. Click "New Board" on the dashboard
3. Enter a board title and select a background
4. Start adding lists and cards!

### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Open search
- `Ctrl/Cmd + /` or `?`: Show keyboard shortcuts
- `G + D`: Go to Dashboard
- `G + P`: Go to Profile
- `G + S`: Go to Settings
- `Esc`: Close modals/dialogs

### Real-time Collaboration

- Multiple users can work on the same board simultaneously
- See live cursors of other users
- Changes sync in real-time via WebSocket
- View online users in the board header

## 🧪 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/boards/` - List user's boards
- `POST /api/v1/boards/` - Create board
- `GET /api/v1/boards/{id}/full` - Get board with lists and cards
- `POST /api/v1/lists/` - Create list
- `POST /api/v1/cards/` - Create card
- `PUT /api/v1/cards/{id}/move` - Move card
- `GET /api/v1/stats/dashboard` - Get dashboard statistics

## 🚀 Deployment

### Backend Deployment

1. Set production environment variables
2. Use a production ASGI server (e.g., Gunicorn with Uvicorn workers)
3. Set up reverse proxy (Nginx)
4. Configure SSL/TLS certificates

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)

3. Update API base URL for production

## 🧩 Background Tasks (Optional)

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

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### WebSocket Connection Failed
- Check CORS settings in backend
- Verify WebSocket endpoint is accessible
- Check browser console for errors

### Email Notifications Not Working
- Verify SMTP credentials in `.env`
- Check if Celery worker is running
- Review email service logs

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, FastAPI, and MySQL

