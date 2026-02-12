export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
