import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import OfflineIndicator from './components/UI/OfflineIndicator';
import ErrorBoundary from './components/UI/ErrorBoundary';
import useUserStore, { selectIsAuthenticated } from './store/userStore';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/board/:id" 
        element={
          <PrivateRoute>
            <BoardPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />
    </Routes>
    </ErrorBoundary>
  );
}

export default App;
