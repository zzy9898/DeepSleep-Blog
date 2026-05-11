import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Tag, Calendar, User, ChevronRight, Loader2, Sparkles, ArrowRight, Heart, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { Article } from '../types';

const CATEGORY_MAP: Record<string, number> = {
  '技术': 1,
  '设计': 2,
  '生活': 3,
  '音乐': 4,
  '旅行': 5
};

const REVERSE_CATEGORY_MAP: Record<number, string> = {
  1: '技术',
  2: '设计',
  3: '生活',
  4: '音乐',
  5: '旅行'
};

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleLike = async (e: React.MouseEvent, post: Article) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('请先登录以支持作者。');
      navigate('/auth');
      return;
    }
    // Note: Like API not explicitly shown in provided doc for individual toggle,
    // usually handled via separate interactions or updateArticle if owner.
    // For now, we simulate or skip as per doc limits.
  };

  const categories = ['技术', '设计', '生活', '音乐', '旅行'];
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);

  const quotes = [
    { text: "在这个充满噪音的世界，每个人都需要一方安静的角落。", author: "DeepSleep 灵感集" },
    { text: "写作不是为了被看见，而是为了整理那些无处安置的思绪。", author: "DeepSleep 创作者" },
    { text: "保持好奇，让每一个灵感的火花都值得被记录。", author: "DeepSleep 开发者" },
    { text: "深度睡眠带来梦境，深度写作带来清醒。", author: "DeepSleep 哲学" }
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const handleFeelingLucky = () => {
    if (filteredPosts.length > 0) {
      const randomPost = filteredPosts[Math.floor(Math.random() * filteredPosts.length)];
      navigate(`/post/${randomPost.id}`);
    }
  };
  const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
    '技术': { bg: 'bg-blue-50/50', text: 'text-blue-600', border: 'border-blue-100' },
    '设计': { bg: 'bg-purple-50/50', text: 'text-purple-600', border: 'border-purple-100' },
    '生活': { bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100' },
    '音乐': { bg: 'bg-rose-50/50', text: 'text-rose-600', border: 'border-rose-100' },
    '旅行': { bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100' },
  };

  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSearchTerm(`#${tagParam}`);
    }
    fetchPosts(true);
  }, [activeCategory, searchParams]);

  const fetchPosts = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const categoryId = activeCategory ? CATEGORY_MAP[activeCategory] : undefined;
      const res = await dataService.getArticles({
        cursor: isInitial ? undefined : (nextCursor || undefined),
        size: POSTS_PER_PAGE,
        categoryId,
        keyword: searchTerm || undefined
      });
      
      setHasMore(res.hasMore);
      setNextCursor(res.nextCursor);
      if (isInitial) {
        setPosts(res.items);
      } else {
        setPosts(prev => [...prev, ...res.items]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filteredPosts = posts; // Server side filtering preferred now

  return (
    <div className="space-y-12">
      {/* Hero Section - Redesigned to be more compact and elegant */}
      <section className="text-center space-y-6 py-10 md:py-16 bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-40 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-[100px]" />
        </div>
        
        <div className="space-y-4 relative z-10 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/50 text-[#3B82F6] rounded-full text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} />
            {user ? '欢迎回来，记录此时此刻' : '探索灵感的交汇地'}
          </div>
          <h1 className="font-serif text-[45px] leading-[75px] font-bold tracking-tight text-gray-900">
            在文字间寻找共鸣，让灵感在此汇流
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-base md:text-lg leading-relaxed font-medium">
            {user 
              ? `你好，${user.displayName || '创作者'}。今天准备分享什么样的独特见解？`
              : 'DeepSleep 是一个捕捉瞬间、分享思考并与全球好奇心连接的数字花园。'}
          </p>
        </div>

        {/* Daily Inspiration Widget */}
        <div className="max-w-md mx-auto relative px-6 z-10">
          <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
               <Sparkles size={24} className="text-[#3B82F6]" />
            </div>
            <p className="text-sm italic text-gray-600 font-serif leading-relaxed mb-2">
              「 {quote.text} 」
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">— {quote.author}</span>
              <button 
                onClick={handleFeelingLucky}
                className="text-[10px] font-bold text-[#3B82F6] hover:underline flex items-center gap-1"
              >
                手气不错，随便看看 <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2">
          {user ? (
            <>
              {isAdmin ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-[#3B82F6] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
                >
                  进入管理系统
                  <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/create"
                    className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
                  >
                    开始创作
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-6 py-3 bg-white border border-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all"
                  >
                    前往工作台
                  </Link>
                  <Link
                    to={`/profile/${user.id}`}
                    className="px-6 py-3 bg-white border border-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    我的界面
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-lg shadow-gray-100 hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
              >
                立即加入
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/auth"
                className="px-6 py-3 bg-white border border-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all"
              >
                登录账号
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Search & Filters - Refined for better alignment with redesigned Hero */}
      <div className="flex flex-col md:flex-row gap-4 sticky top-[32px] bg-[#fafafa]/80 backdrop-blur-md py-4 z-40 px-2 transition-all">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3B82F6] transition-colors" size={18} />
          <input
            type="text"
            placeholder="搜索灵感、标签、作者..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.01)] focus:shadow-lg focus:border-blue-100 transition-all outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${!activeCategory ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 hover:text-gray-600 border-gray-100 hover:border-gray-200'}`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                activeCategory === cat 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                  : `bg-white ${categoryColors[cat]?.text || 'text-gray-400'} border-gray-100 hover:border-gray-200`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-white rounded-[24px] border border-gray-100 shadow-sm" />
          ))}
        </div>
      ) : (
        <>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post, index) => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`}
                  className={`group bento-card flex flex-col relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                    index === 0 && !searchTerm && !activeCategory ? 'md:col-span-2' : ''
                  }`}
                  style={{
                    borderLeft: `4px solid ${
                      post.categoryName === '技术' ? '#3B82F6' : 
                      post.categoryName === '设计' ? '#A855F7' : 
                      post.categoryName === '生活' ? '#10B981' : 
                      post.categoryName === '音乐' ? '#F43F5E' : 
                      post.categoryName === '旅行' ? '#F59E0B' : '#E5E7EB'
                    }`
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                       categoryColors[post.categoryName || '其它']?.bg || 'bg-gray-50'
                    } ${
                       categoryColors[post.categoryName || '其它']?.text || 'text-gray-500'
                    } ${
                       categoryColors[post.categoryName || '其它']?.border || 'border-gray-100'
                    }`}>
                      {post.categoryName || '其它'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {post.publishedAt ? format(new Date(post.publishedAt), 'yyyy年MM月dd日') : '刚刚'}
                    </span>
                  </div>

                  <h2 className={`font-serif font-bold mb-4 leading-tight group-hover:text-[#3B82F6] transition-colors ${index === 0 && !searchTerm && !activeCategory ? 'text-4xl' : 'text-2xl'}`}>
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-500 line-clamp-3 mb-6 text-sm leading-relaxed flex-1">
                    {post.content.replace(/[#*`]/g, '').slice(0, 160)}...
                  </p>

                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 relative z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/profile/${post.authorId}`); }}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                        {(post.authorName || 'E')[0]}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 hover:text-[#3B82F6] transition-colors">{post.authorName || '佚名作者'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => handleLike(e, post)}
                        className="flex items-center gap-1.5 transition-all relative z-10 text-gray-400 font-medium hover:text-red-400"
                      >
                        <Heart size={16} />
                        <span className="text-[11px]">{post.likeCount || 0}</span>
                      </button>
                      <ChevronRight className="text-gray-300 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bento-card border-dashed bg-white/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-500 font-medium">未找到符合您搜索条件的文章。</p>
              <button 
                onClick={() => {setSearchTerm(''); setActiveCategory(null); setSearchParams({});}} 
                className="mt-4 text-sm font-bold text-[#3B82F6] hover:underline underline-offset-4"
              >
                清除所有过滤条件
              </button>
            </div>
          )}

          {hasMore && !searchTerm && (
            <div className="flex justify-center mt-12 pb-12">
              <button
                onClick={() => fetchPosts(false)}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50 group"
              >
                {loadingMore ? (
                  <Loader2 className="animate-spin text-[#3B82F6]" size={18} />
                ) : (
                  <span className="group-hover:text-[#3B82F6]">加载更多文章</span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
