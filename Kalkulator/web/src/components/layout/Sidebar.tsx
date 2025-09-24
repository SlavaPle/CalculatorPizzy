import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Home as HomeIcon,
  Calculate as CalculateIcon,
  Functions as FunctionsIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { RootState } from '@store'
import { setSidebarOpen } from '@store/slices/uiSlice'
import { setCurrentTab } from '@store/slices/calculatorSlice'

const drawerWidth = 240

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const { tabs } = useSelector((state: RootState) => state.calculator)

  const handleClose = () => {
    dispatch(setSidebarOpen(false))
  }

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleTabClick = (tabId: string) => {
    dispatch(setCurrentTab(tabs.find(tab => tab.id === tabId) || null))
    navigate(`/calculator/${tabId}`)
  }

  const handleNewTab = () => {
    // Создание новой вкладки
    const newTab = {
      id: Date.now().toString(),
      name: 'Новая вкладка',
      displayName: 'Новая вкладка',
      inputs: [],
      formulas: [],
      outputs: [],
      isActive: true,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    dispatch(setCurrentTab(newTab))
    navigate(`/calculator/${newTab.id}`)
  }

  const menuItems = [
    { path: '/', label: 'Главная', icon: <HomeIcon /> },
    { path: '/formulas', label: 'Формулы', icon: <FunctionsIcon /> },
  ]

  return (
    <Drawer
      variant="temporary"
      open={sidebarOpen}
      onClose={handleClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Калькуляторы
        </Typography>
        <Tooltip title="Закрыть">
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Мои калькуляторы
          </Typography>
          <Tooltip title="Создать новый калькулятор">
            <IconButton onClick={handleNewTab} size="small" color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <List dense>
          {tabs.map((tab) => (
            <ListItem key={tab.id} disablePadding>
              <ListItemButton
                selected={location.pathname === `/calculator/${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                sx={{ pl: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CalculateIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={tab.displayName}
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {tabs.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 2 }}
          >
            Нет калькуляторов
          </Typography>
        )}
      </Box>
    </Drawer>
  )
}
