import api from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  microsoft_id: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async getLoginUrl(): Promise<string> {
    const response = await api.get('/auth/login');
    return response.data.authUrl;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.user;
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.removeItem('authToken');
    api.post('/auth/logout').catch(() => {});
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();