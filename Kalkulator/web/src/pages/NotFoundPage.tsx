import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Container } from '@mui/material'
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '8rem', fontWeight: 700, color: 'primary.main' }}>
          404
        </Typography>
        
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Страница не найдена
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            На главную
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Назад
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
