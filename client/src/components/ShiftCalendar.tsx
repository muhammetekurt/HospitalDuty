import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  DateCalendar,
  LocalizationProvider,
  PickersDay
} from '@mui/x-date-pickers';
import type { PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AccessTime, Person, Business, LocationOn } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';
import { shiftService } from '../services/shiftService';
import { useAuth } from '../contexts/AuthContext';
import type { Shift } from '../types/shift';

// Türkçe locale ayarla
dayjs.locale('tr');

interface ShiftCalendarProps {
  hospitalId?: string;
  departmentId?: string;
  employeeId?: string;
}

const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  hospitalId,
  departmentId,
  employeeId
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seçilen tarihteki shift'leri getir
  const fetchShiftsForDate = async (date: Dayjs) => {
    setLoading(true);
    setError(null);
    
    try {
      const startOfMonth = date.startOf('month');
      const endOfMonth = date.endOf('month');
      
      let fetchedShifts: Shift[] = [];
      
      if (employeeId) {
        // Belirli çalışanın shift'leri
        fetchedShifts = await shiftService.getShiftsByEmployee(employeeId);
        // Ay içindeki shift'leri filtrele
        fetchedShifts = fetchedShifts.filter(shift => {
          const shiftDate = dayjs(shift.startTime);
          return shiftDate.isAfter(startOfMonth.subtract(1, 'day')) && 
                 shiftDate.isBefore(endOfMonth.add(1, 'day'));
        });
      } else {
        // Tarih aralığına göre tüm shift'ler
        fetchedShifts = await shiftService.getShiftsByDateRange(
          startOfMonth.toISOString(),
          endOfMonth.toISOString()
        );
      }

      // Filtreleme (hospital/department)
      const targetHospitalId = hospitalId || user?.hospitalId;
      const targetDepartmentId = departmentId || user?.departmentId;
      
      if (targetHospitalId) {
        fetchedShifts = fetchedShifts.filter(shift => shift.hospitalId === targetHospitalId);
      }
      if (targetDepartmentId) {
        fetchedShifts = fetchedShifts.filter(shift => shift.departmentId === targetDepartmentId);
      }

      setShifts(fetchedShifts);
    } catch (err) {
      setError('Shift verileri yüklenirken hata oluştu');
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftsForDate(selectedDate);
  }, [selectedDate, hospitalId, departmentId, employeeId]);

  // Shift tipine göre renk döndür
  const getShiftTypeColor = (shiftType: number) => {
    switch (shiftType) {
      case 0: return 'primary'; // Normal
      case 1: return 'secondary'; // Night
      case 2: return 'error'; // Emergency
      default: return 'default';
    }
  };

  // Shift tipine göre label döndür
  const getShiftTypeLabel = (shiftType: number) => {
    switch (shiftType) {
      case 0: return 'Normal';
      case 1: return 'Gece';
      case 2: return 'Acil';
      default: return 'Bilinmiyor';
    }
  };

  // Belirli bir tarihteki shift'leri getir
  const getShiftsForDate = (date: Dayjs) => {
    return shifts.filter(shift => 
      dayjs(shift.startTime).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  // Custom day component - shift'leri göstermek için
  const CustomPickersDay = (props: PickersDayProps) => {
    const { day, ...other } = props;
    const dayShifts = getShiftsForDate(day);
    const hasShifts = dayShifts.length > 0;

    return (
      <Box sx={{ position: 'relative' }}>
        <PickersDay {...other} day={day} />
        {hasShifts && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 0.5
            }}
          >
            {dayShifts.slice(0, 3).map((shift, index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: getShiftTypeColor(shift.shiftType) === 'primary' ? 'primary.main' :
                          getShiftTypeColor(shift.shiftType) === 'secondary' ? 'secondary.main' :
                          getShiftTypeColor(shift.shiftType) === 'error' ? 'error.main' : 'grey.500'
                }}
              />
            ))}
            {dayShifts.length > 3 && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'grey.400'
                }}
              />
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Seçilen tarihteki shift'leri göster
  const selectedDateShifts = getShiftsForDate(selectedDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Shift Takvimi{user?.department ? ` - ${user.department}` : ''}
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Takvim */}
          <Box sx={{ flex: { md: 2 }, minWidth: 0 }}>
            <Paper sx={{ p: 2, width: '100%', overflow: 'hidden' }}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue || dayjs())}
                onMonthChange={(newValue) => {
                  if (newValue) {
                    setSelectedDate(newValue);
                  }
                }}
                slots={{ day: CustomPickersDay }}
                sx={{
                  width: '100%',
                  minWidth: 300,
                  '& .MuiPickersCalendarHeader-root': {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                  '& .MuiDayCalendar-root': {
                    width: '100%',
                  },
                  '& .MuiDayCalendar-weekContainer': {
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                  },
                  '& .MuiDayCalendar-weekDayLabelContainer': {
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                  },
                  '& .MuiPickersDay-root': {
                    height: 36,
                    width: 36,
                    minWidth: 36,
                    fontSize: '0.875rem',
                    '&.Mui-selected': {
                      backgroundColor: '#f1faee', // Krem renk
                      color: '#1d3557', // Koyu mavi metin
                      '&:hover': {
                        backgroundColor: '#f1faee',
                      },
                    },
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    height: 36,
                    width: '100%',
                    minWidth: 0,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  '& .MuiPickersCalendarHeader-labelContainer': {
                    width: '100%',
                  }
                }}
              />
              
              {/* Legend - Takvimin altında */}
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Shift Tipleri:
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main'
                      }}
                    />
                    <Typography variant="caption">Normal</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main'
                      }}
                    />
                    <Typography variant="caption">Gece</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'error.main'
                      }}
                    />
                    <Typography variant="caption">Acil</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Seçilen tarih detayları */}
          <Box sx={{ flex: { md: 1 }, minWidth: { md: 300 } }}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom>
                {selectedDate.format('DD MMMM YYYY, dddd')}
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : selectedDateShifts.length === 0 ? (
                <Typography color="text.secondary">
                  Bu tarihte shift bulunmuyor.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {selectedDateShifts.map((shift, index) => (
                    <Card key={index} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Chip
                            label={getShiftTypeLabel(shift.shiftType)}
                            color={getShiftTypeColor(shift.shiftType)}
                            size="small"
                          />
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2">
                            {dayjs(shift.startTime).format('HH:mm')} - {dayjs(shift.endTime).format('HH:mm')}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2">
                            {shift.employeeName}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2">
                            {shift.departmentName}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            {shift.hospitalName}
                          </Typography>
                        </Box>

                        {shift.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Not: {shift.notes}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>


      </Box>
    </LocalizationProvider>
  );
};

export default ShiftCalendar;
