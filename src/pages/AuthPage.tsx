import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Terminal } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ username: email, password });
      } else {
        await register({ username: email, password, displayName });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.msg || err?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bento-card border-none bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
        {/* Colorful accent line at top */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400" />
        
        <div className="text-center mb-10 pt-4">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-900">
          {isLogin ? '欢迎回来' : '加入 DeepSleep'}
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          {isLogin ? '请输入您的账号信息以继续' : '创建一个账号，在 DeepSleep Blog 表达自我'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100 uppercase tracking-tight">
          <Terminal size={14} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="显示名称"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:bg-white outline-none transition-all text-sm"
              required
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="用户名"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:bg-white outline-none transition-all text-sm"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:bg-white outline-none transition-all text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#3B82F6] text-white rounded-xl font-bold text-sm hover:bg-[#2563EB] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5 transform tracking-wide"
          disabled={loading}
        >
          {loading ? '正在处理...' : (isLogin ? '立即登录' : '注册账号')}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-gray-400 font-medium">
          {isLogin ? "还没有账号？" : "已经有账号了？"}
        </span>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 font-bold text-[#3B82F6] hover:underline underline-offset-4"
        >
          {isLogin ? '免费注册' : '立即登录'}
        </button>
      </div>
      </div>
    </div>
  );
}
