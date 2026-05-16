import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Eye, Edit3, Send, Hash, ChevronDown } from 'lucide-react';
import MarkdownRenderer from '../components/markdown/MarkdownRenderer';
import { ArticleStatusCode } from '../api/enums';
import { useCategories } from '../features/articles/useCategories';
import { usePostEditor } from '../features/articles/usePostEditor';

export default function CreatePost() {
  const { id } = useParams();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const {
    title,
    setTitle,
    content,
    setContent,
    categoryId,
    setCategoryId,
    tags,
    setTags,
    status,
    setStatus,
    isPreview,
    setIsPreview,
    loading,
    errorMessage,
    fieldErrors,
    fieldErrorVersion,
    handleSave,
  } = usePostEditor({ id, user, authLoading, isAdmin });
  const { categories, loading: categoriesLoading } = useCategories();

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

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {isPreview ? (
            <div className="bento-card !p-10 min-h-[600px]">
              <h1 className="text-4xl font-extrabold mb-8">{title || '无标题文章'}</h1>
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <div className="bento-card !p-8 space-y-6 focus-within:ring-2 focus-within:ring-[#3B82F6]/20 transition-all">
              <div
                key={`title-${fieldErrorVersion}`}
                className={`rounded-xl border border-transparent px-3 py-2 -mx-3 -my-2 ${fieldErrors.title ? 'field-error-flash' : ''}`}
              >
                <input
                  type="text"
                  placeholder="请输入文章标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? 'title-error' : undefined}
                  className="w-full text-4xl font-extrabold bg-transparent border-none focus:ring-0 outline-none placeholder:text-gray-200 tracking-tight"
                />
              </div>
              {fieldErrors.title && (
                <p id="title-error" className="-mt-3 flex items-center gap-2 text-xs font-bold text-red-600">
                  <AlertCircle size={14} />
                  标题{fieldErrors.title}
                </p>
              )}
              <div
                key={`content-${fieldErrorVersion}`}
                className={`rounded-xl border border-transparent px-3 py-2 -mx-3 ${fieldErrors.content ? 'field-error-flash' : ''}`}
              >
                <textarea
                  placeholder="在此输入正文... (支持常用 Markdown 语法)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.content)}
                  aria-describedby={fieldErrors.content ? 'content-error' : undefined}
                  className="w-full min-h-[600px] bg-transparent border-none focus:ring-0 outline-none text-lg resize-none placeholder:text-gray-200 leading-relaxed font-medium"
                />
              </div>
              {fieldErrors.content && (
                <p id="content-error" className="-mt-3 flex items-center gap-2 text-xs font-bold text-red-600">
                  <AlertCircle size={14} />
                  正文{fieldErrors.content}
                </p>
              )}
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
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  aria-invalid={Boolean(fieldErrors.categoryId)}
                  aria-describedby={fieldErrors.categoryId ? 'category-error' : undefined}
                  className={`w-full appearance-none bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 outline-none cursor-pointer ${fieldErrors.categoryId ? 'border-red-200 focus:ring-red-200 text-red-700' : 'border-gray-100 focus:ring-[#3B82F6]'}`}
                  disabled={categoriesLoading}
                >
                  <option value="" disabled>{categoriesLoading ? '正在加载分类...' : '请选择分类'}</option>
                  {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
              {fieldErrors.categoryId && (
                <p id="category-error" className="flex items-center gap-1.5 text-[11px] font-bold text-red-600">
                  <AlertCircle size={13} />
                  {fieldErrors.categoryId}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">标签</label>
              <input
                type="text"
                placeholder="代码, 生活, 指南..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                aria-invalid={Boolean(fieldErrors.tagNames || fieldErrors.tags)}
                aria-describedby={fieldErrors.tagNames || fieldErrors.tags ? 'tags-error' : undefined}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 outline-none ${fieldErrors.tagNames || fieldErrors.tags ? 'border-red-200 focus:ring-red-200 text-red-700' : 'border-gray-100 focus:ring-[#3B82F6]'}`}
              />
              {(fieldErrors.tagNames || fieldErrors.tags) && (
                <p id="tags-error" className="flex items-center gap-1.5 text-[11px] font-bold text-red-600">
                  <AlertCircle size={13} />
                  {fieldErrors.tagNames || fieldErrors.tags}
                </p>
              )}
              <p className="text-[10px] text-gray-400 italic font-medium px-1">多个标签请用英文逗号隔开</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">发布状态</label>
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setStatus(ArticleStatusCode.Published)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === ArticleStatusCode.Published ? 'bg-white shadow-sm text-[#3B82F6]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  公开
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(ArticleStatusCode.Draft)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === ArticleStatusCode.Draft ? 'bg-white shadow-sm text-[#3B82F6]' : 'text-gray-400 hover:text-gray-600'}`}
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
