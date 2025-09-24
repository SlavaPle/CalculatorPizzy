import React from 'react'
import { Box, Typography, Paper, IconButton, Tooltip, Chip } from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon, ContentCopy as CopyIcon } from '@mui/icons-material'
import { Output } from '@shared/models/tab/Tab'

interface OutputSectionProps {
  outputs: Output[]
}

export const OutputSection: React.FC<OutputSectionProps> = ({ outputs }) => {
  const handleDelete = (outputId: string) => {
    console.log('Delete output:', outputId)
  }

  const handleEdit = (outputId: string) => {
    console.log('Edit output:', outputId)
  }

  const handleCopy = (outputId: string, value: string) => {
    navigator.clipboard.writeText(value)
    console.log('Copied to clipboard:', value)
  }

  if (outputs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Нет результатов
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {outputs.map((output) => (
        <Paper
          key={output.name}
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: output.isCalculated ? 'success.light' : 'background.paper',
            borderColor: output.isCalculated ? 'success.main' : 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
              {output.displayName}
            </Typography>
            
            <Chip
              label={output.isCalculated ? 'Рассчитано' : 'Не рассчитано'}
              size="small"
              color={output.isCalculated ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 1,
              mb: 2,
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 500,
              color: output.isCalculated ? 'success.dark' : 'text.secondary',
            }}
          >
            {output.value?.format() || 'Не рассчитано'}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Копировать">
              <IconButton
                size="small"
                onClick={() => handleCopy(output.name, output.value?.format() || '')}
                disabled={!output.isCalculated}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Редактировать">
              <IconButton size="small" onClick={() => handleEdit(output.name)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Удалить">
              <IconButton size="small" onClick={() => handleDelete(output.name)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      ))}
    </Box>
  )
}
