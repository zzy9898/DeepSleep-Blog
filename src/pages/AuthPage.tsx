import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Terminal } from 'lucide-react';
import { ApiFieldErrors, getApiErrorMessage, getApiFieldErrors } from '../api/errors';

function removeFieldError(fieldErrors: ApiFieldErrors, fields: string[]): ApiFieldErrors {
  const nextFieldErrors = { ...fieldErrors };
  fields.forEach((field) => {
    delete nextFieldErrors[field];
  });
  return nextFieldErrors;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const updateUsername = (value: string) => {
    setUsername(value);
    setError('');
    setFieldErrors((current) => removeFieldError(current, ['username']));
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setError('');
    setFieldErrors((current) => removeFieldError(current, ['password']));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        await login({ username, password });
      } else {
        await register({ username, password });
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, '操作失败'));
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
        <div className="relative">
          <User className="absolute left-4 top-6 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => updateUsername(e.target.value)}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:bg-white outline-none transition-all text-sm ${fieldErrors.username ? 'border-red-200 focus:ring-red-200 text-red-700' : 'border-gray-100 focus:ring-[#3B82F6]'}`}
            required
          />
          {fieldErrors.username && (
            <p id="username-error" className="mt-2 text-[11px] font-bold text-red-600">
              {fieldErrors.username}
            </p>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-6 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:bg-white outline-none transition-all text-sm ${fieldErrors.password ? 'border-red-200 focus:ring-red-200 text-red-700' : 'border-gray-100 focus:ring-[#3B82F6]'}`}
            required
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-2 text-[11px] font-bold text-red-600">
              {fieldErrors.password}
            </p>
          )}
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
