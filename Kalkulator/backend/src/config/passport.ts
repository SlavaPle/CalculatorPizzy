import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { getPrisma } from '@database/connection'
import { config } from '@config/index'
import { logger } from '@utils/logger'

export const setupPassport = () => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwt.secret,
        algorithms: ['HS256'],
      },
      async (payload, done) => {
        try {
          const user = await getPrisma().user.findUnique({
            where: { id: payload.userId },
            select: {
              id: true,
              email: true,
              name: true,
              isVerified: true,
            },
          })

          if (user) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        } catch (error) {
          logger.error('JWT strategy error:', error)
          return done(error, false)
        }
      }
    )
  )

  // Google OAuth Strategy
  if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.oauth.google.clientId,
          clientSecret: config.oauth.google.clientSecret,
          callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Поиск существующего пользователя по Google ID
            let user = await getPrisma().user.findFirst({
              where: {
                oauthProviders: {
                  some: {
                    provider: 'google',
                    providerId: profile.id,
                  },
                },
              },
              include: {
                oauthProviders: true,
              },
            })

            if (user) {
              return done(null, user)
            }

            // Поиск пользователя по email
            user = await getPrisma().user.findUnique({
              where: { email: profile.emails?.[0]?.value },
              include: {
                oauthProviders: true,
              },
            })

            if (user) {
              // Добавление Google OAuth к существующему пользователю
              await getPrisma().oAuthProvider.create({
                data: {
                  userId: user.id,
                  provider: 'google',
                  providerId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  name: profile.displayName || '',
                  avatar: profile.photos?.[0]?.value,
                },
              })

              return done(null, user)
            }

            // Создание нового пользователя
            const newUser = await getPrisma().user.create({
              data: {
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || '',
                avatar: profile.photos?.[0]?.value,
                isVerified: true,
                oauthProviders: {
                  create: {
                    provider: 'google',
                    providerId: profile.id,
                    email: profile.emails?.[0]?.value || '',
                    name: profile.displayName || '',
                    avatar: profile.photos?.[0]?.value,
                  },
                },
              },
              include: {
                oauthProviders: true,
              },
            })

            logger.info(`Google OAuth user created: ${newUser.email}`)
            return done(null, newUser)
          } catch (error) {
            logger.error('Google OAuth strategy error:', error)
            return done(error, false)
          }
        }
      )
    )
  }

  // Facebook OAuth Strategy
  if (config.oauth.facebook.appId && config.oauth.facebook.appSecret) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: config.oauth.facebook.appId,
          clientSecret: config.oauth.facebook.appSecret,
          callbackURL: '/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'picture'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Поиск существующего пользователя по Facebook ID
            let user = await getPrisma().user.findFirst({
              where: {
                oauthProviders: {
                  some: {
                    provider: 'facebook',
                    providerId: profile.id,
                  },
                },
              },
              include: {
                oauthProviders: true,
              },
            })

            if (user) {
              return done(null, user)
            }

            // Поиск пользователя по email
            user = await getPrisma().user.findUnique({
              where: { email: profile.emails?.[0]?.value },
              include: {
                oauthProviders: true,
              },
            })

            if (user) {
              // Добавление Facebook OAuth к существующему пользователю
              await getPrisma().oAuthProvider.create({
                data: {
                  userId: user.id,
                  provider: 'facebook',
                  providerId: profile.id,
                  email: profile.emails?.[0]?.value || '',
                  name: profile.displayName || '',
                  avatar: profile.photos?.[0]?.value,
                },
              })

              return done(null, user)
            }

            // Создание нового пользователя
            const newUser = await getPrisma().user.create({
              data: {
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || '',
                avatar: profile.photos?.[0]?.value,
                isVerified: true,
                oauthProviders: {
                  create: {
                    provider: 'facebook',
                    providerId: profile.id,
                    email: profile.emails?.[0]?.value || '',
                    name: profile.displayName || '',
                    avatar: profile.photos?.[0]?.value,
                  },
                },
              },
              include: {
                oauthProviders: true,
              },
            })

            logger.info(`Facebook OAuth user created: ${newUser.email}`)
            return done(null, newUser)
          } catch (error) {
            logger.error('Facebook OAuth strategy error:', error)
            return done(error, false)
          }
        }
      )
    )
  }

  // Сериализация пользователя для сессии
  passport.serializeUser((user: any, done) => {
    done(null, user.id)
  })

  // Десериализация пользователя из сессии
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await getPrisma().user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
        },
      })

      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    } catch (error) {
      logger.error('Deserialize user error:', error)
      return done(error, false)
    }
  })

  logger.info('Passport configured successfully')
}
