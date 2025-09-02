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
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/department';
import { departmentService } from '../services/departmentService';
import { hospitalService } from '../services/hospitalService';
import { employeeService } from '../services/employeeService';
import type { Hospital } from '../types/hospital';
import type { Employee } from '../types/employee';

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  department?: Department | null;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  open,
  onClose,
  onSubmit,
  department,
}) => {
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    name: '',
    hospitalId: '',
    managerId: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const isEdit = !!department;

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        hospitalId: department.hospitalId,
        managerId: department.managerId,
      });
    } else {
      setFormData({
        name: '',
        hospitalId: '',
        managerId: undefined,
      });
    }
    setError(null);
    setErrors({});
  }, [department, open]);

  useEffect(() => {
    if (open) {
      loadHospitals();
      loadEmployees();
    }
  }, [open]);

  useEffect(() => {
    if (formData.hospitalId) {
      loadEmployeesByHospital(formData.hospitalId);
    }
  }, [formData.hospitalId]);

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

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadEmployeesByHospital = async (hospitalId: string) => {
    try {
      const data = await employeeService.getByHospital(hospitalId);
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees by hospital:', err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Departman adı gereklidir';
    }

    if (!formData.hospitalId.trim()) {
      newErrors.hospitalId = 'Hastane seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateDepartmentRequest) => (
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit && department) {
        const updateData: UpdateDepartmentRequest = {
          name: formData.name,
          hospitalId: formData.hospitalId,
          managerId: formData.managerId,
        };
        await departmentService.update(department.id, updateData);
      } else {
        await departmentService.create(formData);
      }

      onSubmit();
    } catch (err: any) {
      setError(
        isEdit
          ? 'Departman güncellenirken bir hata oluştu.'
          : 'Departman oluşturulurken bir hata oluştu.'
      );
      console.error('Error saving department:', err);
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
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          {isEdit ? 'Departman Düzenle' : 'Yeni Departman Ekle'}
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
              label="Departman Adı"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
              disabled={loading}
            />

            <FormControl fullWidth disabled={loading || loadingHospitals} error={!!errors.hospitalId}>
              <InputLabel>Hastane</InputLabel>
              <Select
                value={formData.hospitalId}
                onChange={handleInputChange('hospitalId')}
                label="Hastane"
                required
              >
                {hospitals.map((hospital) => (
                  <MenuItem key={hospital.id} value={hospital.id}>
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

            <FormControl fullWidth disabled={loading || loadingEmployees}>
              <InputLabel>Müdür</InputLabel>
              <Select
                value={formData.managerId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value || undefined }))}
                label="Müdür"
              >
                <MenuItem value="">
                  <em>Müdür seçiniz (opsiyonel)</em>
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
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

export default DepartmentForm;
