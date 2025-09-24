import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { Box, Typography, Card, CardContent, Avatar, Button } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Пользователь не найден</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Профиль пользователя
      </Typography>
      
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user.avatar}
              sx={{ width: 64, height: 64, mr: 2 }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Button
              startIcon={<EditIcon />}
              sx={{ ml: 'auto' }}
            >
              Редактировать
            </Button>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Дата регистрации
              </Typography>
              <Typography variant="body1">
                {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Последний вход
              </Typography>
              <Typography variant="body1">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Никогда'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Статус
              </Typography>
              <Typography variant="body1">
                {user.isVerified ? 'Подтвержден' : 'Не подтвержден'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
