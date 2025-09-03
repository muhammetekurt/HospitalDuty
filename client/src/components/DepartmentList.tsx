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
  Pagination,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import type { Department } from '../types/department';
import { departmentService } from '../services/departmentService';
import DepartmentForm from './DepartmentForm';

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    department: Department | null;
  }>({ open: false, department: null });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentService.getAll();
      console.log('Loaded departments:', data); // Debug için
      setDepartments(data);
    } catch (err) {
      setError('Departmanlar yüklenirken bir hata oluştu.');
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = departments.slice(startIndex, endIndex);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setOpenForm(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setOpenForm(true);
  };

  const handleDelete = (department: Department) => {
    setDeleteDialog({ open: true, department });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.department) return;

    try {
      await departmentService.delete(deleteDialog.department.id);
      await loadDepartments();
      setDeleteDialog({ open: false, department: null });
    } catch (err) {
      setError('Departman silinirken bir hata oluştu.');
      console.error('Error deleting department:', err);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingDepartment(null);
  };

  const handleFormSubmit = async () => {
    await loadDepartments();
    handleFormClose();
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
          <Typography variant="h4" component="h1">
            Departmanlar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {departments.length} departman - Sayfa {currentPage} / {totalPages}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ 
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }}
        >
          Yeni Departman
        </Button>
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
              <TableCell>Departman Adı</TableCell>
              <TableCell>Hastane</TableCell>
              <TableCell>Lokasyon</TableCell>
              <TableCell>Müdür</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentDepartments.map((department) => (
              <TableRow key={department.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      {department.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {department.hospital.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {department.hospital.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Box>
                      <Typography variant="body2">
                        {department.hospital.district}, {department.hospital.city}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {department.hospital.address}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {department.manager && department.manager.firstName && department.manager.lastName ? (
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {department.manager.firstName} {department.manager.lastName}
                      </Typography>
                    </Box>
                  ) : (
                    <Chip label="Atanmamış" size="small" color="default" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(department)}
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
                    onClick={() => handleDelete(department)}
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

      {/* Pagination */}
      {departments.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      )}

      {departments.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Henüz departman bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            İlk departmanı eklemek için yukarıdaki butona tıklayın
          </Typography>
        </Box>
      )}

      {/* Department Form Dialog */}
      <DepartmentForm
        open={openForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        department={editingDepartment}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, department: null })}
      >
        <DialogTitle>Departman Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{deleteDialog.department?.name}" departmanını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, department: null })}>
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

export default DepartmentList;
