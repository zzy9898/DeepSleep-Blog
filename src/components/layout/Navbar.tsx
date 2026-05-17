import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Send,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  to?: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon: Icon, label, active = false, onClick }: NavItemProps) {
  const commonClass = `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${
    active
      ? 'bg-[#3B82F6]/10 text-[#3B82F6] shadow-[0_4px_12px_rgba(59,130,246,0.1)]'
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group'
  }`;

  const iconClass = `transition-transform group-hover:scale-110 ${active ? 'text-[#3B82F6]' : 'text-gray-400 group-hover:text-gray-600'}`;

  if (to) {
    return (
      <Link to={to} className={commonClass}>
        <Icon size={18} className={iconClass} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={commonClass}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="w-[240px] h-screen bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col p-5 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] opacity-50" />
      <Link to="/" className="flex items-center gap-2 mb-10 px-2 transition-transform active:scale-95">
        <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white">
          <BookOpen size={18} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          DeepSleep Blog
        </span>
      </Link>

      <nav className="flex-1 space-y-2">
        <NavItem to="/" icon={BookOpen} label="发现文章" active={location.pathname === '/'} />
        {user && (
          <>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="个人工作台" active={location.pathname === '/dashboard'} />
            <NavItem to="/create" icon={PenSquare} label="发布文章" active={location.pathname === '/create'} />
            <NavItem to={`/profile/${user.id}`} icon={UserIcon} label="我的空间" active={location.pathname.startsWith('/profile')} />
            {isAdmin && (
              <NavItem to="/admin" icon={ShieldCheck} label="全站管理" active={location.pathname === '/admin'} />
            )}
          </>
        )}
      </nav>

      <div className="mt-auto space-y-5 pt-6 border-t border-gray-100">
        <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl p-3.5 text-white shadow-xl shadow-blue-100/50 mb-4 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-90 flex items-center gap-1">
              <Sparkles size={10} />
              灵感订阅
            </h4>
            <p className="text-[9px] leading-relaxed mb-2.5 opacity-80">
              每周五准时为您推送 DeepSleep 精选合集。
            </p>
            <div className="flex gap-1">
              <input
                type="email"
                placeholder="您的邮箱"
                className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-[10px] outline-none placeholder:text-white/40 focus:bg-white/20 transition-all font-medium"
              />
              <button type="button" className="flex-shrink-0 bg-white text-blue-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all active:scale-95">
                <Send size={11} />
              </button>
            </div>
          </div>
        </div>

        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-bold shadow-md uppercase">
                {user.displayName?.[0] || user.username?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-gray-900">{user.displayName || user.username}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{isAdmin ? '管理员' : '创作者'}</p>
              </div>
            </div>
            <NavItem onClick={handleLogout} icon={LogOut} label="退出登录" />
          </div>
        ) : (
          <NavItem to="/auth" icon={UserIcon} label="登录 / 注册" active={location.pathname === '/auth'} />
        )}
      </div>
    </aside>
  );
}
