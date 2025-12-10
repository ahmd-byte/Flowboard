import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useUserStore from '../store/userStore';
import { Mail, Lock, Loader, Flame, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const { data } = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = data.access_token;
      
      const userRes = await api.get('/auth/me', {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      login(userRes.data, token);
      toast.success(`Welcome back, ${userRes.data.name}!`);
      navigate('/');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : 
                      Array.isArray(detail) ? detail[0]?.msg || 'Invalid input' : 
                      'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-gray-50 overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-black p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/50 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Flame size={28} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Flowboard</span>
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Manage your<br />
            <span className="text-white/80">projects with</span><br />
            <span className="text-yellow-300">precision.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md">
            The ultimate Kanban board for teams who want to move fast and ship faster.
          </p>
          
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-4">
            {['Drag & Drop', 'Real-time Sync', 'Team Collaboration', 'Email Alerts'].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/10 backdrop-blur text-white/80 text-sm rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 text-white/40 text-sm">
          © 2024 Flowboard. All rights reserved.
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
              <Flame size={28} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white dark:text-white light:text-gray-900">Flowboard</span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Welcome back</h2>
            <p className="text-neutral-500 dark:text-neutral-500 light:text-gray-600">Sign in to continue to your dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 dark:text-neutral-400 light:text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 dark:text-neutral-500 light:text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 w-full p-3.5 bg-neutral-900 dark:bg-neutral-900 light:bg-white border border-neutral-800 dark:border-neutral-800 light:border-gray-300 rounded-xl text-white dark:text-white light:text-gray-900 placeholder-neutral-600 dark:placeholder-neutral-600 light:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-400 dark:text-neutral-400 light:text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 dark:text-neutral-500 light:text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 w-full p-3.5 bg-neutral-900 dark:bg-neutral-900 light:bg-white border border-neutral-800 dark:border-neutral-800 light:border-gray-300 rounded-xl text-white dark:text-white light:text-gray-900 placeholder-neutral-600 dark:placeholder-neutral-600 light:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-neutral-400 dark:text-neutral-400 light:text-gray-700 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-neutral-800 dark:bg-neutral-800 light:bg-gray-200 border-neutral-700 dark:border-neutral-700 light:border-gray-400 text-red-600 focus:ring-red-500" />
                Remember me
              </label>
              <a href="#" className="text-red-500 hover:text-red-400 font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-xl font-semibold transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 group"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <span className="text-neutral-500 dark:text-neutral-500 light:text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
