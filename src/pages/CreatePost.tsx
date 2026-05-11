import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, Edit3, Send, X, Hash, ChevronDown } from 'lucide-react';
import { dataService } from '../services/dataService';

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

export default function CreatePost() {
  const { id } = useParams();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('技术');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<number>(1); // 1: Published, 0: Draft
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Admins are not allowed to publish articles as per previous restriction
    if (isAdmin) {
      navigate('/');
      return;
    }
    
    if (id) {
      fetchPost();
    }
  }, [id, user, isAdmin, authLoading]);

  const fetchPost = async () => {
    if (!id) return;
    try {
      const data = await dataService.getArticleDetail(Number(id));
      if (data) {
        // Only author can edit
        if (data.authorId !== user?.id && !isAdmin) {
          navigate('/');
          return;
        }
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.categoryName || '其它');
        setTags(data.tags.map(t => t.name).join(', '));
        setStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      navigate('/');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const postData = {
      title,
      content,
      categoryId: CATEGORY_MAP[category] || 1,
      tagNames: tags.split(',').map(t => t.trim()).filter(t => t),
      visibility: 0 // Public by default
    };

    try {
      if (id) {
        await dataService.updateArticle(Number(id), postData);
        navigate(`/post/${id}`);
      } else {
        if (status === 0) {
          const post = await dataService.createDraft(postData);
          navigate(`/post/${post.id}`);
        } else {
          const post = await dataService.createArticle(postData);
          navigate(`/post/${post.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("保存失败，请检查参数。");
    } finally {
      setLoading(false);
    }
  };

  const categories = ['技术', '设计', '生活', '音乐', '旅行'];

  if (authLoading) return <div className="p-20 text-center text-[#3B82F6] font-bold">正在认证身份...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{id ? '润色文章' : '写下新篇章'}</h1>
          <p className="text-sm font-medium text-gray-400">分享您的技术见解或生活感悟。</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm transition-all"
          >
            {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
            {isPreview ? '编辑' : '预览'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
          >
            <Send size={14} />
            {loading ? '保存中...' : '立即发布'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {isPreview ? (
            <div className="bento-card !p-10 min-h-[600px] prose prose-stone max-w-none">
              <h1 className="text-4xl font-extrabold mb-8">{title || '无标题文章'}</h1>
              <ReactMarkdown>{content || '*暂无内容...*'}</ReactMarkdown>
            </div>
          ) : (
            <div className="bento-card !p-8 space-y-6 focus-within:ring-2 focus-within:ring-[#3B82F6]/20 transition-all">
              <input
                type="text"
                placeholder="请输入文章标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-extrabold bg-transparent border-none focus:ring-0 outline-none placeholder:text-gray-200 tracking-tight"
              />
              <textarea
                placeholder="在此输入正文... (支持常用 Markdown 语法)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[600px] bg-transparent border-none focus:ring-0 outline-none text-lg resize-none placeholder:text-gray-200 leading-relaxed font-medium"
              />
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-1">
          <div className="bento-card space-y-6 sticky top-32">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] flex items-center gap-2 bg-blue-50 w-fit px-2 py-1 rounded">
                <Hash size={10} /> 分类
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#3B82F6] outline-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">标签</label>
              <input
                type="text"
                placeholder="代码, 生活, 指南..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#3B82F6] outline-none"
              />
              <p className="text-[10px] text-gray-400 italic font-medium px-1">多个标签请用英文逗号隔开</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">发布状态</label>
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setStatus(1)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === 1 ? 'bg-white shadow-sm text-[#3B82F6]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  公开
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(0)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === 0 ? 'bg-white shadow-sm text-[#3B82F6]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  草稿
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
