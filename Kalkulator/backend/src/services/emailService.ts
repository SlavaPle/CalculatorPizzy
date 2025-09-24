import nodemailer from 'nodemailer'
import { config } from '@config/index'
import { logger } from '@utils/logger'

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.port === 465,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass,
      },
    })
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${config.cors.origin}/auth/verify-email?token=${token}`
      
      const mailOptions = {
        from: `${config.email.from.name} <${config.email.from.email}>`,
        to: email,
        subject: 'Подтверждение email - Kalkulator',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Добро пожаловать в Kalkulator!</h2>
            <p>Привет, ${name}!</p>
            <p>Спасибо за регистрацию. Для завершения настройки аккаунта, пожалуйста, подтвердите ваш email адрес.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Подтвердить email
              </a>
            </div>
            <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>Ссылка действительна в течение 24 часов.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Если вы не регистрировались в Kalkulator, просто проигнорируйте это письмо.
            </p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Verification email sent to: ${email}`)
    } catch (error) {
      logger.error('Failed to send verification email:', error)
      throw error
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    try {
      const resetUrl = `${config.cors.origin}/auth/reset-password?token=${token}`
      
      const mailOptions = {
        from: `${config.email.from.name} <${config.email.from.email}>`,
        to: email,
        subject: 'Сброс пароля - Kalkulator',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Сброс пароля</h2>
            <p>Привет, ${name}!</p>
            <p>Мы получили запрос на сброс пароля для вашего аккаунта.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc004e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Сбросить пароль
              </a>
            </div>
            <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>Ссылка действительна в течение 1 часа.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
            </p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Password reset email sent to: ${email}`)
    } catch (error) {
      logger.error('Failed to send password reset email:', error)
      throw error
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: `${config.email.from.name} <${config.email.from.email}>`,
        to: email,
        subject: 'Добро пожаловать в Kalkulator!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Добро пожаловать в Kalkulator!</h2>
            <p>Привет, ${name}!</p>
            <p>Спасибо за регистрацию в Kalkulator - универсальном калькуляторе для сложных математических расчетов.</p>
            <h3>Что вы можете делать:</h3>
            <ul>
              <li>Создавать собственные калькуляторы</li>
              <li>Использовать готовые формулы</li>
              <li>Работать с единицами измерения</li>
              <li>Сохранять и делиться расчетами</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.cors.origin}" 
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Начать работу
              </a>
            </div>
            <p>Если у вас есть вопросы, не стесняйтесь обращаться к нам.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Команда Kalkulator
            </p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Welcome email sent to: ${email}`)
    } catch (error) {
      logger.error('Failed to send welcome email:', error)
      throw error
    }
  }

  async sendNotificationEmail(email: string, name: string, subject: string, message: string): Promise<void> {
    try {
      const mailOptions = {
        from: `${config.email.from.name} <${config.email.from.email}>`,
        to: email,
        subject: `${subject} - Kalkulator`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>Привет, ${name}!</p>
            <p>${message}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.cors.origin}" 
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Открыть Kalkulator
              </a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Команда Kalkulator
            </p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      logger.info(`Notification email sent to: ${email}`)
    } catch (error) {
      logger.error('Failed to send notification email:', error)
      throw error
    }
  }
}

export const emailService = new EmailService()
