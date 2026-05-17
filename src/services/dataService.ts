import * as adminApi from '../api/admin';
import * as articlesApi from '../api/articles';
import * as authApi from '../api/auth';
import * as categoriesApi from '../api/categories';
import * as commentsApi from '../api/comments';
import * as pingApi from '../api/ping';
import * as settingsApi from '../api/settings';
import * as usersApi from '../api/users';

export const dataService = {
  ...adminApi,
  ...authApi,
  ...articlesApi,
  ...categoriesApi,
  ...pingApi,
  ...settingsApi,
  ...usersApi,
  ...commentsApi,
};
