# 🚀 Quick Start Guide - Flowboard

Follow these steps to get Flowboard up and running!

## 📋 Prerequisites Check

Before starting, make sure you have:
- ✅ **Node.js** 18+ installed (`node --version`)
- ✅ **Python** 3.9+ installed (`python --version`)
- ✅ **MySQL/TiDB** database running
- ⚠️ **Redis** (optional, only needed for email notifications)

---

## 🔧 Step 1: Backend Setup

### 1.1 Navigate to Backend Directory
```bash
cd backend
```

### 1.2 Activate Virtual Environment
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 1.3 Create Environment File
Create a `.env` file in the `backend` directory with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=flowboard

# Security (IMPORTANT: Change in production!)
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (Frontend URLs)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Redis (Optional - for email notifications)
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

### 1.4 Run Database Migrations
```bash
alembic upgrade head
```

### 1.5 Start Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```

✅ Backend should now be running at: **http://localhost:8000**
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## 🎨 Step 2: Frontend Setup

### 2.1 Open New Terminal Window
Keep the backend running, open a **new terminal** for the frontend.

### 2.2 Navigate to Frontend Directory
```bash
cd frontend
```

### 2.3 Install Dependencies (if not already installed)
```bash
npm install
```

### 2.4 Start Frontend Development Server
```bash
npm run dev
```

✅ Frontend should now be running at: **http://localhost:5173**

---

## 🎉 Step 3: Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. You should see the Flowboard login page
3. Click "Sign up free" to create a new account
4. Start creating boards and managing tasks!

---

## 🔍 Verification Checklist

### Backend Check:
- [ ] Backend server is running on port 8000
- [ ] Can access http://localhost:8000/docs
- [ ] Database connection is successful
- [ ] No errors in backend terminal

### Frontend Check:
- [ ] Frontend server is running on port 5173
- [ ] Can access http://localhost:5173
- [ ] No errors in browser console
- [ ] No errors in frontend terminal

### Connection Check:
- [ ] Frontend can communicate with backend API
- [ ] WebSocket connection works (check browser console)
- [ ] Can register/login successfully

---

## 🐛 Troubleshooting

### Backend Issues:

**Database Connection Error:**
```
- Check your .env file has correct database credentials
- Ensure MySQL/TiDB is running
- Verify database exists: CREATE DATABASE flowboard;
```

**Port Already in Use:**
```bash
# Use a different port
uvicorn app.main:app --reload --port 8001
```

**Migration Errors:**
```bash
# Reset migrations (WARNING: This will delete data)
alembic downgrade base
alembic upgrade head
```

### Frontend Issues:

**Port Already in Use:**
```bash
# Vite will automatically use next available port
# Or specify: npm run dev -- --port 5174
```

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**API Connection Failed:**
- Check backend is running
- Verify CORS settings in backend
- Check browser console for errors

### WebSocket Issues:

**WebSocket Connection Failed:**
- Ensure backend is running
- Check CORS includes your frontend URL
- Verify WebSocket endpoint: `ws://localhost:8000/ws/boards/{id}`

---

## 📝 Optional: Background Tasks (Email Notifications)

If you want email notifications to work:

### 1. Start Redis
```bash
redis-server
```

### 2. Start Celery Worker (in a new terminal)
```bash
cd backend
.\venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

celery -A app.tasks.celery_app worker --loglevel=info
```

### 3. Start Celery Beat (in another terminal)
```bash
cd backend
.\venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

celery -A app.tasks.celery_app beat --loglevel=info
```

---

## 🎯 Quick Commands Reference

### Backend:
```bash
cd backend
.\venv\Scripts\activate          # Activate venv
alembic upgrade head             # Run migrations
uvicorn app.main:app --reload    # Start server
```

### Frontend:
```bash
cd frontend
npm install                      # Install dependencies
npm run dev                      # Start dev server
npm run build                    # Build for production
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Backend Terminal:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   ```

2. **Frontend Terminal:**
   ```
   VITE v7.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

3. **Browser:**
   - Flowboard login/register page loads
   - No console errors
   - Can create account and login

---

## 🆘 Need Help?

- Check the main [README.md](../README.md) for detailed documentation
- Review API documentation at http://localhost:8000/docs
- Check browser console for frontend errors
- Check backend terminal for server errors

---

**Happy coding! 🚀**

