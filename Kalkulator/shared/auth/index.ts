/**
 * Экспорт системы аутентификации
 */

export * from './AuthService';

// Типы для аутентификации
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface OAuthCredentials {
  provider: 'google' | 'facebook' | 'apple';
  code: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (credentials: RegisterCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  oauthLogin: (credentials: OAuthCredentials) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (reset: PasswordReset) => Promise<AuthResult>;
  loading: boolean;
  error: string | null;
}

// Импорты для типов
import { User } from '../models/user/User';
import { useState, useEffect } from 'react';
