import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { MessageSquare, Heart, Share2, Send, Trash2, Edit, ChevronLeft, Clock, ArrowUp, Bookmark, ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { MOCK_ARTICLES } from '../lib/mockData';
import { Article, Comment } from '../types';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [post, setPost] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number, name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchData();

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const fetchedPost = await dataService.getArticleDetail(Number(id));
      if (fetchedPost) {
        setPost(fetchedPost);
        // Note: Comment API not in provided doc, skipping or using empty for now
        setComments([]);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to mock for preview if API fails
      const mockPost = MOCK_ARTICLES.find(p => p.id === Number(id));
      if (mockPost) {
        setPost(mockPost);
      } else {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const time = Math.ceil(wordCount / wordsPerMinute);
    return time;
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Comment API not implement in backend yet as per doc
    alert('评论功能暂未开放');
  };

  const handleDeleteComment = async (commentId: number) => {
    // Comment API not implement in backend yet
  };

  const handleDeletePost = async () => {
    if (!id) return;
    if (window.confirm("您确定要删除这篇文章吗？操作不可撤销。")) {
      try {
        await dataService.deleteArticle(Number(id));
        navigate('/');
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('请先登录以支持作者。');
      navigate('/auth');
      return;
    }
    // Like API not in doc for current version
  };

  if (loading) return <div className="text-center py-20 font-serif text-2xl italic text-[#3B82F6]">正在为您开启精彩故事...</div>;
  if (!post) return null;

  const isAuthor = user?.id === post.authorId;
  const canManagePost = isAuthor || isAdmin;
  const isLiked = false; // Not in doc yet
  const likeCount = post.likeCount || 0;

  const categoryStyles: Record<string, { bg: string, text: string, accent: string }> = {
    '技术': { bg: 'from-blue-500/10', text: 'text-blue-600', accent: '#3B82F6' },
    '设计': { bg: 'from-purple-500/10', text: 'text-purple-600', accent: '#A855F7' },
    '生活': { bg: 'from-emerald-500/10', text: 'text-emerald-600', accent: '#10B981' },
    '音乐': { bg: 'from-rose-500/10', text: 'text-rose-600', accent: '#F43F5E' },
    '旅行': { bg: 'from-amber-500/10', text: 'text-amber-600', accent: '#F59E0B' },
  };

  const currentStyle = categoryStyles[post.categoryName || '其它'] || { bg: 'from-gray-500/10', text: 'text-gray-600', accent: '#3B82F6' };

  return (
    <div className="max-w-4xl mx-auto pb-24 relative">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-gray-100">
        <div 
          className="h-full bg-[#3B82F6] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-[240px] right-0 z-50 pointer-events-none flex justify-center">
        <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-full px-4 py-3 flex items-center gap-6 shadow-2xl pointer-events-auto transform translate-x-20 md:translate-x-30">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all group ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <Heart size={20} className={isLiked ? 'fill-red-500' : 'group-hover:fill-red-500/20'} />
            <span className="text-xs font-bold">{likeCount > 0 ? (likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount) : '点赞'}</span>
          </button>
          <div className="w-px h-4 bg-gray-100" />
          <button className="flex items-center gap-2 text-gray-500 hover:text-[#3B82F6] transition-all">
            <Share2 size={20} />
          </button>
          <div className="w-px h-4 bg-gray-100" />
          <button 
            onClick={handleScrollToTop}
            className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-all shadow-md"
            title="回到顶部"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#3B82F6] mb-8 transition-all hover:-translate-x-1 group">
        <ChevronLeft size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">返回发现文章</span>
      </Link>

      <article className="bento-card !p-0 overflow-hidden mb-8 border-t-8 shadow-2xl" style={{ borderTopColor: currentStyle.accent }}>
        <div className={`h-32 bg-gradient-to-b ${currentStyle.bg} to-transparent absolute top-0 left-0 w-full pointer-events-none`} />
        
        <div className="p-8 md:p-16 relative z-10">
          <header className="mb-12 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 bg-white border rounded-lg text-[10px] font-bold uppercase tracking-widest leading-none shadow-sm ${currentStyle.text}`}>
                  {post.categoryName || '其它'}
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-tight">
                  {post.publishedAt ? format(new Date(post.publishedAt), 'yyyy年MM月dd日') : (post.createdAt ? format(new Date(post.createdAt), 'yyyy年MM月dd日') : '刚刚')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">预计阅读时间 {calculateReadTime(post.content)} 分钟</span>
              </div>
            </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between py-6 border-y border-gray-50">
            <Link to={`/profile/${post.authorId}`} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white text-lg font-bold group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
                {(post.authorName || 'E')[0]}
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight group-hover:text-[#3B82F6] transition-colors">{post.authorName || '佚名作者'}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">作者 • 点此前往灵感空间</p>
              </div>
            </Link>
            
            {(isAuthor || isAdmin) && (
              <div className="flex gap-2">
                <Link 
                  to={`/edit/${id}`}
                  className="p-2 text-gray-300 hover:text-[#3B82F6] transition-colors"
                  title="编辑文章"
                >
                  <Edit size={20} />
                </Link>
                <button 
                  onClick={handleDeletePost}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="删除文章"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="prose prose-stone max-w-none text-[#1F2937] leading-relaxed text-lg">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-16 flex gap-2 flex-wrap">
          {post.tags.map((tag) => (
            <Link 
              key={tag.id} 
              to={`/?tag=${tag.name}`}
              className="px-3 py-1 bg-gray-50 text-gray-400 hover:text-[#3B82F6] hover:bg-[#EFF6FF] rounded-lg text-xs font-bold border border-gray-100 uppercase tracking-tighter transition-all"
            >
              #{tag.name}
            </Link>
          ))}
          </div>
        </div>
      </article>

      {/* Related Posts Section */}
      {post && (
        <section className="mt-16 space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#3B82F6] rounded-full" />
            <h3 className="text-xl font-bold tracking-tight">更多精彩内容</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {MOCK_ARTICLES.filter(p => p.id !== post.id && p.categoryName === post.categoryName).slice(0, 2).map(related => (
               <Link 
                key={related.id} 
                to={`/post/${related.id}`}
                className="bento-card group !p-5 hover:border-blue-100 transition-all"
               >
                 <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStyle.text} mb-2 block`}>{related.categoryName}</span>
                 <h4 className="font-bold text-gray-900 group-hover:text-[#3B82F6] transition-colors mb-2 line-clamp-1">{related.title}</h4>
                 <div className="flex items-center justify-between mt-4">
                   <span className="text-[10px] text-gray-400 font-bold">{related.authorName}</span>
                   <ArrowRight size={14} className="text-gray-300 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" />
                 </div>
               </Link>
             ))}
          </div>
        </section>
      )}

      <section className="mt-12 space-y-8">
        <div className="flex items-center justify-between h-8">
          <h3 className="text-2xl font-extrabold tracking-tight">精彩评论</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">{comments.length} 条评论</span>
        </div>

        <form onSubmit={handleAddComment} className="space-y-4">
          <div className="relative group bento-card !p-0 overflow-hidden ring-1 ring-gray-100 focus-within:ring-[#3B82F6] transition-all shadow-sm">
            {replyTo && (
              <div className="px-6 py-2 bg-blue-50/50 flex items-center justify-between border-b border-blue-100">
                <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">
                  正在回复 @{replyTo.name}
                </span>
                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            )}
            <textarea
              placeholder="加入讨论，发表您的见解..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-white p-6 pr-20 min-h-[120px] outline-none text-sm resize-none"
            />
            {!user && (
              <div className="px-6 pb-4 pt-1 border-t border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <input 
                  type="text" 
                  placeholder="您的昵称 (必填)" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="max-w-[150px] bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  required={!user}
                />
                <span className="text-[10px] text-gray-400 font-medium italic">您当前以访客身份评论</span>
              </div>
            )}
            <button
              type="submit"
              disabled={!newComment.trim() || (!user && !guestName.trim())}
              className="absolute right-4 bottom-4 p-4 bg-[#3B82F6] text-white rounded-2xl hover:bg-[#2563EB] transition-all disabled:opacity-30 flex items-center justify-center shadow-lg transform hover:-translate-y-0.5 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {/* Group comments into threads */}
          {comments.filter(c => !c.parentId).map((parentComment) => (
            <div key={parentComment.id} className="space-y-4">
              {/* Parent Comment */}
              <div className="bento-card !p-6 relative group border-l-4 border-l-[#3B82F6]/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                      {(parentComment.authorName || 'V')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight text-gray-900">{parentComment.authorName}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                        {parentComment.createdAt ? format(new Date(parentComment.createdAt), 'MM月dd日 HH:mm') : '刚刚'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setReplyTo({ id: parentComment.id, name: parentComment.authorName });
                        window.scrollTo({ top: document.querySelector('form')?.offsetTop ? document.querySelector('form')!.offsetTop - 100 : 0, behavior: 'smooth' });
                      }}
                      className="p-1 text-gray-400 hover:text-[#3B82F6] transition-colors"
                      title="回复"
                    >
                      <MessageSquare size={16} />
                    </button>
                    {(parentComment.authorId === user?.id || canManagePost) && (
                      <button 
                        onClick={() => handleDeleteComment(parentComment.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="删除评论"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{parentComment.content}</p>

                {/* Replies Container */}
                <div className="mt-4 space-y-3 pl-6 border-l border-gray-100">
                  {comments.filter(c => c.parentId === parentComment.id).map(reply => (
                    <div key={reply.id} className="relative py-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100">
                            {(reply.authorName || 'V')[0]}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-gray-900">{reply.authorName}</span>
                            <span className="text-[10px] text-gray-400 ml-2">
                               {reply.createdAt ? format(new Date(reply.createdAt), 'MM-dd HH:mm') : '刚刚'}
                            </span>
                          </div>
                        </div>
                        {(reply.authorId === user?.id || canManagePost) && (
                          <button 
                            onClick={() => handleDeleteComment(reply.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8 font-medium">暂时没有评论，快来抢沙发吧...</p>
          )}
        </div>
      </section>
    </div>
  );
}
