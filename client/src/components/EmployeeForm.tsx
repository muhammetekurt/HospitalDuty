import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import type { Employee, UpdateEmployeeRequest } from '../types/employee';
import { employeeService } from '../services/employeeService';
import { hospitalService } from '../services/hospitalService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import type { Hospital } from '../types/hospital';
import type { Department } from '../types/department';
import { Role } from '../types/employee';

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  employee?: Employee | null;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  open,
  onClose,
  onSubmit,
  employee,
}) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<UpdateEmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roles: [],
    departmentId: '',
    hospitalId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const isEdit = !!employee;

  const roleOptions = [
    { value: Role.SystemAdmin, label: 'Sistem Yöneticisi' },
    { value: Role.HospitalDirector, label: 'Hastane Müdürü' },
    { value: Role.DepartmentManager, label: 'Departman Müdürü' },
    { value: Role.DepartmentLeader, label: 'Departman Lideri' },
    { value: Role.Doctor, label: 'Doktor' },
    { value: Role.Nurse, label: 'Hemşire' },
    { value: Role.Staff, label: 'Personel' },
  ];

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phoneNumber: employee.phoneNumber || '',
        roles: employee.roles || [],
        departmentId: employee.departmentId,
        hospitalId: employee.hospitalId,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        roles: [],
        departmentId: '',
        hospitalId: '',
      });
    }
    setError(null);
    setErrors({});
  }, [employee, open]);

  useEffect(() => {
    if (open) {
      loadHospitals();
    }
  }, [open]);

  useEffect(() => {
    if (formData.hospitalId) {
      loadDepartmentsByHospital(formData.hospitalId);
    } else {
      setDepartments([]);
    }
  }, [formData.hospitalId]);

  const loadHospitals = async () => {
    try {
      const data = await hospitalService.getAll();
      // Sadece kullanıcının hastanesini göster
      const userHospital = data.filter(hospital => hospital.id === user?.hospitalId);
      setHospitals(userHospital);
    } catch (err) {
      console.error('Error loading hospitals:', err);
    }
  };

  const loadDepartmentsByHospital = async (hospitalId: string) => {
    try {
      setLoadingDepartments(true);
      const data = await departmentService.getByHospital(hospitalId);
      setDepartments(data);
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.hospitalId.trim()) {
      newErrors.hospitalId = 'Hastane seçimi gereklidir';
    }

    if (!formData.departmentId.trim()) {
      newErrors.departmentId = 'Departman seçimi gereklidir';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'En az bir rol seçilmelidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UpdateEmployeeRequest) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: string | string[] } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleRoleChange = (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }));

    if (errors.roles) {
      setErrors(prev => ({
        ...prev,
        roles: '',
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit && employee) {
        console.log('Updating employee with ID:', employee.id);
        console.log('Form data:', formData);
        await employeeService.update(employee.id, formData);
        console.log('Employee updated successfully');
        
        // Eğer güncellenen çalışan mevcut kullanıcı ise, user bilgilerini güncelle
        if (employee.id === user?.id) {
          await updateUser();
        }
      }

      onSubmit();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Form data being sent:', formData);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.title || 
                          err.message || 
                          'Çalışan güncellenirken bir hata oluştu.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Çalışan Düzenle
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Ad"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Soyad"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
                disabled={loading}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
                disabled={loading}
                placeholder="+90 555 123 45 67"
              />
            </Box>

            <FormControl fullWidth disabled={true} error={!!errors.hospitalId}>
              <InputLabel>Hastane</InputLabel>
              <Select
                value={formData.hospitalId}
                onChange={handleInputChange('hospitalId')}
                label="Hastane"
                required
                readOnly
                sx={{
                  '& .MuiSelect-select': {
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    fontWeight: 500,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ccc',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ccc',
                  },
                }}
              >
                {hospitals.map((hospital) => (
                  <MenuItem 
                    key={hospital.id} 
                    value={hospital.id}
                    sx={{
                      backgroundColor: formData.hospitalId === hospital.id ? '#e3f2fd' : 'transparent',
                      color: formData.hospitalId === hospital.id ? '#1976d2' : 'inherit',
                      fontWeight: formData.hospitalId === hospital.id ? 600 : 'normal',
                      '&:hover': {
                        backgroundColor: formData.hospitalId === hospital.id ? '#bbdefb' : '#f5f5f5',
                      }
                    }}
                  >
                    {hospital.name} - {hospital.city}
                  </MenuItem>
                ))}
              </Select>
              {errors.hospitalId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.hospitalId}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth disabled={loading || loadingDepartments} error={!!errors.departmentId}>
              <InputLabel>Departman</InputLabel>
              <Select
                value={formData.departmentId}
                onChange={handleInputChange('departmentId')}
                label="Departman"
                required
                sx={{
                  '& .MuiSelect-select': {
                    backgroundColor: formData.departmentId ? '#e8f5e8' : 'transparent',
                    color: formData.departmentId ? '#2e7d32' : 'inherit',
                    fontWeight: formData.departmentId ? 600 : 'normal',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: formData.departmentId ? '#2e7d32' : 'inherit',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: formData.departmentId ? '#1b5e20' : 'inherit',
                  },
                }}
              >
                {departments.map((department) => (
                  <MenuItem 
                    key={department.id} 
                    value={department.id}
                    sx={{
                      backgroundColor: formData.departmentId === department.id ? '#e8f5e8' : 'transparent',
                      color: formData.departmentId === department.id ? '#2e7d32' : 'inherit',
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
              {errors.departmentId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.departmentId}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth disabled={loading} error={!!errors.roles}>
              <InputLabel>Roller</InputLabel>
              <Select
                multiple
                value={formData.roles}
                onChange={handleRoleChange}
                input={<OutlinedInput label="Roller" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const role = roleOptions.find(r => r.value === value);
                      return (
                        <Chip 
                          key={value} 
                          label={role?.label || value} 
                          size="small"
                          color="primary"
                          variant="filled"
                          sx={{
                            backgroundColor: '#ff9800',
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-deleteIcon': {
                              color: 'white',
                            }
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                required
                sx={{
                  '& .MuiSelect-select': {
                    backgroundColor: formData.roles && formData.roles.length > 0 ? '#fff3e0' : 'transparent',
                    minHeight: '56px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: formData.roles && formData.roles.length > 0 ? '#ff9800' : 'inherit',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: formData.roles && formData.roles.length > 0 ? '#f57c00' : 'inherit',
                  },
                }}
              >
                {roleOptions.map((role) => (
                  <MenuItem 
                    key={role.value} 
                    value={role.value}
                    sx={{
                      backgroundColor: formData.roles && formData.roles.includes(role.value) ? '#fff3e0' : 'transparent',
                      color: formData.roles && formData.roles.includes(role.value) ? '#ff9800' : 'inherit',
                      fontWeight: formData.roles && formData.roles.includes(role.value) ? 600 : 'normal',
                      '&:hover': {
                        backgroundColor: formData.roles && formData.roles.includes(role.value) ? '#ffe0b2' : '#f5f5f5',
                      }
                    }}
                  >
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.roles && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.roles}
                </Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            size="large"
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'primary.light',
              }
            }}
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeeForm;
