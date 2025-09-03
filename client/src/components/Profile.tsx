import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Business as BusinessIcon,
  LocalHospital as HospitalIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../services/employeeService';
import type { UpdateEmployeeRequest } from '../types/employee';
import PasswordChangeDialog from './PasswordChangeDialog';
import ShiftPreferenceDialog from './ShiftPreferenceDialog';
import ShiftPreferenceList from './ShiftPreferenceList';
import ShiftList from './ShiftList';
import { ProfileImageUpload } from './ProfileImageUpload';

interface ProfileProps {
  onNavigateToShiftPreferences?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigateToShiftPreferences }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openShiftPreferenceDialog, setOpenShiftPreferenceDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const getRoleColor = (roles: string[] | undefined) => {
    if (!roles || roles.length === 0) return 'default';
    
    const role = roles[0];
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

  const getRoleLabel = (roles: string[] | undefined) => {
    if (!roles || roles.length === 0) return 'Personel';
    
    const role = roles[0];
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

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const updateData: UpdateEmployeeRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        roles: user.roles || [],
        departmentId: user.departmentId,
        hospitalId: user.hospitalId,
      };

      await employeeService.update(user.id, updateData);
      setSuccess('Profil başarıyla güncellendi');
      setIsEditing(false);
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Profile Card */}
        <Box sx={{ flex: { xs: '1', md: '0 0 300px' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <ProfileImageUpload
                employee={user}
                onImageUpdate={(newImageUrl) => {
                  // User objesini güncelle
                  user.profileImageUrl = newImageUrl;
                }}
                size={120}
                showUploadButton={isEditing}
                showDeleteButton={isEditing}
                showInfoTexts={isEditing}
              />
              
              <Typography variant="h5" component="h2" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              
              <Chip
                label={getRoleLabel(user.roles)}
                color={getRoleColor(user.roles) as any}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              {user.phoneNumber && (
                <Typography variant="body2" color="text.secondary">
                  {user.phoneNumber}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                >
                  Profili Düzenle
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Şifre Değiştir
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={() => {
                    if (onNavigateToShiftPreferences) {
                      onNavigateToShiftPreferences();
                    } else {
                      setOpenShiftPreferenceDialog(true);
                    }
                  }}
                >
                  Shift Tercihleri
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                >
                  Çıkış Yap
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Details Card */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kişisel Bilgiler
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Ad"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing || loading}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Soyad"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    disabled={!isEditing || loading}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={!isEditing || loading}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={formData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                    disabled={!isEditing || loading}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Box>
              </Box>

              {isEditing && (
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                İş Bilgileri
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2">Departman</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {user.department || 'Atanmamış'}
                  </Typography>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <HospitalIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2">Hastane</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {user.hospitalName || 'Atanmamış'}
                  </Typography>
                  {user.hospital?.city && (
                    <Typography variant="caption" color="text.secondary">
                      {user.hospital.city}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Shift Preferences */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Shift Tercihlerim
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  onClick={() => setOpenShiftPreferenceDialog(true)}
                  size="small"
                >
                  Yeni Tercih Ekle
                </Button>
              </Box>
              
              {user && (
                <ShiftPreferenceList key={refreshKey} employeeId={user.id} />
              )}
            </CardContent>
          </Card>

          {/* Vardiyalar */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vardiyalarım
              </Typography>
              
              {user && (
                <ShiftList 
                  key={refreshKey}
                  employeeId={user.id}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
      />

      {/* Shift Preference Dialog */}
      <ShiftPreferenceDialog
        open={openShiftPreferenceDialog}
        onClose={() => setOpenShiftPreferenceDialog(false)}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />
    </Box>
  );
};

export default Profile;
