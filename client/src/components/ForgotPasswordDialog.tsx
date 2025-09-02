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
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { authService } from '../services/authService';

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  open,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email.trim()) {
      setError('E-posta adresi gereklidir');
      return;
    }

    if (!email.includes('@')) {
      setError('Geçerli bir e-posta adresi giriniz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre sıfırlama işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
          Şifremi Unuttum
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {!success ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              E-posta adresinizi girin. Size yeni bir şifre göndereceğiz.
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="E-posta Adresi"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </>
        ) : (
          <Box textAlign="center" py={2}>
            <CheckCircleIcon 
              sx={{ 
                fontSize: 64, 
                color: 'success.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              E-posta Gönderildi!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yeni şifreniz <strong>{email}</strong> adresine gönderildi.
              <br />
              Lütfen e-posta kutunuzu kontrol edin.
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
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
              disabled={loading || !email.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Gönderiliyor...' : 'Şifre Sıfırla'}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
          >
            Tamam
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
