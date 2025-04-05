// Enum for role types
export enum UserRole {
  Admin = 'admin',
  User = 'user',
}
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: UserRole;  // Using the UserRole enum here
  profile: string | null;
  desc: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
