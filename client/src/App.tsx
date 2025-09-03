
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Box, Tabs, Tab, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import HospitalList from './components/HospitalList';
import DepartmentList from './components/DepartmentList';
import EmployeeList from './components/EmployeeList';
import Login from './components/Login';
import Profile from './components/Profile';
import ShiftPreferenceList from './components/ShiftPreferenceList';
import ShiftPreferenceDialog from './components/ShiftPreferenceDialog';
import ShiftList from './components/ShiftList';
import ShiftForm from './components/ShiftForm';
import { shiftService } from './services/shiftService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#457b9d', // Ana mavi
      light: '#a8dadc', // Açık mavi
      dark: '#1d3557', // Koyu mavi
      contrastText: '#f1faee', // Beyaz metin
    },
    secondary: {
      main: '#e63946', // Kırmızı
      light: '#f1faee', // Açık krem
      dark: '#1d3557', // Koyu mavi
      contrastText: '#f1faee', // Beyaz metin
    },
    background: {
      default: '#f1faee', // Açık krem arka plan
      paper: '#ffffff', // Beyaz kağıt
    },
    text: {
      primary: '#1d3557', // Koyu mavi metin
      secondary: '#457b9d', // Orta mavi metin
    },
    error: {
      main: '#e63946', // Kırmızı hata
    },
    warning: {
      main: '#e63946', // Kırmızı uyarı
    },
    info: {
      main: '#457b9d', // Mavi bilgi
    },
    success: {
      main: '#457b9d', // Mavi başarı
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      color: '#1d3557',
      fontWeight: 600,
    },
    h6: {
      color: '#1d3557',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1d3557',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(29, 53, 87, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(29, 53, 87, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(29, 53, 87, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#a8dadc',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#1d3557',
          fontWeight: 600,
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openShiftPreferenceDialog, setOpenShiftPreferenceDialog] = React.useState(false);
  const [openShiftFormDialog, setOpenShiftFormDialog] = React.useState(false);
  const [editingShift, setEditingShift] = React.useState<any>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
  };

  const handleProfile = () => {
    setCurrentTab(5); // Profile tab (Vardiyalar'dan sonra)
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          sx={{ bgcolor: 'background.default' }}
        >
          <Typography>Yükleniyor...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img 
                src="/hospital.jpeg" 
                alt="Hospital Logo" 
                style={{ 
                  height: '40px', 
                  width: '40px', 
                  borderRadius: '8px',
                  objectFit: 'cover'
                }} 
              />
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Hospital Duty Management
            </Typography>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
              }}
            >
              <Tab label="Hastaneler" />
              <Tab label="Departmanlar" />
              <Tab label="Çalışanlar" />
              <Tab label="Shift Tercihleri" />
              <Tab label="Vardiyalar" />
              <Tab label="Profil" />
            </Tabs>
            
            <Box sx={{ ml: 2 }}>
              <IconButton
                size="large"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar 
                  src={user?.profileImageUrl}
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                >
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfile}>
                  <AccountCircle sx={{ mr: 1 }} />
                  Profil
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Çıkış Yap
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {currentTab === 0 && <HospitalList />}
          {currentTab === 1 && <DepartmentList />}
          {currentTab === 2 && <EmployeeList />}
          {currentTab === 3 && (
            <ShiftPreferenceList 
              key={refreshKey}
              showAddButton={true}
              onAddClick={() => setOpenShiftPreferenceDialog(true)}
            />
          )}
          {currentTab === 4 && (
            <ShiftList 
              key={refreshKey}
              showAddButton={true}
              onAddClick={() => {
                setEditingShift(null);
                setOpenShiftFormDialog(true);
              }}
              onEditClick={(shift) => {
                setEditingShift(shift);
                setOpenShiftFormDialog(true);
              }}
              onDeleteClick={async (shift) => {
                try {
                  await shiftService.deleteShift(shift.id);
                  setRefreshKey(prev => prev + 1);
                } catch (error) {
                  console.error('Delete error:', error);
                }
              }}
            />
          )}
          {currentTab === 5 && (
            <Profile />
          )}
        </Container>

        {/* Shift Preference Dialog */}
        <ShiftPreferenceDialog
          open={openShiftPreferenceDialog}
          onClose={() => setOpenShiftPreferenceDialog(false)}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
          }}
        />

        {/* Shift Form Dialog */}
        <ShiftForm
          open={openShiftFormDialog}
          onClose={() => {
            setOpenShiftFormDialog(false);
            setEditingShift(null);
          }}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingShift(null);
          }}
          shift={editingShift}
          isEdit={!!editingShift}
        />
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
export default App
