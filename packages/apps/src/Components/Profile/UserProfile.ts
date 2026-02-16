export type UserProfile = {
  sub: string;
  tid?: string;
  role: Array<string>;
  [key: string]: unknown;
  isAuthenticated: true;
};

export type NotAuthorizedProfile = {
  isAuthenticated: false;
};
