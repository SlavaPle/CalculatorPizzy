/**
 * Модель пользователя
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

/**
 * Настройки пользователя
 */
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  units: UnitSystem;
  notifications: NotificationSettings;
}

/**
 * Система единиц измерения
 */
export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
  CUSTOM = 'custom'
}

/**
 * Настройки уведомлений
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sync: boolean;
}

/**
 * OAuth провайдер
 */
export interface OAuthProvider {
  provider: 'google' | 'facebook' | 'apple';
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Сессия пользователя
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  deviceInfo: DeviceInfo;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Информация об устройстве
 */
export interface DeviceInfo {
  platform: 'android' | 'web' | 'ios';
  version: string;
  userAgent?: string;
  deviceId?: string;
}
