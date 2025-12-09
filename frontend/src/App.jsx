import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import useUserStore from './store/userStore';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  // For development demo purposes, let's allow access if token is present or just skip auth check if needed
  // But strict implementation:
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
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
    </Routes>
  );
}

export default App;
