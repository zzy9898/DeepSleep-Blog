export enum UserRoleCode {
  Admin = 0,
  User = 1,
}

export enum UserStatusCode {
  Normal = 0,
  Banned = 1,
  Deleted = 2,
}

export enum GenderCode {
  Unknown = 0,
  Male = 1,
  Female = 2,
}

export enum ArticleStatusCode {
  Draft = 0,
  Published = 1,
  Hidden = 2,
}

export enum ArticleVisibilityCode {
  Public = 0,
  Private = 1,
}

export enum ArticleSortCode {
  Latest = 0,
  Hottest = 1,
}

export enum TagStatusCode {
  Normal = 0,
  Disabled = 1,
}

export enum CommentStatusCode {
  Normal = 0,
  Hidden = 1,
  Deleted = 2,
}
