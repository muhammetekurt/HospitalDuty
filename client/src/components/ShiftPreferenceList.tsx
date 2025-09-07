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
  Avatar,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  EventBusy as UnavailableIcon,
  EventAvailable as AvailableIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { shiftPreferenceService } from '../services/shiftPreferenceService';
import { employeeService } from '../services/employeeService';
import { useAuth } from '../contexts/AuthContext';
import type { ShiftPreference, PreferenceType } from '../types/shiftPreference';
import type { Employee } from '../types/employee';

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
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ShiftPreference[]>([]);
  const [filteredPreferences, setFilteredPreferences] = useState<ShiftPreference[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Shift preference silme yetkisi - herkes sadece kendi tercihlerini silebilir
  const canDeletePreference = (preference: ShiftPreference): boolean => {
    if (!user?.id) return false;
    return preference.employeeId === user.id;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    preference: ShiftPreference | null;
  }>({ open: false, preference: null });
  
  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedPreferenceType, setSelectedPreferenceType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  useEffect(() => {
    loadPreferences();
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    applyFilters();
  }, [preferences, selectedEmployee, selectedPreferenceType, selectedDate]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Çalışanları yükle ve kullanıcının hastanesindeki çalışanları filtrele
      const employeesData = await employeeService.getAll();
      const hospitalFilteredEmployees = employeesData.filter(emp => emp.hospitalId === user?.hospitalId);
      // Kullanıcının departmanındaki çalışanları filtrele
      const departmentFilteredEmployees = hospitalFilteredEmployees.filter(emp => emp.departmentId === user?.departmentId);
      setEmployees(departmentFilteredEmployees);
      
      let data: ShiftPreference[];
      if (employeeId) {
        data = await shiftPreferenceService.getPreferencesByEmployeeAndMonth(employeeId, selectedMonth);
      } else {
        data = await shiftPreferenceService.getPreferencesByMonth(selectedMonth);
      }
      
      // Kullanıcının hastanesindeki shift tercihlerini filtrele
      const hospitalFilteredData = data.filter(preference => {
        const employee = departmentFilteredEmployees.find(emp => emp.id === preference.employeeId);
        return employee !== undefined;
      });
      
      // Tarihe göre sırala (en yakın tarih ilk sırada)
      hospitalFilteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setPreferences(hospitalFilteredData);
    } catch (err) {
      setError('Shift tercihleri yüklenirken bir hata oluştu.');
      console.error('Error loading shift preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...preferences];

    // Çalışan filtresi
    if (selectedEmployee) {
      filtered = filtered.filter(preference => 
        preference.employeeId === selectedEmployee
      );
    }

    // Tercih tipi filtresi
    if (selectedPreferenceType !== '') {
      const preferenceType = parseInt(selectedPreferenceType);
      filtered = filtered.filter(preference => 
        preference.preferenceType === preferenceType
      );
    }

    // Tarih filtresi
    if (selectedDate) {
      filtered = filtered.filter(preference => {
        const preferenceDate = new Date(preference.date).toDateString();
        const filterDate = new Date(selectedDate).toDateString();
        return preferenceDate === filterDate;
      });
    }

    setFilteredPreferences(filtered);
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setSelectedPreferenceType('');
    setSelectedDate('');
  };

  // Tercih tipi seçenekleri
  const preferenceTypeOptions = [
    { value: '0', label: 'Müsait Değil' },
    { value: '1', label: 'Tercih Edilen' },
  ];

  const getEmployeeById = (employeeId: string): Employee | undefined => {
    if (!employeeId || !employees.length) {
      console.log('No employeeId or no employees:', { employeeId, employeesLength: employees.length });
      return undefined;
    }
    
    console.log('All employees:', employees.map(emp => ({ id: emp.id, name: emp.firstName + ' ' + emp.lastName })));
    console.log('Looking for employeeId:', employeeId);
    
    const employee = employees.find(emp => emp.id === employeeId);
    console.log('Found employee:', employee);
    
    return employee;
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
        <Typography variant="body2" color="text.secondary">
          {user?.department} - {filteredPreferences.length} / {preferences.length} tercih
        </Typography>
      </Box>

      {/* Filtre Kartı */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtreler
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Çalışan</InputLabel>
                <Select
                  value={selectedEmployee}
                  label="Çalışan"
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tercih Tipi</InputLabel>
                <Select
                  value={selectedPreferenceType}
                  label="Tercih Tipi"
                  onChange={(e) => setSelectedPreferenceType(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {preferenceTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Tarih"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                fullWidth
                size="small"
              >
                Filtreleri Temizle
              </Button>
            </Box>
          </Box>
          
          {/* Ay Seçici */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            </Box>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ay</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                label="Ay"
                sx={{
                  '& .MuiSelect-select': {
                    backgroundColor: 'white',
                    color: 'inherit',
                    fontWeight: 'normal',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'inherit',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'inherit',
                  },
                }}
              >
                {months.map((month, index) => (
                  <MenuItem 
                    key={index} 
                    value={index + 1}
                    sx={{
                      backgroundColor: 'white',
                      color: 'inherit',
                      fontWeight: 'normal',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      }
                    }}
                  >
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {filteredPreferences.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {preferences.length === 0 
              ? 'Bu ay için shift tercihi bulunmuyor'
              : 'Seçilen filtreye uygun tercih bulunmuyor'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {preferences.length === 0 
              ? (employeeId ? 'Size ait shift tercihi bulunmuyor.' : 'Henüz shift tercihi oluşturulmamış.')
              : 'Filtreleri değiştirerek tekrar deneyin'
            }
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
              {filteredPreferences.map((preference) => (
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
                    <Box display="flex" alignItems="center">
                      {(() => {
                        const employee = getEmployeeById(preference.employeeId);
                        return (
                          <Avatar 
                            src={employee?.profileImageUrl}
                            sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}
                          >
                            {employee?.firstName?.charAt(0) || '?'}{employee?.lastName?.charAt(0) || '?'}
                          </Avatar>
                        );
                      })()}
                      <Typography variant="body2" fontWeight="medium">
                        {preference.employeeName || '-'}
                      </Typography>
                    </Box>
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
                    {canDeletePreference(preference) && (
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(preference)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
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
