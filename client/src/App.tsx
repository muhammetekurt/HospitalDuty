
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Divider
} from '@mui/material';
import { 
  AccountCircle, 
  Logout, 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Groups as GroupsIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import HospitalList from './components/HospitalList';
import DepartmentList from './components/DepartmentList';
import EmployeeList from './components/EmployeeList';
import Login from './components/Login';
import Profile from './components/Profile';
import { Dashboard } from './components/Dashboard';
import ShiftPreferenceList from './components/ShiftPreferenceList';
import ShiftPreferenceDialog from './components/ShiftPreferenceDialog';
import ShiftList from './components/ShiftList';
import ShiftForm from './components/ShiftForm';
import ShiftCalendar from './components/ShiftCalendar';
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

const drawerWidth = 240;

const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [openShiftPreferenceDialog, setOpenShiftPreferenceDialog] = React.useState(false);
  const [openShiftFormDialog, setOpenShiftFormDialog] = React.useState(false);
  const [editingShift, setEditingShift] = React.useState<any>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleTabChange = (newValue: number) => {
    setCurrentTab(newValue);
    setMobileOpen(false); // Mobilde menüyü kapat
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
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
    setCurrentTab(7); // Profile tab (Shift Takvimi'nden sonra)
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Ana Sayfa', icon: <DashboardIcon />, tab: 0 },
    { text: 'Hastaneler', icon: <BusinessIcon />, tab: 1 },
    { text: 'Departmanlar', icon: <GroupsIcon />, tab: 2 },
    { text: 'Çalışanlar', icon: <PeopleIcon />, tab: 3 },
    { text: 'Shift Tercihleri', icon: <ScheduleIcon />, tab: 4 },
    { text: 'Vardiyalar', icon: <AssignmentIcon />, tab: 5 },
    { text: 'Shift Takvimi', icon: <CalendarIcon />, tab: 6 },
  ];

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          sx={{ bgcolor: 'background.default' }}
        >
          <Box
            component="img"
            src="/favicon.ico"
            alt="Hospital Duty"
            sx={{
              width: 250,
              height: 250,
              mb: 2,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.5,
                },
                '100%': {
                  opacity: 1,
                },
              },
            }}
          />
          <Typography variant="h6" color="primary">
            Yükleniyor...
          </Typography>
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

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: '#1d3557' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            }
          }}
          onClick={() => handleTabChange(0)}
        >
          <img
            src="/hospital.jpeg"
            alt="Hospital Logo"
            style={{
              height: '32px',
              width: '32px',
              borderRadius: '6px',
              objectFit: 'cover',
              marginRight: '12px'
            }}
          />
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
            Hospital Duty
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={currentTab === item.tab}
              onClick={() => handleTabChange(item.tab)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: currentTab === item.tab ? 'primary.dark' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${desktopOpen ? drawerWidth : 0}px)` },
            ml: { sm: desktopOpen ? `${drawerWidth}px` : 0 },
            transition: 'width 0.3s, margin 0.3s',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDesktopDrawerToggle}
              sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Hospital Duty Management
            </Typography>
            
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
        
        <Box
          component="nav"
          sx={{ width: { sm: desktopOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="persistent"
            open={desktopOpen}
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                transition: 'width 0.3s',
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${desktopOpen ? drawerWidth : 0}px)` },
            mt: 8, // AppBar için boşluk
            transition: 'width 0.3s',
          }}
        >
          {currentTab === 0 && <Dashboard onTabChange={setCurrentTab} />}
          {currentTab === 1 && <HospitalList />}
          {currentTab === 2 && <DepartmentList />}
          {currentTab === 3 && <EmployeeList />}
          {currentTab === 4 && (
            <ShiftPreferenceList 
              key={refreshKey}
              showAddButton={true}
              onAddClick={() => setOpenShiftPreferenceDialog(true)}
            />
          )}
          {currentTab === 5 && (
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
          {currentTab === 6 && (
            <ShiftCalendar />
          )}
          {currentTab === 7 && (
            <Profile />
          )}
        </Box>

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
