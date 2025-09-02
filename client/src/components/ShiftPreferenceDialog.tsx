import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';

import {
  CalendarMonth as CalendarIcon,
  EventBusy as UnavailableIcon,
  EventAvailable as AvailableIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { shiftPreferenceService } from '../services/shiftPreferenceService';
import type { CreateShiftPreferenceRequest, PreferenceType } from '../types/shiftPreference';

interface ShiftPreferenceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ShiftPreferenceDialog: React.FC<ShiftPreferenceDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [preferenceType, setPreferenceType] = useState<PreferenceType>(0);
  const [notes, setNotes] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectMode, setSelectMode] = useState<'single' | 'range'>('single');

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  // Ay değiştiğinde seçili tarihleri temizle
  useEffect(() => {
    setSelectedDates([]);
  }, [selectedMonth, selectedYear]);

  // Ayın günlerini hesapla
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  // Tarih seçimi
  const handleDateClick = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    
    if (selectMode === 'single') {
      if (selectedDates.some(d => d.getTime() === date.getTime())) {
        setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else {
      // Range mode - basit implementasyon
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const startDate = selectedDates[0];
        const endDate = date;
        const dates = [];
        
        const start = startDate < endDate ? startDate : endDate;
        const end = startDate < endDate ? endDate : startDate;
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d));
        }
        
        setSelectedDates(dates);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      setError('Lütfen en az bir tarih seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: CreateShiftPreferenceRequest = {
        dates: selectedDates,
        preferenceType,
        notes,
      };

      console.log('Gönderilen request:', request);
      console.log('selectedDates:', selectedDates);
      console.log('preferenceType:', preferenceType);
      console.log('notes:', notes);

      await shiftPreferenceService.createPreferences(request);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Shift preference oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    setPreferenceType(0);
    setNotes('');
    setSelectedDates([]);
    setSelectMode('single');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const isDateSelected = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return selectedDates.some(d => d.getTime() === date.getTime());
  };



  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
          Shift Tercihleri
        </Box>
      </DialogTitle>
      
      <DialogContent style={{ paddingTop: '20px' }}>
        {!success ? (
          <Box>
            {/* Ay ve Yıl Seçimi */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
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
              <FormControl fullWidth>
                <InputLabel>Yıl</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  label="Yıl"
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Tercih Tipi */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Tercih Tipi</InputLabel>
              <Select
                value={preferenceType}
                onChange={(e) => setPreferenceType(e.target.value as PreferenceType)}
                label="Tercih Tipi"
              >
                <MenuItem value={0}>
                  <Box display="flex" alignItems="center">
                    <UnavailableIcon sx={{ mr: 1, color: 'error.main' }} />
                    Müsait Değil
                  </Box>
                </MenuItem>
                <MenuItem value={1}>
                  <Box display="flex" alignItems="center">
                    <AvailableIcon sx={{ mr: 1, color: 'success.main' }} />
                    Tercih Edilen
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Seçim Modu */}
            <FormControlLabel
              control={
                <Switch
                  checked={selectMode === 'range'}
                  onChange={(e) => setSelectMode(e.target.checked ? 'range' : 'single')}
                />
              }
              label="Aralık Seçimi"
              sx={{ mb: 2 }}
            />

            {/* Notlar */}
            <TextField
              fullWidth
              label="Notlar (Opsiyonel)"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 2 }} />

            {/* Tarih Seçimi */}
            <Typography variant="h6" gutterBottom>
              Tarih Seçimi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectMode === 'single' 
                ? 'Tarihlere tıklayarak seçin/seçimi kaldırın' 
                : 'İlk tarihe tıklayın, sonra aralığın son tarihine tıklayın'
              }
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <Button
                  key={day}
                  variant={isDateSelected(day) ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleDateClick(day)}
                  sx={{
                    minWidth: '40px',
                    height: '40px',
                    bgcolor: isDateSelected(day) 
                      ? (preferenceType === 'Unavailable' ? 'error.main' : 'success.main')
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isDateSelected(day) 
                        ? (preferenceType === 'Unavailable' ? 'error.dark' : 'success.dark')
                        : 'action.hover',
                    },
                  }}
                >
                  {day}
                </Button>
              ))}
            </Box>

            {/* Seçili Tarihler */}
            {selectedDates.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Seçili Tarihler ({selectedDates.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedDates.map((date, index) => (
                    <Chip
                      key={index}
                      label={date.toLocaleDateString('tr-TR')}
                      color={preferenceType === 'Unavailable' ? 'error' : 'success'}
                      size="small"
                      onDelete={() => {
                        setSelectedDates(selectedDates.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box textAlign="center" py={2}>
            <SaveIcon 
              sx={{ 
                fontSize: 64, 
                color: 'success.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              Shift Tercihleri Kaydedildi!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seçtiğiniz tarihler için shift tercihleriniz başarıyla kaydedildi.
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        {!success ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || selectedDates.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
          >
            Tamam
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShiftPreferenceDialog;
