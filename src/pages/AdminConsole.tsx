import { useState } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  Ban,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  MessageSquare,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { UserRoleCode, UserStatusCode } from '../api/enums';
import { getApiErrorMessage } from '../api/errors';
import { useAdminOverview } from '../features/admin/useAdminOverview';
import { useAdminUsers, type AdminRoleFilter, type AdminStatusFilter } from '../features/admin/useAdminUsers';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { SystemSettings } from '../types';

type AdminSubTab = 'overview' | 'users' | 'comments' | 'settings';

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  siteName: 'DeepSleep Blog',
  siteSubtitle: '探索数字艺术与极简生活',
  allowRegistration: true,
  commentReviewRequired: false,
  postsPerPage: 10,
  sensitiveWords: [],
};

function getAdminUserStatusLabel(status: number) {
  if (status === UserStatusCode.Normal) return '正常';
  if (status === UserStatusCode.Banned) return '已封禁';
  if (status === UserStatusCode.Deleted) return '已删除';
  return '未知状态';
}

function getAdminUserStatusClass(status: number) {
  if (status === UserStatusCode.Normal) return 'bg-green-50 text-green-600 border-green-100';
  if (status === UserStatusCode.Banned) return 'bg-red-50 text-red-600 border-red-100';
  if (status === UserStatusCode.Deleted) return 'bg-gray-100 text-gray-500 border-gray-200';
  return 'bg-amber-50 text-amber-600 border-amber-100';
}

function formatOptionalDateTime(value: string | null) {
  if (!value) return '暂无';
  return format(new Date(value), 'yyyy-MM-dd HH:mm');
}

