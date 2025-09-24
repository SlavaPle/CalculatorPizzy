import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppBar } from './AppBar'
import { Sidebar } from './Sidebar'

export const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginTop: '64px', // Высота AppBar
          marginLeft: { xs: 0, sm: '240px' }, // Ширина Sidebar
          transition: 'margin 0.3s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
