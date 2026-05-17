import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { UserRoleCode, UserStatusCode } from '../../api/enums';
import { getApiErrorMessage } from '../../api/errors';
import { dataService } from '../../services/dataService';
import { AdminUser, PageResult } from '../../types';

const ADMIN_USER_PAGE_SIZE = 20;
const EMPTY_ADMIN_USER_PAGE: PageResult<AdminUser> = {
  records: [],
  total: 0,
  page: 1,
  size: ADMIN_USER_PAGE_SIZE,
  hasNext: false,
};

export type AdminRoleFilter = '' | `${UserRoleCode}`;
export type AdminStatusFilter = '' | `${UserStatusCode}`;

interface AdminUserFilters {
  keyword: string;
  role: AdminRoleFilter;
  status: AdminStatusFilter;
}

export function useAdminUsers(currentUserId: number | undefined, enabled: boolean) {
  const [usersPage, setUsersPage] = useState<PageResult<AdminUser>>(EMPTY_ADMIN_USER_PAGE);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<AdminRoleFilter>('');
  const [status, setStatus] = useState<AdminStatusFilter>('');
  const [filters, setFilters] = useState<AdminUserFilters>({
    keyword: '',
    role: '',
    status: '',
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const page = await dataService.getAdminUsers({
        keyword: filters.keyword.trim() || undefined,
        role: filters.role === '' ? undefined : Number(filters.role),
        status: filters.status === '' ? undefined : Number(filters.status),
        page: pageNumber,
        size: ADMIN_USER_PAGE_SIZE,
      });
      setUsersPage(page);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setErrorMessage(getApiErrorMessage(error, '暂时无法加载用户列表，请稍后再试。'));
    } finally {
      setLoading(false);
    }
  }, [filters, pageNumber]);

  useEffect(() => {
    if (!enabled) return;
    fetchUsers();
  }, [enabled, fetchUsers]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters({ keyword, role, status });
    setPageNumber(1);
  };

  const resetFilters = () => {
    setKeyword('');
    setRole('');
    setStatus('');
    setFilters({
      keyword: '',
      role: '',
      status: '',
    });
    setPageNumber(1);
  };

  const toggleUserBan = async (targetUser: AdminUser) => {
    if (targetUser.id === currentUserId) {
      alert('不能封禁自己的账号。');
      return;
    }
    if (targetUser.role === 'admin') {
      alert('不能封禁管理员用户。');
      return;
    }

    const isBanned = targetUser.status === UserStatusCode.Banned;
    const reason = isBanned ? null : window.prompt('请输入封禁原因（最多 200 字）：');
    const trimmedReason = reason?.trim() || '';

    if (!isBanned && !trimmedReason) {
      return;
    }

    if (isBanned && !window.confirm(`确定要解除 ${targetUser.displayName} 的封禁吗？`)) {
      return;
    }

    setActionUserId(targetUser.id);
    try {
      if (isBanned) {
        await dataService.unbanUser(targetUser.id);
      } else {
        await dataService.banUser(targetUser.id, { reason: trimmedReason.slice(0, 200) });
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user ban state:', error);
      alert(getApiErrorMessage(error, '用户状态更新失败，请稍后重试。'));
    } finally {
      setActionUserId(null);
    }
  };

  return {
    usersPage,
    loading,
    errorMessage,
    keyword,
    setKeyword,
    role,
    setRole,
    status,
    setStatus,
    pageNumber,
    setPageNumber,
    actionUserId,
    handleSearch,
    resetFilters,
    toggleUserBan,
  };
}
