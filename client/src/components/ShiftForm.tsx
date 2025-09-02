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
  Grid,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { shiftService } from '../services/shiftService';
import { employeeService } from '../services/employeeService';
import { hospitalService } from '../services/hospitalService';
import { departmentService } from '../services/departmentService';
import type { Shift, CreateShiftRequest, UpdateShiftRequest, ShiftType } from '../types/shift';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    hospitalId: '',
    departmentId: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16), // 8 saat sonra
    shiftType: 0, // Normal
    notes: ''
  });

  const shiftTypes = [
    { value: 0, label: 'Normal' },
    { value: 1, label: 'Gece' },
    { value: 2, label: 'Acil' }
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
      }
    }
  }, [open, isEdit, shift]);

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
      setError(err.response?.data?.message || 'Vardiya kaydedilirken bir hata oluştu');
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
          height: '450px'
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
            <Grid container spacing={4}>
              {/* Çalışan Seçimi */}
              <Grid item xs={12} sm={6}>
                <FormControl required sx={{ minWidth: 250 }}>
                  <InputLabel>Çalışan</InputLabel>
                  <Select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    label="Çalışan"
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Hastane Seçimi */}
              <Grid item xs={12} sm={6}>
                <FormControl required sx={{ minWidth: 250 }}>
                  <InputLabel>Hastane</InputLabel>
                  <Select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    label="Hastane"
                  >
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Departman Seçimi */}
              <Grid item xs={12} sm={6}>
                <FormControl required sx={{ minWidth: 250 }}>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    label="Departman"
                  >
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Vardiya Tipi */}
              <Grid item xs={12} sm={6}>
                <FormControl required sx={{ minWidth: 250 }}>
                  <InputLabel>Vardiya Tipi</InputLabel>
                  <Select
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                    label="Vardiya Tipi"
                  >
                    {shiftTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Başlangıç Zamanı */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Başlangıç Zamanı"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ minWidth: 250 }}
                />
              </Grid>

              {/* Bitiş Zamanı */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bitiş Zamanı"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ minWidth: 250 }}
                />
              </Grid>


            </Grid>

            {/* Notlar */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                sx={{ width: '100%' }}
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
