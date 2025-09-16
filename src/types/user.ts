export type UserRole = "admin" | "user";

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: string;
}