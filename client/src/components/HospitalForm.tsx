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
} from '@mui/material';
import type { Hospital, CreateHospitalRequest, UpdateHospitalRequest } from '../types/hospital';
import { hospitalService } from '../services/hospitalService';
import { employeeService } from '../services/employeeService';
import type { Employee } from '../types/employee';

interface HospitalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  hospital?: Hospital | null;
}

const HospitalForm: React.FC<HospitalFormProps> = ({
  open,
  onClose,
  onSubmit,
  hospital,
}) => {
  const [formData, setFormData] = useState<CreateHospitalRequest>({
    name: '',
    phone: '',
    district: '',
    city: '',
    address: '',
    email: '',
    website: '',
    directorId: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const isEdit = !!hospital;

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name,
        phone: hospital.phone,
        district: hospital.district,
        city: hospital.city,
        address: hospital.address,
        email: hospital.email,
        website: hospital.website,
        directorId: hospital.directorId,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        district: '',
        city: '',
        address: '',
        email: '',
        website: '',
        directorId: undefined,
      });
    }
    setError(null);
    setErrors({});
  }, [hospital, open]);

  useEffect(() => {
    if (open) {
      loadEmployees();
    }
  }, [open]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeeService.getAll();
      // Sadece HospitalDirector rolü olan çalışanları filtrele
      const directors = data.filter(employee => 
        employee.roles && employee.roles.includes('HospitalDirector')
      );
      setEmployees(directors);
    } catch (err) {
      console.error('Error loading employees:', err);
      // Employee yükleme hatası formu bloke etmesin
    } finally {
      setLoadingEmployees(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Hastane adı gereklidir';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'İlçe gereklidir';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Şehir gereklidir';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Geçerli bir web sitesi URL\'i giriniz (http:// veya https:// ile başlamalı)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateHospitalRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
    // Website alanı için https otomatik ekle
    if (field === 'website' && value && !value.startsWith('http://') && !value.startsWith('https://')) {
      value = 'https://' + value;
    }
    
    // Telefon alanı için format uygula
    if (field === 'phone') {
      // Sadece rakamları al
      const numbers = value.replace(/\D/g, '');
      
      // (555) formatında başla
      if (numbers.length > 0) {
        if (numbers.length <= 3) {
          value = `(${numbers}`;
        } else if (numbers.length <= 6) {
          value = `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        } else {
          value = `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
        }
      }
    }
    
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit && hospital) {
        const updateData: UpdateHospitalRequest = {
          name: formData.name,
          phone: formData.phone,
          district: formData.district,
          city: formData.city,
          address: formData.address,
          email: formData.email,
          website: formData.website,
          directorId: formData.directorId,
        };
        await hospitalService.update(hospital.id, updateData);
      } else {
        await hospitalService.create(formData);
      }

      onSubmit();
    } catch (err: any) {
      setError(
        isEdit
          ? 'Hastane güncellenirken bir hata oluştu.'
          : 'Hastane oluşturulurken bir hata oluştu.'
      );
      console.error('Error saving hospital:', err);
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
          {isEdit ? 'Hastane Düzenle' : 'Yeni Hastane Ekle'}
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
            <TextField
              fullWidth
              label="Hastane Adı"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
              disabled={loading}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone || 'Örnek: (555) 123-4567'}
                required
                disabled={loading}
                placeholder="(555) 123-4567"
              />
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
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Şehir"
                value={formData.city}
                onChange={handleInputChange('city')}
                error={!!errors.city}
                helperText={errors.city}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="İlçe"
                value={formData.district}
                onChange={handleInputChange('district')}
                error={!!errors.district}
                helperText={errors.district}
                required
                disabled={loading}
              />
            </Box>

            <TextField
              fullWidth
              label="Adres"
              value={formData.address}
              onChange={handleInputChange('address')}
              error={!!errors.address}
              helperText={errors.address}
              required
              multiline
              rows={2}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Web Sitesi"
              value={formData.website}
              onChange={handleInputChange('website')}
              error={!!errors.website}
              helperText={errors.website || 'Örnek: https://www.hastane.com'}
              disabled={loading}
              placeholder="https://www.hastane.com"
            />

            <FormControl fullWidth disabled={loading || loadingEmployees}>
              <InputLabel>Direktör</InputLabel>
              <Select
                value={formData.directorId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, directorId: e.target.value || undefined }))}
                label="Direktör"
                sx={{
                  '& .MuiSelect-select': {
                    backgroundColor: formData.directorId ? '#fff3e0' : 'transparent',
                    color: formData.directorId ? '#f57c00' : 'inherit',
                    fontWeight: formData.directorId ? 600 : 'normal',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: formData.directorId ? '#f57c00' : 'inherit',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: formData.directorId ? '#ef6c00' : 'inherit',
                  },
                }}
              >
                <MenuItem value="">
                  <em>Direktör seçiniz (opsiyonel)</em>
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem 
                    key={employee.id} 
                    value={employee.id}
                    sx={{
                      backgroundColor: formData.directorId === employee.id ? '#fff3e0' : 'transparent',
                      color: formData.directorId === employee.id ? '#f57c00' : 'inherit',
                      fontWeight: formData.directorId === employee.id ? 600 : 'normal',
                      '&:hover': {
                        backgroundColor: formData.directorId === employee.id ? '#ffe0b2' : '#f5f5f5',
                      }
                    }}
                  >
                    {employee.firstName} {employee.lastName}
                  </MenuItem>
                ))}
              </Select>
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
            {loading
              ? (isEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...')
              : (isEdit ? 'Güncelle' : 'Oluştur')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HospitalForm;
