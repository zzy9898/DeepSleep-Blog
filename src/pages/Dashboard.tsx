import { useState, useEffect, type ChangeEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, Edit, Trash2, Eye, PenTool, FileText, Settings, ShieldCheck, Loader2, ArrowRight, Sparkles, Users, BarChart3, MessageSquare, Heart } from 'lucide-react';
import { dataService } from '../services/dataService';
import { UserThemeConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboardData } from '../features/dashboard/useDashboardData';
import { notifyUnavailable } from '../features/unavailable';
import { getApiErrorMessage } from '../api/errors';

const USER_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';
const USER_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_USER_IMAGE_SIZE = 5 * 1024 * 1024;

function getUserImageValidationError(file: File) {
  if (!USER_IMAGE_TYPES.has(file.type)) {
    return '请选择 png、jpg 或 webp 格式的图片。';
  }

  if (file.size > MAX_USER_IMAGE_SIZE) {
    return '图片不能超过 5MB，请压缩或更换图片。';
  }

  return null;
}

export default function Dashboard() {
  const { user, isAdmin, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'likes' | 'system'>('content');
  const [isPetActive, setIsPetActive] = useState(() => localStorage.getItem('petVisible') !== 'false');

  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'users' | 'comments' | 'settings'>('overview');
  const [savingSettings, setSavingSettings] = useState(false);
  const {
    posts,
    setPosts,
    likedPosts,
    errorMessage,
    loading,
    allUsers,
    categoryData,
    systemSettings,
    setSystemSettings,
  } = useDashboardData(user, isAdmin, authLoading);

  // Design State
  const [nickname, setNickname] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');
  const [themeConfig] = useState<UserThemeConfig>({
    accentColor: '#3B82F6',
    backgroundType: 'gradient' as 'gradient',
    fontFamily: 'sans' as 'sans',
    cardStyle: 'minimal' as 'minimal'
  });
  const [savingDesign, setSavingDesign] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.displayName || '');
      setBio(user.bio || '');
      setBannerUrl(user.bannerUrl || '');
      setAvatarUrl(user.avatarUrl || '');
      setAvatarFile(null);
      setBackgroundImageFile(null);
      setAvatarPreviewUrl('');
      setBannerPreviewUrl('');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
    };
  }, [bannerPreviewUrl]);

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const validationError = getUserImageValidationError(file);
    if (validationError) {
      alert(validationError);
      event.target.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const handleBackgroundImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const validationError = getUserImageValidationError(file);
    if (validationError) {
      alert(validationError);
      event.target.value = '';
      return;
    }

    setBackgroundImageFile(file);
    setBannerPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveDesign = async () => {
    if (!user) return;
    setSavingDesign(true);
    try {
      await dataService.updateProfile({
        nickname,
        bio,
      });

      if (avatarFile) {
        const avatar = await dataService.updateAvatar(avatarFile);
        setAvatarUrl(avatar.avatarUrl);
      }

      if (backgroundImageFile) {
        const backgroundImage = await dataService.updateBackgroundImage(backgroundImageFile);
        setBannerUrl(backgroundImage.backgroundImageUrl);
      }

      await refreshProfile();
      alert('空间资料已保存。');
    } catch (error) {
      console.error("Error saving design:", error);
      alert(getApiErrorMessage(error, '保存失败，请稍后重试。'));
    } finally {
      setSavingDesign(false);
    }
  };

  const displayAvatarUrl = avatarPreviewUrl || avatarUrl;
  const displayBannerUrl = bannerPreviewUrl || bannerUrl;

  const handleDelete = async (postId: number) => {
    if (window.confirm("确定要删除这篇文章吗？操作不可恢复。")) {
      try {
        await dataService.deleteArticle(postId);
        setPosts(posts.filter(p => p.id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleUpdateSettings = async () => {
    setSavingSettings(true);
    try {
      await dataService.updateSettings(systemSettings);
      alert('系统设置已保存');
    } catch (error) {
      console.error("Error updating settings:", error);
      alert('系统设置保存失败，请稍后重试。');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteUser = async (uid: number) => {
    if (!isAdmin) return;
    if (uid === user?.id) {
      alert('您不能删除自己的账号。');
      return;
    }
    notifyUnavailable('用户删除功能');
  };

  const togglePet = () => {
    window.dispatchEvent(new Event('toggle-pet'));
    setIsPetActive(current => !current);
  };

  if (authLoading) return <div className="p-20 text-center text-[#3B82F6] font-bold">正在加载您的个人档案...</div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">工作台</h1>
          <p className="text-gray-400 text-sm font-medium">
            欢迎回来，<span className="text-[#3B82F6]">{user?.displayName || user?.username}</span>
          </p>
        </div>
        
        <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-white shadow-sm text-[#3B82F6]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FileText size={14} /> 内容管理
          </button>
          {!isAdmin && (
            <>
              <button 
                onClick={() => setActiveTab('design')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'design' ? 'bg-white shadow-sm text-[#3B82F6]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <PenTool size={14} /> 空间装饰
              </button>
              <button 
                onClick={() => setActiveTab('likes')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'likes' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Heart size={14} /> 我的喜欢
              </button>
            </>
          )}
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ShieldCheck size={14} /> 系统管理
            </button>
          )}
          <div className="mx-2 h-6 w-px self-center bg-gray-200" />
          <button
            type="button"
            onClick={togglePet}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isPetActive ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={isPetActive ? '隐藏桌宠' : '显示桌宠'}
          >
            <Sparkles size={14} className={isPetActive ? 'animate-pulse' : ''} />
            {isPetActive ? '桌宠已开启' : '桌宠已隐藏'}
          </button>
        </div>
      </header>

      {activeTab === 'content' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`${isAdmin ? 'md:col-span-3' : 'md:col-span-2'} bento-card flex flex-col justify-between min-h-[220px]`}>
            <div>
              <h2 className="text-lg font-bold mb-1">
                {isAdmin ? '全站内容概览' : '我的创作点滴'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isAdmin ? '全局监控 DeepSleep 的内容生态。' : '为您展示 Blog 内容的实时成就。'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-6">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {isAdmin ? '总文章数' : '我的文章'}
                </h3>
                <p className="text-3xl font-extrabold font-mono">{posts.length}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {isAdmin ? '全站阅读量' : '总阅读量'}
                </h3>
                <p className="text-3xl font-extrabold text-[#3B82F6] font-mono">
                  {posts.reduce((acc, p) => acc + (p.viewCount || 0), 0)}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">互动量</h3>
                <p className="text-3xl font-extrabold text-gray-400 font-mono">
                  {posts.reduce((acc, p) => acc + (p.commentCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          {!isAdmin && (
            <Link 
              to="/create" 
              className="bento-card bg-[#3B82F6] text-white flex flex-col items-center justify-center text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:scale-150 group-hover:rotate-45">
                <PenTool size={120} />
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <PenTool size={24} />
              </div>
              <h2 className="text-xl font-bold mb-1">发布新文章</h2>
              <p className="text-blue-100 text-sm opacity-80 mb-6">此刻即永恒</p>
              <div className="bg-white text-[#3B82F6] px-6 py-2 rounded-xl font-bold text-xs shadow-lg group-hover:shadow-xl transition-all">
                点击开始创作
              </div>
            </Link>
          )}

          <div className="md:col-span-3 bento-card overflow-hidden !p-0">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">文章管理</h2>
              <Link
                to={`/profile/${user?.id}`}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-[#3B82F6] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors"
                title="预览我的空间"
              >
                <Eye size={12} /> 预览我的空间
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {errorMessage && (
                <div className="mx-6 mt-6 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">标题</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">分类</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">状态</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/post/${post.id}`} className="font-bold text-sm text-gray-900 group-hover:text-[#3B82F6] transition-colors line-clamp-1">{post.title}</Link>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-tighter">
                          {post.publishedAt ? format(new Date(post.publishedAt), 'yyyy-MM-dd HH:mm') : '处理中'} • {post.viewCount} 阅读
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-white border border-gray-100 text-gray-400 rounded-lg text-[10px] font-bold uppercase">
                          {post.categoryName || '其它'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold uppercase tracking-tighter">
                        <span className={post.status === 1 ? 'text-green-500/80' : 'text-amber-500/80'}>
                          {post.status === 1 ? '已发布' : (post.status === 2 ? '隐藏' : '草稿')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/edit/${post.id}`} className="p-2 text-gray-300 hover:text-green-500 transition-colors"><Edit size={16} /></Link>
                          <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && !loading && (
                <div className="p-20 text-center">
                  <p className="text-gray-300 font-serif italic mb-4">暂无创作，笔尖尚在沉睡。</p>
                  <Link to="/create" className="text-sm font-bold text-[#3B82F6] hover:underline underline-offset-4 tracking-tight">开启您的第一篇 Blog <ArrowRight className="inline" size={12} /></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'likes' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bento-card">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-xl font-bold text-gray-900">收藏的灵感</h2>
                    <p className="text-xs text-gray-400 mt-1">记录那些曾让您心动或产生共鸣的文章。</p>
                 </div>
                 <div className="px-4 py-2 bg-red-50 rounded-2xl flex items-center gap-2">
                    <Heart size={16} className="text-red-500 fill-red-500" />
                    <span className="text-xs font-bold text-red-600">{likedPosts.length} 篇文章</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {likedPosts.map(article => (
                    <div key={article.id} className="p-4 border border-gray-100 rounded-2xl hover:border-red-100 transition-all group flex items-start gap-4">
                       <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 font-bold group-hover:bg-red-50 group-hover:text-red-300 transition-colors">
                          {article.title[0]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <Link to={`/post/${article.id}`} className="font-bold text-sm text-gray-900 block truncate hover:text-red-500 transition-colors">
                             {article.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{article.authorName || '佚名'}</span>
                             <span className="text-[10px] text-gray-300">•</span>
                             <span className="text-[10px] text-gray-400 uppercase tracking-widest">{article.categoryName || '其它'}</span>
                          </div>
                       </div>
                    </div>
                 ))}
                 {likedPosts.length === 0 && (
                   <div className="col-span-2 py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 scale-110 opacity-50">
                        <Heart size={32} className="text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-serif italic mb-4">还没有喜欢的文章。</p>
                      <Link to="/" className="text-xs font-bold text-[#3B82F6] uppercase tracking-widest hover:underline">去发现文章看看</Link>
                   </div>
                 )}
              </div>
           </div>
        </div>
      ) : activeTab === 'design' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bento-card space-y-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-[#3B82F6] uppercase tracking-[0.2em] border-b border-blue-100 pb-2">基础信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">昵称</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="设置你的展示名称"
                      maxLength={30}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all"
                    />
                    <p className="text-[10px] text-gray-400">
                      最多 30 个字符。留空时后端会按资料规则处理。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">个人简介</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="介绍一下你自己..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">头像图片</label>
                    <input 
                      type="file"
                      accept={USER_IMAGE_ACCEPT}
                      onChange={handleAvatarFileChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all file:mr-3 file:border-0 file:bg-[#3B82F6] file:text-white file:rounded-lg file:px-3 file:py-1.5 file:text-xs file:font-bold"
                    />
                    <p className="text-[10px] text-gray-400">
                      支持 png、jpg、webp，最大 5MB。{avatarFile ? `已选择：${avatarFile.name}` : avatarUrl ? '当前已有头像。' : '当前未设置头像。'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">背景图片</label>
                    <input 
                      type="file"
                      accept={USER_IMAGE_ACCEPT}
                      onChange={handleBackgroundImageFileChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all file:mr-3 file:border-0 file:bg-[#3B82F6] file:text-white file:rounded-lg file:px-3 file:py-1.5 file:text-xs file:font-bold"
                    />
                    <p className="text-[10px] text-gray-400">
                      支持 png、jpg、webp，最大 5MB。{backgroundImageFile ? `已选择：${backgroundImageFile.name}` : bannerUrl ? '当前已有背景图。' : '当前未设置背景图。'}
                    </p>
                  </div>
                </div>
              </section>

              <button 
                onClick={handleSaveDesign}
                disabled={savingDesign}
                className="w-full py-4 bg-[#3B82F6] text-white rounded-2xl font-extrabold text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-[#2563EB] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingDesign ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {savingDesign ? '正在保存...' : '保存空间资料'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">效果初探</h3>
            <div 
              className="group bento-card h-[320px] relative overflow-hidden transition-all duration-500"
              style={{
                background: themeConfig.backgroundType === 'mesh' ? `radial-gradient(at 0% 0%, ${themeConfig.accentColor}33 0, transparent 50%), #fff` : themeConfig.backgroundType === 'gradient' ? `linear-gradient(to bottom, ${themeConfig.accentColor}11, #fff)` : '#fff'
              }}
            >
               <div className="absolute left-0 top-0 h-40 w-full bg-cover bg-center brightness-90 shadow-inner transition-all duration-700 ease-out group-hover:h-full group-hover:brightness-75" style={{ backgroundImage: `url(${displayBannerUrl || 'https://picsum.photos/seed/curation/800/400'})` }} />
               <div className="absolute inset-0 bg-white/0 transition-colors duration-700 group-hover:bg-black/20" />
               <div className="relative pt-28 flex flex-col items-center">
                 <div className={`w-16 h-16 rounded-full border-2 border-white mb-3 shadow-md overflow-hidden ${themeConfig.cardStyle === 'brutal' ? 'border-black' : ''}`}>
                    {displayAvatarUrl ? (
                      <img src={displayAvatarUrl} alt={user?.displayName || '头像'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 font-bold">
                         {(user?.displayName || 'D')[0]}
                      </div>
                    )}
                 </div>
                 <p className="font-bold text-lg mb-1 text-[#3B82F6] transition-colors duration-500 group-hover:text-white">{user?.displayName}</p>
                 <p className="text-[10px] text-gray-400 line-clamp-1 italic px-8 text-center transition-colors duration-500 group-hover:text-white/80">{bio || '尚未编写简介...'}</p>
               </div>
               
               <div className="absolute bottom-4 left-0 w-full text-center">
                 <Link to={`/profile/${user?.id}`} target="_blank" className="text-[10px] font-bold text-[#3B82F6] hover:underline uppercase tracking-widest transition-colors duration-500 group-hover:text-white">
                   查看全尺寸动态预览
                 </Link>
               </div>
            </div>
          </div>
        </div>
      ) : isAdmin && activeTab === 'system' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
              {[
                { id: 'overview', label: '总览', icon: BarChart3 },
                { id: 'users', label: '用户管理', icon: Users },
                { id: 'comments', label: '评论治理', icon: MessageSquare },
                { id: 'settings', label: '全局配置', icon: Settings },
              ].map(sub => (
                <button 
                   key={sub.id}
                   onClick={() => setAdminSubTab(sub.id as any)}
                   className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold transition-all ${adminSubTab === sub.id ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   <sub.icon size={12} /> {sub.label}
                </button>
              ))}
           </div>

           {adminSubTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bento-card bg-white p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">活跃用户</h4>
                        <p className="text-2xl font-extrabold">{allUsers.length}</p>
                    </div>
                  </div>
                  {/* ... More overview cards ... */}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bento-card">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 size={16} className="text-[#3B82F6]" /> 内容分布分析
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} />
                            <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px'}} />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                              {categoryData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#A855F7', '#10B981', '#F43F5E', '#F59E0B'][index % 5]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
              </div>
            </div>
           )}

           {adminSubTab === 'users' && (
             <div className="bento-card !p-0 overflow-hidden animate-in fade-in duration-300">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold">全站用户清单</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">用户</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">管理操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {allUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center text-gray-400 font-bold">
                                {(u.displayName || 'U')[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{u.displayName}</p>
                                <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-300 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allUsers.length === 0 && (
                    <div className="p-12 text-center text-sm text-gray-400 font-medium">
                      用户管理列表当前暂不可用，后端接口尚未开放。
                    </div>
                  )}
                </div>
             </div>
           )}

           {adminSubTab === 'comments' && (
             <div className="bento-card animate-in fade-in duration-300 text-center py-16">
                <MessageSquare className="mx-auto mb-4 text-gray-300" size={36} />
                <h2 className="text-lg font-bold text-gray-900 mb-2">评论治理当前暂不可用</h2>
                <p className="text-sm text-gray-400">评论列表、删除和审核相关后端接口尚未开放。</p>
             </div>
           )}

           {adminSubTab === 'settings' && (
             <div className="bento-card space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold">系统设置</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">站点名称</label>
                    <input 
                      type="text" 
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none border focus:border-purple-300"
                    />
                  </div>
                  <button
                    onClick={handleUpdateSettings}
                    disabled={savingSettings}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {savingSettings ? '保存中...' : '保存设置'}
                  </button>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
