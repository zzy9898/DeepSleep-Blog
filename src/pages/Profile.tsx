import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, Calendar, Heart, Eye, ArrowRight, Sparkles, ShieldCheck, Search, ChevronDown } from 'lucide-react';
import { getApiErrorMessage } from '../api/errors';
import { useCategories } from '../features/articles/useCategories';
import { dataService } from '../services/dataService';
import { Article, UserProfile } from '../types';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

function getArticleStatusMeta(status: number) {
  if (status === 0) {
    return {
      label: '草稿',
      className: 'bg-amber-50/95 text-amber-700 border-amber-100',
    };
  }

  if (status === 2) {
    return {
      label: '隐藏',
      className: 'bg-gray-900/90 text-white border-gray-700',
    };
  }

  return {
    label: '已发布',
    className: 'bg-emerald-50/95 text-emerald-700 border-emerald-100',
  };
}

export default function Profile() {
  const { uid } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articleErrorMessage, setArticleErrorMessage] = useState<string | null>(null);
  const [bannerPreviewOpen, setBannerPreviewOpen] = useState(false);
  const [sort, setSort] = useState<0 | 1>(0);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const isOwnProfile = user?.id === Number(uid);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (uid) {
      fetchProfileData();
    }
  }, [authLoading, uid]);

  useEffect(() => {
    if (authLoading || !uid) {
      return;
    }
    fetchProfileArticles();
  }, [authLoading, uid, user?.id, sort, keyword, categoryId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(keywordInput);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  const fetchProfileData = async () => {
    if (!uid) return;
    try {
      const fetchedProfile = await dataService.getProfile(Number(uid));
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileArticles = async () => {
    if (!uid) return;

    setArticlesLoading(true);
    setArticleErrorMessage(null);

    const articleParams = {
      sort,
      keyword: keyword.trim() || undefined,
      categoryId: categoryId ?? undefined,
    };

    try {
      const fetchedPosts = isOwnProfile
        ? await dataService.getAllMyArticles(articleParams)
        : await dataService.getAllArticles({ ...articleParams, authorId: Number(uid) });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching profile articles:', error);
      setPosts([]);
      setArticleErrorMessage(getApiErrorMessage(error, '暂时无法加载文章列表，请稍后再试。'));
    } finally {
      setArticlesLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-serif text-2xl italic text-[#3B82F6]">正在为您开启 TA 的故事空间...</div>;
  if (!profile) return <div className="text-center py-20">用户不存在</div>;

  // Administrators do not have their own "blog interface"
  if (profile.role === 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={48} className="text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">系统管理员身份</h1>
        <p className="text-gray-400 max-w-sm mb-8">该账户仅用于平台维护与内容治理，不设个人博文空间。</p>
        <Link to="/" className="text-sm font-bold text-[#3B82F6] hover:underline uppercase tracking-widest">返回发现文章</Link>
      </div>
    );
  }

  const theme = {
    accentColor: '#3B82F6',
    backgroundType: 'gradient',
    fontFamily: 'sans',
    cardStyle: 'minimal'
  };

  // Dynamic Styles Based on Theme
  const getBackgroundStyles = () => {
    switch (theme.backgroundType) {
      case 'mesh':
        return {
          background: `radial-gradient(at 0% 0%, ${theme.accentColor}33 0, transparent 50%), radial-gradient(at 50% 0%, ${theme.accentColor}22 0, transparent 50%), radial-gradient(at 100% 0%, ${theme.accentColor}33 0, transparent 50%)`,
          backgroundColor: '#F8FAFC'
        };
      case 'gradient':
        return {
          background: `linear-gradient(to bottom, ${theme.accentColor}11, #FFFFFF)`,
          backgroundColor: '#FFFFFF'
        };
      default:
        return { backgroundColor: '#F8FAFC' };
    }
  };

  const getCardClasses = () => {
    switch (theme.cardStyle) {
      case 'glass':
        return 'backdrop-blur-md bg-white/70 border border-white/20 shadow-xl';
      case 'brutal':
        return 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
      default:
        return 'bg-white border border-gray-100 shadow-sm';
    }
  };

  const footerLineEffect = theme.cardStyle === 'brutal' ? 'border-t-2 border-black' : 'border-t border-gray-50';
  const bannerImageUrl = profile.bannerUrl || `https://picsum.photos/seed/${profile.id}/1200/400`;

  return (
    <div 
      className={`min-h-screen pb-20 px-4 pt-8 transition-all duration-700 ${theme.fontFamily === 'serif' ? 'font-serif' : theme.fontFamily === 'mono' ? 'font-mono' : 'font-sans'}`}
      style={getBackgroundStyles()}
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl mb-12 ${getCardClasses()} overflow-visible bg-white`}
        >
          {/* Banner */}
          <div className="h-56 md:h-72 relative z-0">
            <button
              type="button"
              onClick={() => setBannerPreviewOpen(true)}
              className="group absolute inset-0 w-full overflow-visible rounded-t-3xl text-left focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/30"
              aria-label="查看背景大图"
            >
              <span className="absolute inset-0 overflow-hidden rounded-t-3xl transition-all duration-500 ease-out group-hover:-inset-5 group-hover:rounded-3xl group-hover:shadow-2xl">
                <img 
                  src={bannerImageUrl} 
                  alt={`${profile.displayName} 的背景图`} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/10" />
              </span>
            </button>
          </div>
          
          {/* Info Section */}
          <div className="p-8 md:p-10 relative z-10 bg-white rounded-b-3xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="-mt-24 md:-mt-28 relative">
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg ${theme.cardStyle === 'brutal' ? 'border-black' : ''}`}>
                  <img 
                    src={profile.avatarUrl || `https://picsum.photos/seed/${profile.id}/200/200`} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-4 justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: theme.accentColor }}>
                      {profile.displayName}
                    </h1>
                    <p className="text-gray-500 font-medium">@{profile.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <span 
                      className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-sm"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {/* Since we already checked for 'admin' earlier, this role is guaranteed to be 'user' here */}
                      创作者
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 max-w-2xl leading-relaxed italic">
                  “{profile.bio || '在这个数字世界里，我还在寻找属于我的文字定义。'}”
                </p>

                <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {profile.createdAt ? format(new Date(profile.createdAt), 'yyyy年MM月加入') : '新成员'}</span>
                  <span className="flex items-center gap-1.5"><Eye size={14} /> {posts.reduce((acc, p) => acc + (p.viewCount || 0), 0)} 阅读</span>
                  <span className="flex items-center gap-1.5"><Heart size={14} /> {posts.reduce((acc, p) => acc + (p.likeCount || 0), 0)} 赞同</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {bannerPreviewOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="背景大图预览"
            onClick={() => setBannerPreviewOpen(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/25"
              onClick={() => setBannerPreviewOpen(false)}
            >
              关闭
            </button>
            <img
              src={bannerImageUrl}
              alt={`${profile.displayName} 的背景大图`}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}

        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="搜索文章关键词"
                className="w-full rounded-2xl border border-gray-100 bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-gray-700 shadow-sm outline-none transition-all placeholder:text-gray-300 focus:border-blue-100 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="relative sm:w-52">
              <select
                value={categoryId ?? ''}
                onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : null)}
                disabled={categoriesLoading}
                className="w-full appearance-none rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 pr-10 text-sm font-bold text-gray-600 shadow-sm outline-none transition-all focus:border-blue-100 focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
              >
                <option value="">全部分类</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          </div>

          <div className="relative grid w-40 grid-cols-2 rounded-2xl border border-gray-100 bg-white/80 p-1 shadow-sm">
            <span
              className={`absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-xl bg-[#3B82F6] shadow-md shadow-blue-100 transition-transform duration-200 ease-out ${
                sort === 1 ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {[
              { label: '最新', value: 0 as const },
              { label: '最热', value: 1 as const },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSort(option.value)}
                className={`relative z-10 rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                  sort === option.value
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {articleErrorMessage && (
          <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{articleErrorMessage}</span>
          </div>
        )}

        {articlesLoading && (
          <div className="mb-6 rounded-2xl border border-blue-50 bg-blue-50/60 px-4 py-3 text-center text-sm font-bold text-[#3B82F6]">
            正在刷新文章列表...
          </div>
        )}

        {/* Content Section - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => {
            const statusMeta = getArticleStatusMeta(post.status);

            return (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`group overflow-hidden rounded-2xl transition-all duration-300 transform hover:-translate-y-2 ${getCardClasses()}`}
            >
              <Link to={`/post/${post.id}`}>
                {/* Post Cover */}
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={post.coverKey || `https://picsum.photos/seed/${post.id}/600/400`} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#3B82F6] rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      {post.categoryName || '其它'}
                    </span>
                  </div>
                  {isOwnProfile && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 backdrop-blur-sm rounded-lg border text-[10px] font-bold uppercase tracking-widest shadow-sm ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Post Body */}
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-bold leading-snug group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-3">
                    {post.content.substring(0, 100)}...
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag.id} className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">#{tag.name}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className={`pt-4 flex items-center justify-between ${footerLineEffect}`}>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Heart size={10} /> {post.likeCount || 0}</span>
                      <span className="flex items-center gap-1"><Eye size={10} /> {post.viewCount || 0}</span>
                    </div>
                    <span className="text-gray-300 group-hover:text-[#3B82F6] transition-colors">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
            );
          })}

          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-medium">
              <Sparkles className="mx-auto mb-4 opacity-20" size={48} />
              <p>{articleErrorMessage ? '文章列表暂时没有可展示的内容。' : 'TA 还在筹备第一篇惊艳之作...'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