export default function AdminConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminSubTab>('overview');
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const {
    overview,
    categoryData,
    loading: overviewLoading,
    errorMessage: overviewErrorMessage,
  } = useAdminOverview();
  const {
    usersPage,
    loading: usersLoading,
    errorMessage: usersErrorMessage,
    keyword,
    setKeyword,
    role,
    setRole,
    status,
    setStatus,
    setPageNumber,
    actionUserId,
    handleSearch,
    resetFilters,
    toggleUserBan,
  } = useAdminUsers(user?.id, activeTab === 'users');

  const handleUpdateSettings = async () => {
    setSavingSettings(true);
    try {
      await dataService.updateSettings(systemSettings);
      alert('系统设置已保存');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(getApiErrorMessage(error, '系统设置保存失败，请稍后重试。'));
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">全站管理系统</h1>
          <p className="text-gray-400 text-sm font-medium">用于站点概览、用户管理和内容治理。</p>
        </div>
      </header>

      <div className="flex flex-wrap bg-gray-100/50 p-1 rounded-2xl w-fit">
        {[
          { id: 'overview', label: '总览', icon: BarChart3 },
          { id: 'users', label: '用户管理', icon: Users },
          { id: 'comments', label: '评论治理', icon: MessageSquare },
          { id: 'settings', label: '全局配置', icon: Settings },
        ].map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setActiveTab(sub.id as AdminSubTab)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold transition-all ${activeTab === sub.id ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <sub.icon size={12} /> {sub.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {overviewErrorMessage && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{overviewErrorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bento-card bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <Users size={24} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">用户总数</h4>
                <p className="text-2xl font-extrabold">{overview?.userCount ?? 0}</p>
              </div>
            </div>
            <div className="bento-card bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">文章总数</h4>
                <p className="text-2xl font-extrabold">{overview?.articleCount ?? 0}</p>
              </div>
            </div>
            <div className="bento-card bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">今日新增</h4>
                <p className="text-2xl font-extrabold">{(overview?.todayNewUsers ?? 0) + (overview?.todayNewArticles ?? 0)}</p>
              </div>
            </div>
            <div className="bento-card bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <Ban size={24} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">屏蔽文章</h4>
                <p className="text-2xl font-extrabold">{overview?.blockedArticleCount ?? 0}</p>
              </div>
            </div>
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {categoryData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#A855F7', '#10B981', '#F43F5E', '#F59E0B'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {overviewLoading && <p className="mt-4 text-xs font-bold text-purple-500">正在加载全站概览...</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bento-card !p-0 overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-gray-100 space-y-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">全站用户清单</h2>
              <p className="text-xs text-gray-400">支持按用户名、昵称、角色和状态查询，列表按创建时间倒序展示。</p>
            </div>
            <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-[1fr_150px_150px_auto] gap-3">
              <label className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜索用户名或昵称"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-purple-300"
                />
              </label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRoleFilter)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-purple-300"
              >
                <option value="">全部角色</option>
                <option value={`${UserRoleCode.Admin}`}>管理员</option>
                <option value={`${UserRoleCode.User}`}>普通用户</option>
              </select>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as AdminStatusFilter)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-purple-300"
              >
                <option value="">未删除用户</option>
                <option value={`${UserStatusCode.Normal}`}>正常</option>
                <option value={`${UserStatusCode.Banned}`}>已封禁</option>
                <option value={`${UserStatusCode.Deleted}`}>已删除</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors">
                  查询
                </button>
                <button type="button" onClick={resetFilters} className="px-3 py-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-600 transition-colors" title="重置筛选">
                  <RotateCcw size={14} />
                </button>
              </div>
            </form>
          </div>
          <div className="overflow-x-auto">
            {usersErrorMessage && (
              <div className="mx-6 mt-6 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{usersErrorMessage}</span>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">用户</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">角色 / 状态</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">内容数据</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">最近登录</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usersPage.records.map((managedUser) => {
                  const isCurrentUser = managedUser.id === user?.id;
                  const isAdminUser = managedUser.role === 'admin';
                  const isDeleted = managedUser.status === UserStatusCode.Deleted;
                  const isBanned = managedUser.status === UserStatusCode.Banned;
                  const actionDisabled = isCurrentUser || isAdminUser || isDeleted || actionUserId === managedUser.id;

                  return (
                    <tr key={managedUser.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center text-gray-400 font-bold">
                            {managedUser.avatarUrl ? (
                              <img src={managedUser.avatarUrl} alt={managedUser.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              (managedUser.displayName || 'U')[0]
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{managedUser.displayName}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{managedUser.username}</p>
                            <p className="text-[10px] text-gray-300 font-mono mt-0.5">ID {managedUser.id} · {formatOptionalDateTime(managedUser.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${managedUser.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {managedUser.role === 'admin' ? '管理员' : '普通用户'}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${getAdminUserStatusClass(managedUser.status)}`}>
                            {getAdminUserStatusLabel(managedUser.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                          <span>{managedUser.articleCount} 篇文章</span>
                          <span>{managedUser.commentCount} 条评论</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">{formatOptionalDateTime(managedUser.lastLoginAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleUserBan(managedUser)}
                            disabled={actionDisabled}
                            className={`p-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              isBanned ? 'text-gray-300 hover:text-green-600' : 'text-gray-300 hover:text-red-600'
                            }`}
                            title={isBanned ? '解除封禁' : '封禁用户'}
                          >
                            {actionUserId === managedUser.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : isBanned ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <Ban size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {usersPage.records.length === 0 && !usersLoading && (
              <div className="p-12 text-center text-sm text-gray-400 font-medium">没有找到符合条件的用户。</div>
            )}
            {usersLoading && <div className="p-12 text-center text-sm text-purple-500 font-bold">正在加载用户列表...</div>}
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">共 {usersPage.total} 位用户，第 {usersPage.page} 页，每页 {usersPage.size} 条</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                disabled={usersLoading || usersPage.page <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-50 text-xs font-bold text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-purple-600 transition-colors"
              >
                <ChevronLeft size={14} /> 上一页
              </button>
              <button
                type="button"
                onClick={() => setPageNumber((page) => page + 1)}
                disabled={usersLoading || !usersPage.hasNext}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-50 text-xs font-bold text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-purple-600 transition-colors"
              >
                下一页 <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="bento-card animate-in fade-in duration-300 text-center py-16">
          <MessageSquare className="mx-auto mb-4 text-gray-300" size={36} />
          <h2 className="text-lg font-bold text-gray-900 mb-2">评论治理当前暂不可用</h2>
          <p className="text-sm text-gray-400">评论列表、删除和审核相关后端接口尚未开放。</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bento-card space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold">系统设置</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">站点名称</label>
              <input
                type="text"
                value={systemSettings.siteName}
                onChange={(event) => setSystemSettings({ ...systemSettings, siteName: event.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-purple-300"
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
  );
}
