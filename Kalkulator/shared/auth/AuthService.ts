/**
 * Сервис аутентификации
 */
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  /**
   * Получение экземпляра сервиса
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Регистрация пользователя
   */
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка регистрации',
        };
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка сети',
      };
    }
  }

  /**
   * Вход пользователя
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const base = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || '';
      const response = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка входа',
        };
      }

      this.setUser(data.user, data.token, data.refreshToken);
      return {
        success: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка сети',
      };
    }
  }

  /**
   * Вход как гость
   */
  async guestLogin(): Promise<AuthResult> {
    try {
      const base = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || '';
      const response = await fetch(`${base}/api/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка гостевого входа',
        };
      }

      if (data.user && data.token) {
        this.setUser(data.user, data.token, data.refreshToken || '');
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка сети',
      };
    }
  }

  /**
   * Выход пользователя
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        const base = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || '';
        await fetch(`${base}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      this.clearUser();
    }
  }

  /**
   * Обновление токена
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const base = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || '';
      const response = await fetch(`${base}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setUser(this.currentUser, data.token, this.refreshToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Восстановление пароля
   */
  async forgotPassword(email: string): Promise<AuthResult> {
    try {
      const base = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || '';
      const response = await fetch(`${base}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка восстановления пароля',
        };
      }

      return {
        success: true,
        message: 'Инструкции отправлены на email',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка сети',
      };
    }
  }

  /**
   * Сброс пароля
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      const base = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || '';
      const response = await fetch(`${base}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка сброса пароля',
        };
      }

      return {
        success: true,
        message: 'Пароль успешно изменен',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка сети',
      };
    }
  }

  /**
   * OAuth вход
   */
  async oauthLogin(provider: 'google' | 'facebook' | 'apple', code: string): Promise<AuthResult> {
    try {
      const base = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || '';
      const response = await fetch(`${base}/api/auth/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка OAuth входа',
        };
      }

      this.setUser(data.user, data.token, data.refreshToken);
      return {
        success: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка сети',
      };
    }
  }

  /**
   * Получение текущего пользователя
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Проверка аутентификации
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  /**
   * Получение токена
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Подписка на изменения пользователя
   */
  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Установка пользователя
   */
  private setUser(user: User, token: string, refreshToken: string): void {
    this.currentUser = user;
    this.token = token;
    this.refreshToken = refreshToken;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Очистка пользователя
   */
  private clearUser(): void {
    this.currentUser = null;
    this.token = null;
    this.refreshToken = null;
    this.clearStorage();
    this.notifyListeners();
  }

  /**
   * Уведомление слушателей
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  /**
   * Сохранение в локальное хранилище
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      localStorage.setItem('auth_token', this.token || '');
      localStorage.setItem('auth_refresh_token', this.refreshToken || '');
    }
  }

  /**
   * Загрузка из локального хранилища
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('auth_refresh_token');

      if (userStr && token) {
        try {
          this.currentUser = JSON.parse(userStr);
          this.token = token;
          this.refreshToken = refreshToken;
        } catch (error) {
          this.clearStorage();
        }
      }
    }
  }

  /**
   * Очистка локального хранилища
   */
  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
    }
  }
}

/**
 * Результат аутентификации
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
}

/**
 * Хук для аутентификации
 */
export function useAuth() {
  const authService = AuthService.getInstance();
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe(setUser);
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const result = await authService.register(email, password, name);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: authService.isAuthenticated(),
    login,
    register,
    logout,
    loading,
  };
}
