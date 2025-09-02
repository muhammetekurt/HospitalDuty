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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { Hospital } from '../types/hospital';
import { hospitalService } from '../services/hospitalService';
import HospitalForm from '../components/HospitalForm';

const HospitalList: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    hospital: Hospital | null;
  }>({ open: false, hospital: null });

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hospitalService.getAll();
      console.log('Loaded hospitals:', data); // Debug için
      setHospitals(data);
    } catch (err) {
      setError('Hastaneler yüklenirken bir hata oluştu.');
      console.error('Error loading hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHospital(null);
    setOpenForm(true);
  };

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setOpenForm(true);
  };

  const handleDelete = (hospital: Hospital) => {
    setDeleteDialog({ open: true, hospital });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.hospital) return;

    try {
      await hospitalService.delete(deleteDialog.hospital.id);
      await loadHospitals();
      setDeleteDialog({ open: false, hospital: null });
    } catch (err) {
      setError('Hastane silinirken bir hata oluştu.');
      console.error('Error deleting hospital:', err);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingHospital(null);
  };

  const handleFormSubmit = async () => {
    await loadHospitals();
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
        <Typography variant="h4" component="h1">
          Hastaneler
        </Typography>
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
          Yeni Hastane
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
              <TableCell>Hastane Adı</TableCell>
              <TableCell>İletişim</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Direktör</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hospitals.map((hospital) => (
              <TableRow key={hospital.id} hover>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {hospital.name}
                  </Typography>
                  {hospital.website && (
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <WebsiteIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {hospital.website}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Box>
                    {hospital.phone && (
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <PhoneIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{hospital.phone}</Typography>
                      </Box>
                    )}
                    {hospital.email && (
                      <Box display="flex" alignItems="center">
                        <EmailIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{hospital.email}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Box>
                      <Typography variant="body2">
                        {hospital.district}, {hospital.city}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {hospital.address}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {hospital.director && hospital.director.firstName && hospital.director.lastName ? (
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {hospital.director.firstName} {hospital.director.lastName}
                      </Typography>
                    </Box>
                  ) : (
                    <Chip label="Atanmamış" size="small" color="default" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(hospital)}
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
                    onClick={() => handleDelete(hospital)}
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

      {hospitals.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Henüz hastane bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            İlk hastaneyi eklemek için yukarıdaki butona tıklayın
          </Typography>
        </Box>
      )}

      {/* Hospital Form Dialog */}
      <HospitalForm
        open={openForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        hospital={editingHospital}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, hospital: null })}
      >
        <DialogTitle>Hastane Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{deleteDialog.hospital?.name}" hastanesini silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, hospital: null })}>
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

export default HospitalList;
