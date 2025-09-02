import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocalHospital as HospitalIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import type { Employee } from '../types/employee';
import { employeeService } from '../services/employeeService';
import EmployeeForm from './EmployeeForm';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    employee: Employee | null;
  }>({ open: false, employee: null });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAll();
      console.log('Loaded employees:', data); // Debug için
      setEmployees(data);
    } catch (err) {
      setError('Çalışanlar yüklenirken bir hata oluştu.');
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setOpenForm(true);
  };

  const handleDelete = (employee: Employee) => {
    setDeleteDialog({ open: true, employee });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.employee) return;

    try {
      await employeeService.delete(deleteDialog.employee.id);
      await loadEmployees();
      setDeleteDialog({ open: false, employee: null });
    } catch (err) {
      setError('Çalışan silinirken bir hata oluştu.');
      console.error('Error deleting employee:', err);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingEmployee(null);
  };

  const handleFormSubmit = async () => {
    await loadEmployees();
    handleFormClose();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SystemAdmin':
        return 'error';
      case 'HospitalDirector':
        return 'primary';
      case 'DepartmentManager':
        return 'secondary';
      case 'Doctor':
        return 'success';
      case 'Nurse':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SystemAdmin':
        return 'Sistem Yöneticisi';
      case 'HospitalDirector':
        return 'Hastane Müdürü';
      case 'DepartmentManager':
        return 'Departman Müdürü';
      case 'DepartmentLeader':
        return 'Departman Lideri';
      case 'Doctor':
        return 'Doktor';
      case 'Nurse':
        return 'Hemşire';
      case 'Staff':
        return 'Personel';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Çalışanlar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Toplam {employees.length} çalışan
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Çalışan</TableCell>
              <TableCell>İletişim</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>Hastane</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {employee.id.slice(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <EmailIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{employee.email}</Typography>
                    </Box>
                    {employee.phoneNumber && (
                      <Box display="flex" alignItems="center">
                        <PhoneIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{employee.phoneNumber}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {employee.department || 'Atanmamış'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {employee.hospitalName ? (
                    <Box display="flex" alignItems="center">
                      <HospitalIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {employee.hospitalName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.hospital?.city}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Chip label="Atanmamış" size="small" color="default" />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {employee.roles && employee.roles.length > 0 ? (
                      employee.roles.map((role, index) => (
                        <Chip 
                          key={index}
                          label={getRoleLabel(role)} 
                          size="small" 
                          color={getRoleColor(role) as any}
                        />
                      ))
                    ) : (
                      <Chip 
                        label="Personel" 
                        size="small" 
                        color="default"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(employee)}
                    size="small"
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(employee)}
                    size="small"
                    sx={{ 
                      color: 'secondary.main',
                      '&:hover': {
                        bgcolor: 'secondary.light',
                        color: 'secondary.dark',
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {employees.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Henüz çalışan bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Çalışanlar Auth sistemi üzerinden kaydedilir
          </Typography>
        </Box>
      )}

      {/* Employee Form Dialog */}
      <EmployeeForm
        open={openForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        employee={editingEmployee}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, employee: null })}
      >
        <DialogTitle>Çalışan Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{deleteDialog.employee?.firstName} {deleteDialog.employee?.lastName}" çalışanını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, employee: null })}>
            İptal
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained"
            sx={{ 
              bgcolor: 'secondary.main',
              '&:hover': {
                bgcolor: 'secondary.dark',
              }
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
