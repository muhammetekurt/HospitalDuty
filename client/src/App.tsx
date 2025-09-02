
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import HospitalList from './components/HospitalList';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Hospital Duty Management
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <HospitalList />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
export default App
