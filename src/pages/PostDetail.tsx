import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { MessageSquare, Heart, Share2, Send, Trash2, Edit, ChevronLeft, Clock, ArrowUp, ArrowRight } from 'lucide-react';
import MarkdownRenderer from '../components/markdown/MarkdownRenderer';
import { dataService } from '../services/dataService';
import { calculateReadTime } from '../features/articles/article.utils';
import { useArticleDetail } from '../features/articles/useArticleDetail';
import { getApiErrorMessage } from '../api/errors';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const {
    post,
    setPost,
    comments,
    relatedPosts,
    loading,
    notFound,
    commentErrorMessage,
    loadingReplyRootIds,
    expandedReplyRootIds,
    loadCommentReplies,
    refetch,
  } = useArticleDetail(id);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number, name: string } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentActionError, setCommentActionError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    if (!user) {
      alert('请先登录后再参与评论。');
      navigate('/auth');
      return;
    }

    const content = newComment.trim();
    if (!content) return;
    if (content.length > 150) {
      setCommentActionError('评论内容不能超过 150 个字符。');
      return;
    }

    setSubmittingComment(true);
    setCommentActionError(null);
    try {
      if (replyTo) {
        await dataService.replyComment(replyTo.id, { content });
      } else {
        await dataService.createComment(post.id, { content });
      }
      setNewComment('');
      setReplyTo(null);
      await refetch();
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentActionError(getApiErrorMessage(error, '评论发布失败，请稍后再试。'));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId?: number) => {
    if (!commentId) return;
    if (!user) {
      alert('请先登录。');
      navigate('/auth');
      return;
    }
    if (!window.confirm('确定要删除这条评论吗？')) return;

    setCommentActionError(null);
    try {
      await dataService.deleteComment(commentId);
      await refetch();
    } catch (error) {
      console.error('Error deleting comment:', error);
      setCommentActionError(getApiErrorMessage(error, '评论删除失败，请稍后再试。'));
    }
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

    if (!post) return;
    const previous = post;
    const nextLiked = !post.liked;
    setPost({
      ...post,
      liked: nextLiked,
      likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
    });

    try {
      if (nextLiked) {
        await dataService.likeArticle(post.id);
      } else {
        await dataService.unlikeArticle(post.id);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      setPost(previous);
      alert(getApiErrorMessage(error, '点赞操作失败，请稍后再试。'));
    }
  };

  if (loading) return <div className="text-center py-20 font-serif text-2xl italic text-[#3B82F6]">正在为您开启精彩故事...</div>;
  if (notFound) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 font-medium mb-4">文章不存在，或当前接口暂时无法获取这篇文章。</p>
        <Link to="/" className="text-sm font-bold text-[#3B82F6] hover:underline underline-offset-4">
          返回发现文章
        </Link>
      </div>
    );
  }
  if (!post) return null;

  const isAuthor = user?.id === post.authorId;
  const isLiked = post.liked;
  const likeCount = post.likeCount || 0;
  const rootComments = comments.filter(c => !c.parentId);
  const getRepliesForRoot = (rootCommentId: number) => comments.filter((comment) => (
    comment.rootId === rootCommentId || comment.parentId === rootCommentId
  ));

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

        <MarkdownRenderer content={post.content} />

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
      {relatedPosts.length > 0 && (
        <section className="mt-16 space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#3B82F6] rounded-full" />
            <h3 className="text-xl font-bold tracking-tight">更多精彩内容</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {relatedPosts.map(related => (
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
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">{post.commentCount || comments.length} 条评论</span>
        </div>

        {(commentErrorMessage || commentActionError) && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {commentActionError || commentErrorMessage}
          </div>
        )}

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
              placeholder={user ? '加入讨论，发表您的见解...' : '登录后即可加入讨论...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={150}
              className="w-full bg-white p-6 pr-20 min-h-[120px] outline-none text-sm resize-none"
            />
            {!user && (
              <div className="px-6 pb-4 pt-1 border-t border-gray-50 flex items-center justify-between gap-3 bg-gray-50/30">
                <span className="text-[10px] text-gray-400 font-medium italic">评论和回复需要登录后操作</span>
                <button type="button" onClick={() => navigate('/auth')} className="text-[10px] font-bold text-[#3B82F6] hover:underline">
                  去登录
                </button>
              </div>
            )}
            <span className="absolute left-6 bottom-5 text-[10px] font-bold text-gray-300">
              {newComment.trim().length}/150
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="absolute right-4 bottom-4 p-4 bg-[#3B82F6] text-white rounded-2xl hover:bg-[#2563EB] transition-all disabled:opacity-30 flex items-center justify-center shadow-lg transform hover:-translate-y-0.5 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {/* Group comments into threads */}
          {rootComments.map((parentComment) => {
            const replies = getRepliesForRoot(parentComment.id);
            const replyCount = parentComment.replyCount ?? 0;
            const isExpanded = expandedReplyRootIds.has(parentComment.id);
            const isLoadingReplies = loadingReplyRootIds.has(parentComment.id);
            const shouldShowExpandReplies = replyCount > 3 && !isExpanded && replies.length < replyCount;
            const hasReplyPanel = replies.length > 0 || shouldShowExpandReplies;

            return (
              <div key={parentComment.id} className="space-y-4">
                {/* Parent Comment */}
                <div className="bento-card !p-6 relative group border-l-4 border-l-[#3B82F6]/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200 overflow-hidden">
                        {parentComment.authorAvatarUrl ? (
                          <img src={parentComment.authorAvatarUrl} alt={parentComment.authorName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          (parentComment.authorName || '用')[0]
                        )}
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
                      {parentComment.deletable && (
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
                  {hasReplyPanel && (
                    <div className="mt-4 space-y-3 pl-6 border-l border-gray-100">
                      {replies.map(reply => (
                        <div key={reply.id} className="relative py-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100 overflow-hidden">
                                {reply.authorAvatarUrl ? (
                                  <img src={reply.authorAvatarUrl} alt={reply.authorName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  (reply.authorName || '用')[0]
                                )}
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-gray-900">{reply.authorName}</span>
                                {reply.replyToName && (
                                  <span className="text-[10px] font-bold text-[#3B82F6] ml-1">回复 {reply.replyToName}</span>
                                )}
                                <span className="text-[10px] text-gray-400 ml-2">
                                  {reply.createdAt ? format(new Date(reply.createdAt), 'MM-dd HH:mm') : '刚刚'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setReplyTo({ id: reply.id, name: reply.authorName });
                                  window.scrollTo({ top: document.querySelector('form')?.offsetTop ? document.querySelector('form')!.offsetTop - 100 : 0, behavior: 'smooth' });
                                }}
                                className="p-1 text-gray-300 hover:text-[#3B82F6] transition-opacity"
                                title="回复"
                              >
                                <MessageSquare size={12} />
                              </button>
                              {reply.deletable && (
                                <button 
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="p-1 text-gray-300 hover:text-red-500 transition-opacity"
                                  title="删除评论"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-500 text-xs leading-relaxed">{reply.content}</p>
                        </div>
                      ))}
                      {shouldShowExpandReplies && (
                        <button
                          type="button"
                          onClick={() => loadCommentReplies(parentComment.id)}
                          disabled={isLoadingReplies}
                          className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#3B82F6] transition-all hover:bg-blue-100 disabled:opacity-50"
                        >
                          <MessageSquare size={12} />
                          {isLoadingReplies ? '正在展开...' : `展开 ${replyCount} 条回复`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {comments.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8 font-medium">暂时没有评论，快来抢沙发吧...</p>
          )}
        </div>
      </section>
    </div>
  );
}
