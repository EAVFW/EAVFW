export type UserProfile = {
    sub: string;
    role: Array<string>;
    [key: string]: any;
    isAuthenticated: true;
}

export type NotAuthorizedProfile = {
    isAuthenticated: false;
}