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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  Chip,
  OutlinedInput,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { CreateEmployeeRequest, Employee } from '../types/employee';
import { Role } from '../types/employee';
import { employeeService } from '../services/employeeService';
import { hospitalService } from '../services/hospitalService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import type { Hospital } from '../types/hospital';
import type { Department } from '../types/department';

interface CreateEmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const CreateEmployeeForm: React.FC<CreateEmployeeFormProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roles: [],
    departmentId: (user?.roles?.includes('DepartmentManager') || user?.roles?.includes('DepartmentLeader')) ? user?.departmentId || '' : '',
    hospitalId: user?.hospitalId || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const steps = [
    {
      label: 'Kişisel Bilgiler',
      description: 'Çalışanın temel bilgilerini girin',
      icon: <PersonIcon />,
    },
    {
      label: 'Hastane & Departman',
      description: 'Çalışanın atanacağı hastane ve departmanı seçin',
      icon: <BusinessIcon />,
    },
    {
      label: 'Roller',
      description: 'Çalışanın rollerini seçin',
      icon: <CheckCircleIcon />,
    },
    {
      label: 'Onay',
      description: 'Bilgileri kontrol edin ve onaylayın',
      icon: <CheckCircleIcon />,
    },
  ];

  useEffect(() => {
    if (open) {
      loadHospitals();
      loadCurrentUser();
      resetForm();
    }
  }, [open]);

  // Yetki kontrolü - Sadece yönetici roller çalışan ekleyebilir
  const canCreateEmployee = (): boolean => {
    if (!currentUser?.roles) return false;
    
    // Yönetici roller
    const managerRoles: string[] = [Role.SystemAdmin, Role.HospitalDirector, Role.DepartmentManager, Role.DepartmentLeader];
    
    // Eğer kullanıcının herhangi bir yönetici rolü varsa çalışan ekleyebilir
    return currentUser.roles.some(role => managerRoles.includes(role));
  };

  useEffect(() => {
    if (formData.hospitalId) {
      loadDepartmentsByHospital(formData.hospitalId);
    } else {
      setDepartments([]);
    }
  }, [formData.hospitalId]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      roles: [],
      departmentId: (user?.roles?.includes('DepartmentManager') || user?.roles?.includes('DepartmentLeader')) ? user?.departmentId || '' : '',
      hospitalId: user?.hospitalId || '',
    });
    setActiveStep(0);
    setError(null);
    setErrors({});
  };

  const loadCurrentUser = async () => {
    try {
      const user = await employeeService.getMyInfos();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

  const loadHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const data = await hospitalService.getAll();
      // Sadece kullanıcının hastanesini göster
      const userHospital = data.filter(hospital => hospital.id === user?.hospitalId);
      setHospitals(userHospital);
    } catch (err) {
      console.error('Error loading hospitals:', err);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const loadDepartmentsByHospital = async (hospitalId: string) => {
    try {
      setLoadingDepartments(true);
      const data = await departmentService.getByHospital(hospitalId);
      
      // Department Manager/Leader ise sadece kendi departmanını göster
      if (user?.roles?.includes('DepartmentManager') || user?.roles?.includes('DepartmentLeader')) {
        const userDepartment = data.filter(dept => dept.id === user?.departmentId);
        setDepartments(userDepartment);
      } else {
        setDepartments(data);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Rol hiyerarşi mantığı
  const getAvailableRoles = (): { value: Role; label: string }[] => {
    if (!currentUser?.roles) return [];

    const roleOptions = [
      { value: Role.SystemAdmin, label: 'Sistem Yöneticisi', level: 1 },
      { value: Role.HospitalDirector, label: 'Hastane Müdürü', level: 2 },
      { value: Role.DepartmentManager, label: 'Departman Müdürü', level: 3 },
      { value: Role.DepartmentLeader, label: 'Departman Lideri', level: 4 },
      { value: Role.Doctor, label: 'Doktor', level: 5 },
      { value: Role.Nurse, label: 'Hemşire', level: 6 },
      { value: Role.Staff, label: 'Personel', level: 7 },
    ];

    // Kullanıcının en yüksek yetkili rolünü bul
    const userRoles = currentUser.roles;
    const userHighestLevel = Math.min(
      ...userRoles.map(role => 
        roleOptions.find(opt => opt.value === role)?.level || 999
      )
    );

    // SystemAdmin ise tüm rolleri verebilir, diğerleri sadece alt seviye rolleri verebilir
    if (userHighestLevel === 1) { // SystemAdmin
      return roleOptions.map(role => ({ value: role.value, label: role.label }));
    } else {
      // Diğer roller sadece kendi seviyelerinden düşük rolleri verebilir
      return roleOptions
        .filter(role => role.level > userHighestLevel)
        .map(role => ({ value: role.value, label: role.label }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
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
    }

    if (step === 1) {
      if (!formData.hospitalId?.trim()) {
        newErrors.hospitalId = 'Hastane seçimi gereklidir';
      }
      if (!formData.departmentId?.trim()) {
        newErrors.departmentId = 'Departman seçimi gereklidir';
      }
    }

    if (step === 2) {
      if (!formData.roles || formData.roles.length === 0) {
        newErrors.roles = 'En az bir rol seçilmelidir';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateEmployeeRequest) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }
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

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setActiveStep(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Creating employee with data:', formData);
      await employeeService.create(formData);
      console.log('Employee created successfully');

      onSubmit();
      resetForm();
    } catch (err: any) {
      console.error('Error creating employee:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Form data being sent:', formData);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.title || 
                          err.message || 
                          'Çalışan oluşturulurken bir hata oluştu.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
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
                placeholder="Çalışanın adını girin"
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
                placeholder="Çalışanın soyadını girin"
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
                placeholder="ornek@hastane.com"
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
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
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

            <FormControl 
              fullWidth 
              disabled={loading || loadingDepartments || (user?.roles?.includes('DepartmentManager') || user?.roles?.includes('DepartmentLeader'))} 
              error={!!errors.departmentId}
            >
              <InputLabel>Departman</InputLabel>
              <Select
                value={formData.departmentId}
                onChange={handleInputChange('departmentId')}
                label="Departman"
                required
                readOnly={user?.roles?.includes('DepartmentManager') || user?.roles?.includes('DepartmentLeader')}
                sx={{
                  '& .MuiSelect-select': {
                    backgroundColor: (user?.roles?.includes('DepartmentManager') || user?.roles?.includes('DepartmentLeader')) 
                      ? '#f5f5f5' 
                      : formData.departmentId ? '#e8f5e8' : 'transparent',
                    color: (user?.roles?.includes('DepartmentManager') || user?.roles?.includes('DepartmentLeader')) 
                      ? '#666' 
                      : formData.departmentId ? '#2e7d32' : 'inherit',
                    fontWeight: formData.departmentId ? 600 : 'normal',
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
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <FormControl fullWidth disabled={loading} error={!!errors.roles}>
              <InputLabel>Roller</InputLabel>
              <Select
                multiple
                value={formData.roles || []}
                onChange={handleRoleChange}
                input={<OutlinedInput label="Roller" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const role = getAvailableRoles().find(r => r.value === value);
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
                {getAvailableRoles().map((role) => (
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
        );

      case 3:
        return (
          <Box sx={{ pt: 2 }}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Oluşturulacak Çalışan Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ad Soyad
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formData.firstName} {formData.lastName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    E-posta
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formData.email}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Telefon
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formData.phoneNumber || 'Belirtilmemiş'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hastane
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {hospitals.find(h => h.id === formData.hospitalId)?.name} - {hospitals.find(h => h.id === formData.hospitalId)?.city}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Departman
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {departments.find(d => d.id === formData.departmentId)?.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Roller
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.roles?.map((role) => {
                      const roleInfo = getAvailableRoles().find(r => r.value === role);
                      return (
                        <Chip 
                          key={role} 
                          label={roleInfo?.label || role} 
                          size="small"
                          color="primary"
                          variant="filled"
                          sx={{
                            backgroundColor: '#ff9800',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  // Yetki kontrolü
  if (open && !canCreateEmployee()) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon color="error" />
            <Typography variant="h5" component="div">
              Yetki Hatası
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Çalışan Ekleyemezsiniz
            </Typography>
            <Typography variant="body2">
              DepartmentLeader, Doctor, Nurse ve Staff rolleri çalışan ekleyemez. 
              Sadece kendi profilinizi düzenleyebilirsiniz.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="contained">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '700px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="h5" component="div">
            Yeni Çalışan Oluştur
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={({ active, completed }) => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                      color: 'white',
                    }}
                  >
                    {completed ? <CheckCircleIcon /> : step.icon}
                  </Box>
                )}
              >
                <Box>
                  <Typography variant="h6" fontWeight="medium">
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          size="large"
        >
          İptal
        </Button>
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
            size="large"
          >
            Geri
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={loading}
            size="large"
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            İleri
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            sx={{ 
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark',
              },
              '&:disabled': {
                bgcolor: 'success.light',
              }
            }}
          >
            {loading ? 'Oluşturuluyor...' : 'Çalışanı Oluştur'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateEmployeeForm;
