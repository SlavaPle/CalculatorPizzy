import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { getPrisma } from '@database/connection'
import { getRedis } from '@database/redis'
import { logger } from '@utils/logger'
import { config } from '@config/index'
import { ApiError, ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '@utils/ApiError'
import { emailService } from '@services/emailService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
}

export const authController = {
  // Регистрация
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body
      
      // Проверка существования пользователя
      const existingUser = await getPrisma().user.findUnique({
        where: { email },
      })
      
      if (existingUser) {
        throw new ConflictError('Пользователь с таким email уже существует')
      }
      
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds)
      
      // Создание пользователя
      const user = await getPrisma().user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
          createdAt: true,
        },
      })
      
      // Генерация токенов
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )
      
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      )
      
      // Сохранение сессии
      await getPrisma().userSession.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
        },
      })
      
      // Отправка email подтверждения
      try {
        const verificationToken = jwt.sign(
          { userId: user.id, type: 'verification' },
          config.jwt.secret,
          { expiresIn: '24h' }
        )
        
        await emailService.sendVerificationEmail(user.email, user.name, verificationToken)
      } catch (emailError) {
        logger.warn('Failed to send verification email:', emailError)
      }
      
      logger.info(`User registered: ${user.email}`)
      
      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user,
          accessToken,
          refreshToken,
        },
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Вход
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      
      // Поиск пользователя
      const user = await getPrisma().user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      })
      
      if (!user) {
        throw new UnauthorizedError('Неверный email или пароль')
      }
      
      if (!user.password) {
        throw new UnauthorizedError('Пользователь зарегистрирован через OAuth')
      }
      
      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        throw new UnauthorizedError('Неверный email или пароль')
      }
      
      // Обновление времени последнего входа
      await getPrisma().user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      
      // Генерация токенов
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )
      
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      )
      
      // Сохранение сессии
      await getPrisma().userSession.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
        },
      })
      
      logger.info(`User logged in: ${user.email}`)
      
      res.json({
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isVerified: user.isVerified,
          },
          accessToken,
          refreshToken,
        },
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Выход
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      
      if (refreshToken) {
        // Удаление сессии
        await getPrisma().userSession.deleteMany({
          where: { token: refreshToken },
        })
      }
      
      logger.info(`User logged out: ${req.user?.email}`)
      
      res.json({
        success: true,
        message: 'Выход выполнен успешно',
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Обновление токена
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token не предоставлен')
      }
      
      // Верификация refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any
      
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Недействительный refresh token')
      }
      
      // Проверка существования сессии
      const session = await getPrisma().userSession.findFirst({
        where: {
          token: refreshToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      })
      
      if (!session) {
        throw new UnauthorizedError('Сессия не найдена или истекла')
      }
      
      // Генерация нового access token
      const accessToken = jwt.sign(
        { userId: session.userId, email: session.user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )
      
      res.json({
        success: true,
        data: { accessToken },
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Восстановление пароля
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      
      const user = await getPrisma().user.findUnique({
        where: { email },
      })
      
      if (!user) {
        // Не раскрываем информацию о существовании пользователя
        res.json({
          success: true,
          message: 'Если пользователь с таким email существует, инструкции отправлены на почту',
        })
        return
      }
      
      // Генерация токена сброса
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      )
      
      // Отправка email
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken)
      
      logger.info(`Password reset requested for: ${email}`)
      
      res.json({
        success: true,
        message: 'Если пользователь с таким email существует, инструкции отправлены на почту',
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Сброс пароля
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body
      
      // Верификация токена
      const decoded = jwt.verify(token, config.jwt.secret) as any
      
      if (decoded.type !== 'password-reset') {
        throw new UnauthorizedError('Недействительный токен сброса')
      }
      
      // Поиск пользователя
      const user = await getPrisma().user.findUnique({
        where: { id: decoded.userId },
      })
      
      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }
      
      // Хеширование нового пароля
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds)
      
      // Обновление пароля
      await getPrisma().user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
      
      logger.info(`Password reset for: ${user.email}`)
      
      res.json({
        success: true,
        message: 'Пароль успешно изменен',
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Подтверждение email
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body
      
      // Верификация токена
      const decoded = jwt.verify(token, config.jwt.secret) as any
      
      if (decoded.type !== 'verification') {
        throw new UnauthorizedError('Недействительный токен подтверждения')
      }
      
      // Обновление статуса пользователя
      await getPrisma().user.update({
        where: { id: decoded.userId },
        data: { isVerified: true },
      })
      
      logger.info(`Email verified for user: ${decoded.userId}`)
      
      res.json({
        success: true,
        message: 'Email успешно подтвержден',
      })
    } catch (error) {
      next(error)
    }
  },
  
  // OAuth - Google
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    // Реализация OAuth с Google
    res.json({ message: 'Google OAuth not implemented yet' })
  },
  
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    // Реализация callback для Google OAuth
    res.json({ message: 'Google OAuth callback not implemented yet' })
  },
  
  // OAuth - Facebook
  async facebookAuth(req: Request, res: Response, next: NextFunction) {
    // Реализация OAuth с Facebook
    res.json({ message: 'Facebook OAuth not implemented yet' })
  },
  
  async facebookCallback(req: Request, res: Response, next: NextFunction) {
    // Реализация callback для Facebook OAuth
    res.json({ message: 'Facebook OAuth callback not implemented yet' })
  },
  
  // OAuth - Apple
  async appleAuth(req: Request, res: Response, next: NextFunction) {
    // Реализация OAuth с Apple
    res.json({ message: 'Apple OAuth not implemented yet' })
  },
  
  // Получение текущего пользователя
  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }
      
      const user = await getPrisma().user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      })
      
      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }
      
      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Обновление профиля
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }
      
      const { name, avatar } = req.body
      
      const user = await getPrisma().user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(avatar && { avatar }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      })
      
      logger.info(`Profile updated for: ${user.email}`)
      
      res.json({
        success: true,
        message: 'Профиль успешно обновлен',
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Изменение пароля
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }
      
      const { currentPassword, newPassword } = req.body
      
      // Получение пользователя с паролем
      const user = await getPrisma().user.findUnique({
        where: { id: req.user.id },
        select: { password: true },
      })
      
      if (!user?.password) {
        throw new UnauthorizedError('Пользователь зарегистрирован через OAuth')
      }
      
      // Проверка текущего пароля
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Неверный текущий пароль')
      }
      
      // Хеширование нового пароля
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds)
      
      // Обновление пароля
      await getPrisma().user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      })
      
      logger.info(`Password changed for: ${req.user.email}`)
      
      res.json({
        success: true,
        message: 'Пароль успешно изменен',
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Удаление аккаунта
  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }
      
      const { password } = req.body
      
      // Получение пользователя с паролем
      const user = await getPrisma().user.findUnique({
        where: { id: req.user.id },
        select: { password: true },
      })
      
      if (user?.password) {
        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password)
        
        if (!isPasswordValid) {
          throw new UnauthorizedError('Неверный пароль')
        }
      }
      
      // Удаление пользователя (каскадное удаление)
      await getPrisma().user.delete({
        where: { id: req.user.id },
      })
      
      logger.info(`Account deleted for: ${req.user.email}`)
      
      res.json({
        success: true,
        message: 'Аккаунт успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },
}
