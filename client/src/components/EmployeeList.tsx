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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
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
import { Role } from '../types/employee';
import type { Department } from '../types/department';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import EmployeeForm from './EmployeeForm';
import CreateEmployeeForm from './CreateEmployeeForm';

const EmployeeList: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Çalışan yönetimi yetkilendirme kontrolü
  const canManageEmployees = () => {
    if (!user?.roles) return false;
    const managerRoles: string[] = [Role.SystemAdmin, Role.HospitalDirector, Role.DepartmentManager, Role.DepartmentLeader];
    return user.roles.some(role => managerRoles.includes(role));
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    employee: Employee | null;
  }>({ open: false, employee: null });
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    loadEmployees();
    loadDepartments();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, selectedDepartment, selectedRole]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAll();
      console.log('Loaded employees:', data); // Debug için
      
      // Kullanıcının hastanesindeki çalışanları filtrele
      const filteredEmployees = data.filter(emp => emp.hospitalId === user?.hospitalId);
      setEmployees(filteredEmployees);
    } catch (err) {
      setError('Çalışanlar yüklenirken bir hata oluştu.');
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      // Kullanıcının hastanesindeki departmanları filtrele
      const filteredDepartments = data.filter(dept => dept.hospitalId === user?.hospitalId);
      setDepartments(filteredDepartments);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await employeeService.getMyInfos();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

  // Yetki kontrol fonksiyonları

  const canEditEmployee = (employee: Employee): boolean => {
    if (!user?.roles) return false;
    
    // SystemAdmin herkesi edit edebilir
    if (user.roles.includes(Role.SystemAdmin)) return true;
    
    // HospitalDirector sadece SystemAdmin dışındakileri edit edebilir
    if (user.roles.includes(Role.HospitalDirector)) {
      return !employee.roles.includes(Role.SystemAdmin);
    }
    
    // DepartmentManager sadece SystemAdmin ve HospitalDirector dışındakileri edit edebilir
    if (user.roles.includes(Role.DepartmentManager)) {
      return !employee.roles.includes(Role.SystemAdmin) && !employee.roles.includes(Role.HospitalDirector);
    }
    
    // DepartmentLeader, Doctor, Nurse, Staff sadece kendilerini edit edebilir (çalışan listesinden değil, sadece profilden)
    if (user.roles.includes(Role.DepartmentLeader) || 
        user.roles.includes(Role.Doctor) || 
        user.roles.includes(Role.Nurse) || 
        user.roles.includes(Role.Staff)) {
      return false; // Çalışan listesinden edit edemezler
    }
    
    return false;
  };

  const canDeleteEmployee = (employee: Employee): boolean => {
    if (!user?.roles) return false;
    
    // SystemAdmin herkesi silebilir
    if (user.roles.includes(Role.SystemAdmin)) return true;
    
    // HospitalDirector sadece SystemAdmin dışındakileri silebilir
    if (user.roles.includes(Role.HospitalDirector)) {
      return !employee.roles.includes(Role.SystemAdmin);
    }
    
    // DepartmentManager sadece SystemAdmin ve HospitalDirector dışındakileri silebilir
    if (user.roles.includes(Role.DepartmentManager)) {
      return !employee.roles.includes(Role.SystemAdmin) && !employee.roles.includes(Role.HospitalDirector);
    }
    
    // DepartmentLeader, Doctor, Nurse, Staff hiç kimseyi silemez
    if (user.roles.includes(Role.DepartmentLeader) || 
        user.roles.includes(Role.Doctor) || 
        user.roles.includes(Role.Nurse) || 
        user.roles.includes(Role.Staff)) {
      return false; // Hiç kimseyi silemezler
    }
    
    return false;
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Departman filtresi
    if (selectedDepartment) {
      filtered = filtered.filter(employee => 
        employee.department === selectedDepartment
      );
    }

    // Rol filtresi
    if (selectedRole) {
      filtered = filtered.filter(employee => 
        employee.roles && employee.roles.includes(selectedRole)
      );
    }

    setFilteredEmployees(filtered);
  };

  const clearFilters = () => {
    setSelectedDepartment('');
    setSelectedRole('');
  };

  // Rol seçenekleri
  const roleOptions = [
    { value: 'SystemAdmin', label: 'Sistem Yöneticisi' },
    { value: 'HospitalDirector', label: 'Hastane Müdürü' },
    { value: 'DepartmentManager', label: 'Departman Müdürü' },
    { value: 'DepartmentLeader', label: 'Departman Lideri' },
    { value: 'Doctor', label: 'Doktor' },
    { value: 'Nurse', label: 'Hemşire' },
    { value: 'Staff', label: 'Personel' },
  ];

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

  const handleCreateFormClose = () => {
    setOpenCreateForm(false);
  };

  const handleCreateFormSubmit = async () => {
    await loadEmployees();
    handleCreateFormClose();
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
        <Box>
          <Typography variant="body2" color="text.secondary">
            {filteredEmployees.length} / {employees.length} çalışan
          </Typography>
        </Box>
        {canManageEmployees() && (
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={() => setOpenCreateForm(true)}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Yeni Çalışan
          </Button>
        )}
      </Box>

      {/* Filtre Kartı */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtreler
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
                <InputLabel>Rol</InputLabel>
                <Select
                  value={selectedRole}
                  label="Rol"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {roleOptions.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
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
        </CardContent>
      </Card>

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
              {canManageEmployees() && <TableCell align="center">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      src={employee.profileImageUrl}
                      sx={{ mr: 2, bgcolor: 'primary.main' }}
                    >
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
                {canManageEmployees() && (
                  <TableCell align="center">
                    {canEditEmployee(employee) && (
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
                    )}
                    {canDeleteEmployee(employee) && (
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
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredEmployees.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {employees.length === 0 
              ? 'Henüz çalışan bulunmuyor'
              : 'Seçilen filtreye uygun çalışan bulunmuyor'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {employees.length === 0 
              ? 'Çalışanlar Auth sistemi üzerinden kaydedilir'
              : 'Filtreleri değiştirerek tekrar deneyin'
            }
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

      {/* Create Employee Form */}
      <CreateEmployeeForm
        open={openCreateForm}
        onClose={handleCreateFormClose}
        onSubmit={handleCreateFormSubmit}
      />
    </Box>
  );
};

export default EmployeeList;
