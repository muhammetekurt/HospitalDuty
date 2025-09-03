import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { shiftService } from '../services/shiftService';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import type { Shift, ShiftType } from '../types/shift';
import type { Employee } from '../types/employee';
import type { Department } from '../types/department';

interface ShiftListProps {
  employeeId?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onEditClick?: (shift: Shift) => void;
  onDeleteClick?: (shift: Shift) => void;
}

const ShiftList: React.FC<ShiftListProps> = ({ 
  employeeId, 
  showAddButton = false, 
  onAddClick, 
  onEditClick, 
  onDeleteClick 
}) => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Shift yetkilendirme kontrolü
  const canManageShifts = () => {
    if (!user?.roles) return false;
    return user.roles.includes('DepartmentManager') || 
           user.roles.includes('DepartmentLeader') || 
           user.roles.includes('HospitalDirector');
  };
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    shift: Shift | null;
  }>({ open: false, shift: null });
  
  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedShiftType, setSelectedShiftType] = useState<string>('');

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];



  useEffect(() => {
    loadShifts();
    loadEmployees();
    loadDepartments();
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    applyFilters();
  }, [shifts, selectedEmployee, selectedDepartment, selectedShiftType]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Shift[];
      if (employeeId) {
        data = await shiftService.getShiftsByEmployee(employeeId);
      } else {
        data = await shiftService.getAllShifts();
      }
      
      // Kullanıcının hastanesindeki shift'leri filtrele
      const hospitalFilteredData = data.filter(shift => shift.hospitalId === user?.hospitalId);
      
      // Kullanıcının departmanındaki shift'leri filtrele
      const departmentFilteredData = hospitalFilteredData.filter(shift => shift.departmentId === user?.departmentId);
      
      // Ay filtresi uygula
      const filteredData = departmentFilteredData.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate.getMonth() + 1 === selectedMonth;
      });
      
      // Tarihe göre sırala (en yakın tarih ilk sırada)
      filteredData.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      setShifts(filteredData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Vardiyalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      // Kullanıcının hastanesindeki çalışanları filtrele
      const hospitalFilteredEmployees = data.filter(emp => emp.hospitalId === user?.hospitalId);
      // Kullanıcının departmanındaki çalışanları filtrele
      const departmentFilteredEmployees = hospitalFilteredEmployees.filter(emp => emp.departmentId === user?.departmentId);
      setEmployees(departmentFilteredEmployees);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      // Kullanıcının hastanesindeki departmanları filtrele
      const hospitalFilteredDepartments = data.filter(dept => dept.hospitalId === user?.hospitalId);
      // Kullanıcının departmanını filtrele (sadece kendi departmanını göster)
      const departmentFilteredDepartments = hospitalFilteredDepartments.filter(dept => dept.id === user?.departmentId);
      setDepartments(departmentFilteredDepartments);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...shifts];

    // Çalışan filtresi
    if (selectedEmployee) {
      filtered = filtered.filter(shift => 
        shift.employeeId === selectedEmployee
      );
    }

    // Departman filtresi
    if (selectedDepartment) {
      filtered = filtered.filter(shift => 
        shift.departmentName === selectedDepartment
      );
    }

    // Vardiya tipi filtresi
    if (selectedShiftType !== '') {
      const shiftType = parseInt(selectedShiftType);
      filtered = filtered.filter(shift => 
        shift.shiftType === shiftType
      );
    }

    setFilteredShifts(filtered);
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setSelectedDepartment('');
    setSelectedShiftType('');
  };

  // Vardiya tipi seçenekleri
  const shiftTypeOptions = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Gece' },
    { value: '2', label: 'Acil' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };



  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getShiftTypeColor = (shiftType: ShiftType) => {
    switch (shiftType) {
      case 0: // Normal
        return 'success';
      case 1: // Night
        return 'primary';
      case 2: // Emergency
        return 'error';
      default:
        return 'default';
    }
  };

  const getShiftTypeLabel = (shiftType: ShiftType) => {
    switch (shiftType) {
      case 0: // Normal
        return 'Normal';
      case 1: // Night
        return 'Gece';
      case 2: // Emergency
        return 'Acil';
      default:
        return 'Bilinmeyen';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          {months[selectedMonth - 1]} {new Date().getFullYear()} Vardiyaları
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredShifts.length} / {shifts.length} vardiya
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
                <InputLabel>Departman</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Departman"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Vardiya Tipi</InputLabel>
                <Select
                  value={selectedShiftType}
                  label="Vardiya Tipi"
                  onChange={(e) => setSelectedShiftType(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {shiftTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          
          {/* Ay Seçici ve Yeni Vardiya Butonu */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {showAddButton && onAddClick && canManageShifts() && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAddClick}
                  size="small"
                >
                  Yeni Vardiya
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
                    backgroundColor: selectedMonth ? '#e1f5fe' : 'transparent',
                    color: selectedMonth ? '#0277bd' : 'inherit',
                    fontWeight: selectedMonth ? 600 : 'normal',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: selectedMonth ? '#0277bd' : 'inherit',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: selectedMonth ? '#01579b' : 'inherit',
                  },
                }}
              >
                {months.map((month, index) => (
                  <MenuItem 
                    key={index} 
                    value={index + 1}
                    sx={{
                      backgroundColor: selectedMonth === index + 1 ? '#e1f5fe' : 'transparent',
                      color: selectedMonth === index + 1 ? '#0277bd' : 'inherit',
                      fontWeight: selectedMonth === index + 1 ? 600 : 'normal',
                      '&:hover': {
                        backgroundColor: selectedMonth === index + 1 ? '#b3e5fc' : '#f5f5f5',
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

      {/* Vardiya Listesi */}
      {filteredShifts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {shifts.length === 0 
              ? 'Bu ay için vardiya bulunamadı'
              : 'Seçilen filtreye uygun vardiya bulunmuyor'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {shifts.length === 0 
              ? (employeeId ? 'Size atanmış vardiya bulunmuyor.' : 'Henüz vardiya oluşturulmamış.')
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
                <TableCell>Başlangıç</TableCell>
                <TableCell>Bitiş</TableCell>
                <TableCell>Vardiya Tipi</TableCell>
                <TableCell>Çalışan</TableCell>
                <TableCell>Hastane</TableCell>
                <TableCell>Departman</TableCell>
                {(onEditClick || onDeleteClick) && canManageShifts() && <TableCell align="center">İşlemler</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShifts.map((shift) => (
                <TableRow key={shift.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDate(shift.startTime)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDateTime(shift.startTime)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDateTime(shift.endTime)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getShiftTypeLabel(shift.shiftType)}
                      color={getShiftTypeColor(shift.shiftType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {shift.employeeName || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {shift.hospitalName || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {shift.departmentName || '-'}
                    </Typography>
                  </TableCell>
                  {(onEditClick || onDeleteClick) && canManageShifts() && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {onEditClick && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEditClick(shift)}
                            title="Düzenle"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {onDeleteClick && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, shift })}
                            title="Sil"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, shift: null })}>
        <DialogTitle>Vardiyayı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu vardiyayı silmek istediğinizden emin misiniz?
          </Typography>
          {deleteDialog.shift && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Tarih:</strong> {formatDate(deleteDialog.shift.startTime)}
              </Typography>
              <Typography variant="body2">
                <strong>Çalışan:</strong> {deleteDialog.shift.employeeName}
              </Typography>
              <Typography variant="body2">
                <strong>Hastane:</strong> {deleteDialog.shift.hospitalName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, shift: null })}>
            İptal
          </Button>
          <Button
            onClick={() => {
              if (deleteDialog.shift && onDeleteClick) {
                onDeleteClick(deleteDialog.shift);
                setDeleteDialog({ open: false, shift: null });
              }
            }}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftList;
