import React from 'react'
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, Divider } from '@mui/material'

export const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Настройки
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Общие настройки
          </Typography>
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Автосохранение"
          />
          
          <FormControlLabel
            control={<Switch />}
            label="Уведомления"
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Синхронизация"
          />
        </CardContent>
      </Card>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Внешний вид
          </Typography>
          
          <FormControlLabel
            control={<Switch />}
            label="Темная тема"
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Компактный режим"
          />
        </CardContent>
      </Card>
    </Box>
  )
}
