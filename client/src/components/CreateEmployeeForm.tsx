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
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { CreateEmployeeRequest } from '../types/employee';
import { employeeService } from '../services/employeeService';
import { hospitalService } from '../services/hospitalService';
import { departmentService } from '../services/departmentService';
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
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    departmentId: '',
    hospitalId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

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
      label: 'Onay',
      description: 'Bilgileri kontrol edin ve onaylayın',
      icon: <CheckCircleIcon />,
    },
  ];

  useEffect(() => {
    if (open) {
      loadHospitals();
      resetForm();
    }
  }, [open]);

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
      departmentId: '',
      hospitalId: '',
    });
    setActiveStep(0);
    setError(null);
    setErrors({});
  };

  const loadHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const data = await hospitalService.getAll();
      setHospitals(data);
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
      setDepartments(data);
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setLoadingDepartments(false);
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

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
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
            <FormControl fullWidth disabled={loading || loadingHospitals} error={!!errors.hospitalId}>
              <InputLabel>Hastane</InputLabel>
              <Select
                value={formData.hospitalId}
                onChange={handleInputChange('hospitalId')}
                label="Hastane"
                required
                sx={{
                  '& .MuiSelect-select': {
                    backgroundColor: formData.hospitalId ? '#e3f2fd' : 'transparent',
                    color: formData.hospitalId ? '#1976d2' : 'inherit',
                    fontWeight: formData.hospitalId ? 600 : 'normal',
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
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

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
