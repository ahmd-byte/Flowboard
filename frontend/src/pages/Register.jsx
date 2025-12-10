import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Mail, Lock, User, Loader, Flame, ArrowRight, Check } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/auth/register', { 
        name,
        email, 
        password 
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : 
                      Array.isArray(detail) ? detail[0]?.msg || 'Invalid input' : 
                      'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Unlimited boards & cards',
    'Real-time collaboration',
    'Email notifications',
    'Drag & drop interface',
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-gray-50 overflow-hidden">
      {/* Left Side - Form */}
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
            <h2 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">Create account</h2>
            <p className="text-neutral-500 dark:text-neutral-500 light:text-gray-600">Start managing your projects today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 dark:text-neutral-400 light:text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 dark:text-neutral-500 light:text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 w-full p-3.5 bg-neutral-900 dark:bg-neutral-900 light:bg-white border border-neutral-800 dark:border-neutral-800 light:border-gray-300 rounded-xl text-white dark:text-white light:text-gray-900 placeholder-neutral-600 dark:placeholder-neutral-600 light:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
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
              <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-600 light:text-gray-500">Must be at least 6 characters</p>
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
                  Create Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <span className="text-neutral-500 dark:text-neutral-500 light:text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-bl from-red-600 via-red-700 to-black p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/50 rounded-full blur-3xl" />
        
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
            Join thousands<br />
            <span className="text-white/80">of teams using</span><br />
            <span className="text-yellow-300">Flowboard.</span>
          </h1>
          
          {/* Features */}
          <div className="space-y-3 pt-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-emerald-400" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 text-white/40 text-sm">
          © 2024 Flowboard. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Register;
