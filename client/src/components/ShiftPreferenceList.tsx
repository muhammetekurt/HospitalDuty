import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  EventBusy as UnavailableIcon,
  EventAvailable as AvailableIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { shiftPreferenceService } from '../services/shiftPreferenceService';
import type { ShiftPreference, PreferenceType } from '../types/shiftPreference';

interface ShiftPreferenceListProps {
  employeeId?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

const ShiftPreferenceList: React.FC<ShiftPreferenceListProps> = ({ 
  employeeId, 
  showAddButton = false, 
  onAddClick 
}) => {
  const [preferences, setPreferences] = useState<ShiftPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    preference: ShiftPreference | null;
  }>({ open: false, preference: null });

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  useEffect(() => {
    loadPreferences();
  }, [employeeId, selectedMonth]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: ShiftPreference[];
      if (employeeId) {
        data = await shiftPreferenceService.getPreferencesByEmployeeAndMonth(employeeId, selectedMonth);
      } else {
        data = await shiftPreferenceService.getPreferencesByMonth(selectedMonth);
      }
      
      setPreferences(data);
    } catch (err) {
      setError('Shift tercihleri yüklenirken bir hata oluştu.');
      console.error('Error loading shift preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (preference: ShiftPreference) => {
    setDeleteDialog({ open: true, preference });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.preference) return;

    try {
      await shiftPreferenceService.deletePreference(deleteDialog.preference.id);
      await loadPreferences();
      setDeleteDialog({ open: false, preference: null });
    } catch (err) {
      setError('Shift tercihi silinirken bir hata oluştu.');
      console.error('Error deleting shift preference:', err);
    }
  };

  const getPreferenceTypeColor = (type: PreferenceType) => {
    return type === 0 ? 'error' : 'success';
  };

  const getPreferenceTypeIcon = (type: PreferenceType) => {
    return type === 0 ? <UnavailableIcon /> : <AvailableIcon />;
  };

  const getPreferenceTypeLabel = (type: PreferenceType) => {
    return type === 0 ? 'Müsait Değil' : 'Tercih Edilen';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Shift Tercihleri
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {showAddButton && onAddClick && (
            <Button
              variant="contained"
              startIcon={<CalendarIcon />}
              onClick={onAddClick}
              size="small"
            >
              Yeni Tercih Ekle
            </Button>
          )}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Ay</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              label="Ay"
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {preferences.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Bu ay için shift tercihi bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {employeeId ? 'Size ait shift tercihi bulunmuyor.' : 'Henüz shift tercihi oluşturulmamış.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Çalışan</TableCell>
                <TableCell>Tercih Tipi</TableCell>
                <TableCell>Notlar</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preferences.map((preference) => (
                <TableRow key={preference.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDate(preference.date)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {preference.employeeName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getPreferenceTypeIcon(preference.preferenceType)}
                      label={getPreferenceTypeLabel(preference.preferenceType)}
                      color={getPreferenceTypeColor(preference.preferenceType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {preference.notes || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(preference)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, preference: null })}
      >
        <DialogTitle>Shift Tercihini Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteDialog.preference && (
              <>
                <strong>{formatDate(deleteDialog.preference.date)}</strong> tarihli shift tercihini silmek istediğinizden emin misiniz?
                <br />
                Bu işlem geri alınamaz.
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, preference: null })}>
            İptal
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained"
            color="error"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftPreferenceList;
