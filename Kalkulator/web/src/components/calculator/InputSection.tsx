import React from 'react'
import { Box, Typography, TextField, IconButton, Tooltip } from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { Input } from '@shared/models/tab/Tab'

interface InputSectionProps {
  inputs: Input[]
}

export const InputSection: React.FC<InputSectionProps> = ({ inputs }) => {
  const handleDelete = (inputId: string) => {
    console.log('Delete input:', inputId)
  }

  const handleEdit = (inputId: string) => {
    console.log('Edit input:', inputId)
  }

  const handleValueChange = (inputId: string, value: string) => {
    console.log('Change input value:', inputId, value)
  }

  if (inputs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Нет входных данных
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {inputs.map((input) => (
        <Box
          key={input.name}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {input.displayName}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={input.value?.format() || ''}
              onChange={(e) => handleValueChange(input.name, e.target.value)}
              placeholder={`Введите ${input.displayName.toLowerCase()}`}
              InputProps={{
                endAdornment: input.unit.symbol ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    {input.unit.symbol}
                  </Typography>
                ) : undefined,
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Tooltip title="Редактировать">
              <IconButton size="small" onClick={() => handleEdit(input.name)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Удалить">
              <IconButton size="small" onClick={() => handleDelete(input.name)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
