import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
} from '@mui/icons-material';
import { authService } from '../services/authService';

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
}

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.currentPassword.trim()) {
      setError('Mevcut şifre gereklidir');
      return false;
    }

    if (!formData.newPassword.trim()) {
      setError('Yeni şifre gereklidir');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Yeni şifre mevcut şifre ile aynı olamaz');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess('Şifre başarıyla değiştirildi');
      
      // Form'u temizle
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // 2 saniye sonra dialog'u kapat
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Şifre Değiştir</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Mevcut Şifre"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange('currentPassword')}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Yeni Şifre"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              required
              disabled={loading}
              helperText="En az 6 karakter olmalıdır"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Yeni Şifre (Tekrar)"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
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
            startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
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
            {loading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PasswordChangeDialog;
