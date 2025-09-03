import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';


import {
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { shiftService } from '../services/shiftService';
import { employeeService } from '../services/employeeService';
import { hospitalService } from '../services/hospitalService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import type { Shift, CreateShiftRequest, UpdateShiftRequest } from '../types/shift';
import { ShiftType } from '../types/shift';
import type { Employee } from '../types/employee';
import type { Hospital } from '../types/hospital';
import type { Department } from '../types/department';

interface ShiftFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shift?: Shift;
  isEdit?: boolean;
}

const ShiftForm: React.FC<ShiftFormProps> = ({
  open,
  onClose,
  onSuccess,
  shift,
  isEdit = false
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Bugünün tarihini al (saat bilgisi olmadan)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().slice(0, 16);

  const [formData, setFormData] = useState<{
    employeeId: string;
    hospitalId: string;
    departmentId: string;
    startTime: string;
    endTime: string;
    shiftType: ShiftType;
    notes: string;
  }>({
    employeeId: '',
    hospitalId: user?.hospitalId || '',
    departmentId: user?.departmentId || '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16), // 8 saat sonra
    shiftType: ShiftType.Normal,
    notes: ''
  });

  // Departmana göre filtrelenmiş çalışanlar
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => 
      !formData.departmentId || employee.departmentId === formData.departmentId
    );
  }, [employees, formData.departmentId]);

  const shiftTypes = [
    { value: ShiftType.Normal, label: 'Normal' },
    { value: ShiftType.Night, label: 'Gece' },
    { value: ShiftType.Emergency, label: 'Acil' }
  ];

  useEffect(() => {
    if (open) {
      loadData();
      if (isEdit && shift) {
        setFormData({
          employeeId: shift.employeeId,
          hospitalId: shift.hospitalId,
          departmentId: shift.departmentId,
          startTime: new Date(shift.startTime).toISOString().slice(0, 16),
          endTime: new Date(shift.endTime).toISOString().slice(0, 16),
          shiftType: shift.shiftType,
          notes: shift.notes || ''
        });
      } else {
        resetForm();
        // Yeni shift oluştururken kullanıcının hastane ve departmanını ayarla
        setFormData(prev => ({
          ...prev,
          hospitalId: user?.hospitalId || '',
          departmentId: user?.departmentId || ''
        }));
      }
    }
  }, [open, isEdit, shift]);

  // Departman değiştiğinde seçili çalışanı temizle
  useEffect(() => {
    if (formData.employeeId && formData.departmentId) {
      const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
      if (selectedEmployee && selectedEmployee.departmentId !== formData.departmentId) {
        setFormData(prev => ({ ...prev, employeeId: '' }));
      }
    }
  }, [formData.departmentId, formData.employeeId, employees]);

  const loadData = async () => {
    try {
      const [employeesData, hospitalsData, departmentsData] = await Promise.all([
        employeeService.getAll(),
        hospitalService.getAll(),
        departmentService.getAll()
      ]);
      
      setEmployees(employeesData);
      setHospitals(hospitalsData);
      setDepartments(departmentsData);
    } catch (err) {
      console.error('Data loading error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      hospitalId: '',
      departmentId: '',
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16), // 8 saat sonra
      shiftType: 0, // Normal
      notes: ''
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.hospitalId || !formData.departmentId || 
        !formData.startTime || !formData.endTime) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    // Bitiş tarihi başlangıç tarihinden önce olamaz
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    
    if (endDate <= startDate) {
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit && shift) {
        const updateData: UpdateShiftRequest = {
          employeeId: formData.employeeId,
          hospitalId: formData.hospitalId,
          departmentId: formData.departmentId,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          shiftType: formData.shiftType,
          notes: formData.notes
        };
        await shiftService.updateShift(shift.id, updateData);
      } else {
        const createData: CreateShiftRequest = {
          employeeId: formData.employeeId,
          hospitalId: formData.hospitalId,
          departmentId: formData.departmentId,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          shiftType: formData.shiftType,
          notes: formData.notes
        };
        await shiftService.createShift(createData);
      }
      
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      console.error('Shift form error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      // Backend'ten gelen hata mesajını al
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.title || 
                          err.message || 
                          'Vardiya kaydedilirken bir hata oluştu';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={false}
            PaperProps={{
        sx: {
          width: '900px',
          height: '530px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
          {isEdit ? 'Vardiya Düzenle' : 'Yeni Vardiya'}
        </Box>
      </DialogTitle>
      
      <DialogContent style={{ paddingTop: '20px' }}>
        {!success ? (
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {/* Çalışan Seçimi */}
              <FormControl required sx={{ minWidth: 250 }}>
                <InputLabel>Çalışan</InputLabel>
                <Select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  label="Çalışan"
                  disabled={!formData.departmentId}
                  sx={{
                    '& .MuiSelect-select': {
                      backgroundColor: formData.employeeId ? '#e1f5fe' : 'transparent',
                      color: formData.employeeId ? '#0277bd' : 'inherit',
                      fontWeight: formData.employeeId ? 600 : 'normal',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.employeeId ? '#0277bd' : 'inherit',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.employeeId ? '#01579b' : 'inherit',
                    },
                  }}
                >
                  {!formData.departmentId ? (
                    <MenuItem disabled>
                      Önce departman seçiniz
                    </MenuItem>
                  ) : filteredEmployees.length === 0 ? (
                    <MenuItem disabled>
                      Bu departmanda çalışan bulunamadı
                    </MenuItem>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <MenuItem 
                        key={employee.id} 
                        value={employee.id}
                        sx={{
                          backgroundColor: formData.employeeId === employee.id ? '#e1f5fe' : 'transparent',
                          color: formData.employeeId === employee.id ? '#0277bd' : 'inherit',
                          fontWeight: formData.employeeId === employee.id ? 600 : 'normal',
                          '&:hover': {
                            backgroundColor: formData.employeeId === employee.id ? '#b3e5fc' : '#f5f5f5',
                          }
                        }}
                      >
                        {employee.firstName} {employee.lastName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Hastane Seçimi */}
              <FormControl required sx={{ minWidth: 250 }}>
                <InputLabel>Hastane</InputLabel>
                <Select
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                  label="Hastane"
                  disabled={true}
                  sx={{
                    '& .MuiSelect-select': {
                      backgroundColor: formData.hospitalId ? '#f3e5f5' : 'transparent',
                      color: formData.hospitalId ? '#7b1fa2' : 'inherit',
                      fontWeight: formData.hospitalId ? 600 : 'normal',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.hospitalId ? '#7b1fa2' : 'inherit',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.hospitalId ? '#4a148c' : 'inherit',
                    },
                  }}
                >
                  {hospitals.map((hospital) => (
                    <MenuItem 
                      key={hospital.id} 
                      value={hospital.id}
                      sx={{
                        backgroundColor: formData.hospitalId === hospital.id ? '#f3e5f5' : 'transparent',
                        color: formData.hospitalId === hospital.id ? '#7b1fa2' : 'inherit',
                        fontWeight: formData.hospitalId === hospital.id ? 600 : 'normal',
                        '&:hover': {
                          backgroundColor: formData.hospitalId === hospital.id ? '#e1bee7' : '#f5f5f5',
                        }
                      }}
                    >
                      {hospital.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Departman Seçimi */}
              <FormControl required sx={{ minWidth: 250 }}>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  label="Departman"
                  disabled={true}
                  sx={{
                    '& .MuiSelect-select': {
                      backgroundColor: formData.departmentId ? '#e8f5e8' : 'transparent',
                      color: formData.departmentId ? '#388e3c' : 'inherit',
                      fontWeight: formData.departmentId ? 600 : 'normal',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.departmentId ? '#388e3c' : 'inherit',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.departmentId ? '#2e7d32' : 'inherit',
                    },
                  }}
                >
                  {departments.map((department) => (
                    <MenuItem 
                      key={department.id} 
                      value={department.id}
                      sx={{
                        backgroundColor: formData.departmentId === department.id ? '#e8f5e8' : 'transparent',
                        color: formData.departmentId === department.id ? '#388e3c' : 'inherit',
                        fontWeight: formData.departmentId === department.id ? 600 : 'normal',
                        '&:hover': {
                          backgroundColor: formData.departmentId === department.id ? '#c8e6c9' : '#f5f5f5',
                        }
                      }}
                    >
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Vardiya Tipi */}
              <FormControl required sx={{ minWidth: 250 }}>
                <InputLabel>Vardiya Tipi</InputLabel>
                <Select
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                  label="Vardiya Tipi"
                  sx={{
                    '& .MuiSelect-select': {
                      backgroundColor: formData.shiftType ? '#fce4ec' : 'transparent',
                      color: formData.shiftType ? '#c2185b' : 'inherit',
                      fontWeight: formData.shiftType ? 600 : 'normal',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.shiftType ? '#c2185b' : 'inherit',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: formData.shiftType ? '#ad1457' : 'inherit',
                    },
                  }}
                >
                  {shiftTypes.map((type) => (
                    <MenuItem 
                      key={type.value} 
                      value={type.value}
                      sx={{
                        backgroundColor: formData.shiftType === type.value ? '#fce4ec' : 'transparent',
                        color: formData.shiftType === type.value ? '#c2185b' : 'inherit',
                        fontWeight: formData.shiftType === type.value ? 600 : 'normal',
                        '&:hover': {
                          backgroundColor: formData.shiftType === type.value ? '#f8bbd9' : '#f5f5f5',
                        }
                      }}
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Başlangıç Zamanı */}
              <TextField
                label="Başlangıç Zamanı"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: todayString }}
                required
                sx={{ minWidth: 250 }}
              />

              {/* Bitiş Zamanı */}
              <TextField
                label="Bitiş Zamanı"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: formData.startTime ? formData.startTime : todayString 
                }}
                required
                sx={{ minWidth: 250 }}
              />
            </Box>

            {/* Notlar */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Vardiya ile ilgili notlar..."
                disabled={loading}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Alert severity="success" sx={{ mt: 2 }}>
            Vardiya başarıyla {isEdit ? 'güncellendi' : 'oluşturuldu'}!
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
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Tamam
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShiftForm;
