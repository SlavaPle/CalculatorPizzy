import React from 'react'
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '@store'
import { toggleSidebar } from '@store/slices/uiSlice'
import { logout } from '@store/slices/authSlice'
import { AuthService } from '@shared/auth/AuthService'

export const AppBar: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      const authService = AuthService.getInstance()
      await authService.logout()
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      dispatch(logout())
      navigate('/auth')
      handleMenuClose()
    }
  }

  const handleProfile = () => {
    navigate('/profile')
    handleMenuClose()
  }

  const handleSettings = () => {
    navigate('/settings')
    handleMenuClose()
  }

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={() => dispatch(toggleSidebar())}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 600 }}
        >
          Универсальный калькулятор
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" aria-label="notifications">
            <NotificationsIcon />
          </IconButton>

          <IconButton color="inherit" aria-label="settings" onClick={handleSettings}>
            <SettingsIcon />
          </IconButton>

          <IconButton
            color="inherit"
            aria-label="account menu"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            {user?.avatar ? (
              <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircleIcon />
            )}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              Профиль
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <SettingsIcon sx={{ mr: 1 }} />
              Настройки
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Выйти
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  )
}
