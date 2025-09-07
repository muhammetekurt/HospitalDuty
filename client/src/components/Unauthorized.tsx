import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container
} from '@mui/material';
import {
  Home as HomeIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            maxWidth: 400,
            width: '100%',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <BlockIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main',
                mb: 2 
              }} 
            />
            <Typography variant="h4" component="h1" gutterBottom color="error.main">
              Yetkisiz Erişim
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lütfen ana sayfaya dönün veya yetkili bir kullanıcı ile iletişime geçin.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            size="large"
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              px: 4,
              py: 1.5,
            }}
          >
            Ana Sayfaya Dön
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;
