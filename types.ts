export interface User {
  id: number;
  facebook_id: string;
  name: string;
  email?: string;
  picture: string;
  created_at: string;
  role: 'admin' | 'convenor' | 'member';
}