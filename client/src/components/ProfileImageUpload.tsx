import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PhotoCamera,
  Delete
} from '@mui/icons-material';
import { employeeService } from '../services/employeeService';
import type { Employee } from '../types/employee';

interface ProfileImageUploadProps {
  employee: Employee;
  onImageUpdate?: (newImageUrl: string) => void;
  size?: number;
  showUploadButton?: boolean;
  showDeleteButton?: boolean;
  showInfoTexts?: boolean;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  employee,
  onImageUpdate,
  size = 120,
  showUploadButton = true,
  showDeleteButton = true,
  showInfoTexts = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Dosya boyutu 2MB\'dan büyük olamaz');
      return;
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece JPG, PNG ve WebP dosyaları kabul edilir');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await employeeService.uploadProfileImage(employee.id, file);
      setSuccess('Profil resmi başarıyla yüklendi!');
      
      // Callback ile parent component'i bilgilendir
      if (onImageUpdate) {
        onImageUpdate(`https://localhost:5000/profile-images/${result.fileName}`);
      }
      
      // File input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profil resmi yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = async () => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await employeeService.deleteProfileImage(employee.id);
      setSuccess('Profil resmi silindi!');
      
      if (onImageUpdate) {
        onImageUpdate('https://localhost:5000/profile-images/default-avatar.jpg');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profil resmi silinirken hata oluştu');
    } finally {
      setUploading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Profil Resmi */}
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={employee.profileImageUrl}
          alt={`${employee.firstName} ${employee.lastName}`}
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.4,
            border: '3px solid #e0e0e0',
            bgcolor: 'primary.main',
            '&:hover': {
              border: '3px solid #1976d2',
            }
          }}
        >
          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
        </Avatar>
        
        {/* Yükleme İndikatörü */}
        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
            }}
          >
            <CircularProgress size={size * 0.3} color="primary" />
          </Box>
        )}
      </Box>



      {/* Butonlar */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        {showUploadButton && (
          <Button
            variant="contained"
            startIcon={<PhotoCamera />}
            onClick={handleUploadClick}
            disabled={uploading}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
          </Button>
        )}

        {showDeleteButton && employee.profileImagePath && (
          <Tooltip title="Profil resmini sil">
            <IconButton
              color="error"
              onClick={handleDeleteClick}
              disabled={uploading}
              sx={{
                backgroundColor: '#ffebee',
                '&:hover': {
                  backgroundColor: '#ffcdd2',
                }
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Gizli File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Hata/Success Mesajları - Sadece showInfoTexts true ise göster */}
      {showInfoTexts && error && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
          {error}
        </Alert>
      )}
      
      {showInfoTexts && success && (
        <Alert severity="success" sx={{ width: '100%', maxWidth: 400 }}>
          {success}
        </Alert>
      )}

      {/* Dosya Bilgileri - Sadece showInfoTexts true ise göster */}
      {showInfoTexts && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Maksimum dosya boyutu: 2MB<br />
          Desteklenen formatlar: JPG, PNG, WebP
        </Typography>
      )}

      {/* Silme Onay Modal'ı */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Profil Resmini Sil
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Profil resminizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={uploading}
          >
            İptal
          </Button>
          <Button 
            onClick={handleDeleteImage}
            color="error"
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <Delete />}
          >
            {uploading ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
