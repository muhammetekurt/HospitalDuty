import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { shiftService } from '../services/shiftService';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import type { Shift } from '../types/shift';
import type { Employee } from '../types/employee';
import type { Department } from '../types/department';

interface DashboardStats {
  todayShifts: Shift[];
  topDoctors: Array<{
    employee: Employee;
    shiftCount: number;
  }>;
  departments: Department[];
  employees: Employee[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayShifts: [],
    topDoctors: [],
    departments: [],
    employees: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Bugünün tarihi
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // Bugünkü vardiyaları getir
      const allShifts = await shiftService.getAllShifts();
      const todayShifts = allShifts.filter(shift => 
        shift.startTime.startsWith(todayString)
      );

      // Çalışanları getir
      const employees = await employeeService.getAll();

      // Bu ay en çok nöbet tutan doktorları hesapla
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const monthlyShifts = allShifts.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate.getMonth() === currentMonth && 
               shiftDate.getFullYear() === currentYear;
      });

      // Doktor shift sayılarını hesapla
      const doctorShiftCounts = new Map<string, number>();
      monthlyShifts.forEach(shift => {
        const employee = employees.find(emp => emp.id === shift.employeeId);
        if (employee && employee.roles?.includes('Doctor')) {
          const count = doctorShiftCounts.get(shift.employeeId) || 0;
          doctorShiftCounts.set(shift.employeeId, count + 1);
        }
      });

      // En çok nöbet tutan 5 doktoru al
      const topDoctors = Array.from(doctorShiftCounts.entries())
        .map(([employeeId, shiftCount]) => ({
          employee: employees.find(emp => emp.id === employeeId)!,
          shiftCount,
        }))
        .filter(item => item.employee)
        .sort((a, b) => b.shiftCount - a.shiftCount)
        .slice(0, 5);

      // Sadece kullanıcının hastanesinin departmanlarını getir
      const allDepartments = await departmentService.getAll();
      const departments = allDepartments.filter(dept => dept.hospitalId === user?.hospitalId);

      setStats({
        todayShifts,
        topDoctors,
        departments,
        employees,
      });
    } catch (err) {
      setError('Dashboard verileri yüklenirken hata oluştu');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getShiftTypeColor = (shiftType: number) => {
    switch (shiftType) {
      case 0: return 'success'; // Normal
      case 1: return 'info';    // Night
      case 2: return 'error';   // Emergency
      default: return 'default';
    }
  };

  const getShiftTypeLabel = (shiftType: number) => {
    switch (shiftType) {
      case 0: return 'Normal';
      case 1: return 'Gece';
      case 2: return 'Acil';
      default: return `Tip ${shiftType}`;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Ana Sayfa
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HospitalIcon color="primary" />
          <Typography variant="h6" color="text.secondary">
            {user?.hospitalName || 'Hastane Adı'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sol Kolon */}
        <Grid item xs={12} md={8}>
          {/* Bugün Nöbetçi Staff */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                Bugün Nöbetçi Staff
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {stats.todayShifts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Bugün nöbetçi staff bulunmuyor
                </Typography>
              ) : (
                <List>
                  {stats.todayShifts.map((shift, index) => {
                    // Çalışan bilgisini employees listesinden bul
                    const employee = stats.employees.find(emp => emp.id === shift.employeeId);
                    return (
                      <ListItem key={shift.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={employee?.profileImageUrl}
                            sx={{ bgcolor: 'primary.main' }}
                          >
                            {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${employee?.firstName || 'Bilinmeyen'} ${employee?.lastName || 'Çalışan'}`}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption">
                                {formatDateTime(shift.startTime)} - {formatDateTime(shift.endTime)}
                              </Typography>
                              <Chip
                                label={getShiftTypeLabel(shift.shiftType)}
                                color={getShiftTypeColor(shift.shiftType) as any}
                                size="small"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Bu Ay En Çok Nöbet Tutan Doktorlar */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Bu Ay En Çok Nöbet Tutan Doktorlar
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {stats.topDoctors.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Bu ay nöbet verisi bulunmuyor
                </Typography>
              ) : (
                <List>
                  {stats.topDoctors.map((item, index) => (
                    <ListItem key={item.employee.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar 
                          src={item.employee.profileImageUrl}
                          sx={{ bgcolor: 'primary.main' }}
                        >
                          {item.employee.firstName.charAt(0)}{item.employee.lastName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${item.employee.firstName} ${item.employee.lastName}`}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption">
                              {item.employee.department}
                            </Typography>
                            <Chip
                              label={`${item.shiftCount} nöbet`}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        }
                      />
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        #{index + 1}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Kolon */}
        <Grid item xs={12} md={4}>
          {/* Takvim */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                Takvim
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {new Date().getDate()}
                </Typography>
                <Typography variant="h6">
                  {new Date().toLocaleDateString('tr-TR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Typography>
                <Typography variant="body2">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long' 
                  })}
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {/* Hastane Departmanları */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                Hastane Departmanları
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {stats.departments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Departman bilgisi bulunmuyor
                </Typography>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start'
                }}>
                  {stats.departments.map((department) => (
                    <Box 
                      key={department.id} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        minWidth: '200px',
                        flex: '0 0 auto',
                        '&:hover': {
                          bgcolor: 'grey.100',
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="medium" noWrap>
                          {department.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Yönetici: {department.manager ? `${department.manager.firstName} ${department.manager.lastName}` : 'Atanmamış'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
