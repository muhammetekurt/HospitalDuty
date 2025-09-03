import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Button,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { shiftService } from '../services/shiftService';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import ShiftForm from './ShiftForm';
import DepartmentForm from './DepartmentForm';
import type { Shift } from '../types/shift';
import type { Employee } from '../types/employee';
import type { Department } from '../types/department';

interface DashboardProps {
  onTabChange: (tabIndex: number) => void;
}

interface DashboardStats {
  todayShifts: Shift[];
  topDoctors: Array<{
    employee: Employee;
    shiftCount: number;
  }>;
  departments: Department[];
  employees: Employee[];
  totalEmployees: number;
  activeShifts: number;
  totalDepartments: number;
  monthlyShifts: number;
  upcomingShifts: Shift[];

  notifications: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
  }>;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayShifts: [],
    topDoctors: [],
    departments: [],
    employees: [],
    totalEmployees: 0,
    activeShifts: 0,
    totalDepartments: 0,
    monthlyShifts: 0,
    upcomingShifts: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shiftFormOpen, setShiftFormOpen] = useState(false);
  const [departmentFormOpen, setDepartmentFormOpen] = useState(false);

  // Navigation functions
  const navigateToEmployees = () => {
    onTabChange(3); // EmployeeList tab
  };

  const navigateToShifts = () => {
    onTabChange(5); // ShiftList tab
  };

  const navigateToDepartments = () => {
    onTabChange(2); // DepartmentList tab
  };

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

      // Yaklaşan nöbetleri hesapla (gelecek 7 gün)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingShifts = allShifts.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate > today && shiftDate <= nextWeek;
      });

      // Aktif nöbetleri hesapla (şu anda devam eden)
      const now = new Date();
      const activeShifts = allShifts.filter(shift => {
        const startTime = new Date(shift.startTime);
        const endTime = new Date(shift.endTime);
        return startTime <= now && endTime >= now;
      });



      // Bildirimleri hesapla
      const notifications = [];
      
      // Eksik nöbet atamaları kontrolü
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowShifts = allShifts.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate.toDateString() === tomorrow.toDateString();
      });
      
      if (tomorrowShifts.length === 0) {
        notifications.push({
          id: 'no-shifts-tomorrow',
          type: 'warning' as const,
          title: 'Yarın Nöbet Ataması Yok',
          message: 'Yarın için hiç nöbet ataması bulunmuyor. Lütfen kontrol edin.',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Yaklaşan nöbet hatırlatması
      const nextShift = upcomingShifts[0];
      if (nextShift) {
        const nextShiftDate = new Date(nextShift.startTime);
        const hoursUntilShift = (nextShiftDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilShift <= 24 && hoursUntilShift > 0) {
          const employee = employees.find(emp => emp.id === nextShift.employeeId);
          notifications.push({
            id: `shift-reminder-${nextShift.id}`,
            type: 'info' as const,
            title: 'Yaklaşan Nöbet',
            message: `${employee?.firstName} ${employee?.lastName} için ${Math.round(hoursUntilShift)} saat sonra nöbet başlıyor.`,
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      // Departman yöneticisi eksikliği
      const departmentsWithoutManager = departments.filter(dept => !dept.manager);
      if (departmentsWithoutManager.length > 0) {
        notifications.push({
          id: 'departments-without-manager',
          type: 'error' as const,
          title: 'Yöneticisiz Departmanlar',
          message: `${departmentsWithoutManager.length} departmanın yöneticisi atanmamış.`,
          timestamp: new Date().toISOString(),
        });
      }

      setStats({
        todayShifts,
        topDoctors,
        departments,
        employees,
        totalEmployees: employees.length,
        activeShifts: activeShifts.length,
        totalDepartments: departments.length,
        monthlyShifts: monthlyShifts.length,
        upcomingShifts,
        notifications,
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

      {/* İstatistik Kartları */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card sx={{ 
            background: '#e63946',
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'transform 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}
          onClick={navigateToEmployees}
          >
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <PeopleIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                {stats.totalEmployees}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Toplam Çalışan
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card sx={{ 
            background: '#457b9d',
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'transform 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}
          onClick={navigateToShifts}
          >
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <AssignmentIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                {stats.activeShifts}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Aktif Nöbet
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card sx={{ 
            background: '#a8dadc',
            color: '#1d3557',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'transform 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}
          onClick={navigateToDepartments}
          >
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <BusinessIcon sx={{ fontSize: 40, mb: 1, color: '#1d3557' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1d3557' }}>
                {stats.totalDepartments}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1d3557' }}>
                Departman
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card sx={{ 
            background: '#1d3557',
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'transform 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}
          onClick={navigateToShifts}
          >
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <ScheduleIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                {stats.monthlyShifts}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Aylık Nöbet Sayısı
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 2. Satır: Bugün Nöbetçi Staff - Hızlı İşlemler - Takvim */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {/* Bugün Nöbetçi Staff */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Günün Nöbetçileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {stats.todayShifts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Bugün nöbetçi staff bulunmuyor
                </Typography>
              ) : (
                <List>
                  {stats.todayShifts.map((shift) => {
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {employee?.department || 'Departman Bilinmiyor'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption">
                                  {formatDateTime(shift.startTime)} - {formatDateTime(shift.endTime)}
                                </Typography>
                                <Chip
                                  label={getShiftTypeLabel(shift.shiftType)}
                                  color={getShiftTypeColor(shift.shiftType) as any}
                                  size="small"
                                />
                              </Box>
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
        </Box>

        {/* Hızlı İşlemler */}
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon color="primary" />
                Hızlı İşlemler
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  fullWidth
                  onClick={() => setShiftFormOpen(true)}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Yeni Nöbet Oluştur
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  fullWidth
                  onClick={() => window.location.href = '/employees'}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Çalışan Ekle
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<BusinessIcon />}
                  fullWidth
                  onClick={() => setDepartmentFormOpen(true)}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Departman Ekle
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Rapor Oluştur
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Takvim */}
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              p: 2
            }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                Takvim
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center', 
                bgcolor: 'primary.main', 
                color: 'white',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {new Date().getDate()}
                </Typography>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
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
        </Box>
      </Box>

      {/* 3. Satır: Bu Ay En Çok Nöbet Tutan Doktorlar - Yaklaşan Nöbetler - Hastane Departmanları */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Bu Ay En Çok Nöbet Tutan Doktorlar */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Bu Ay En Çok Nöbet Tutanlar
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {stats.topDoctors.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Bu ay nöbet verisi bulunmuyor
                </Typography>
              ) : (
                <List>
                  {stats.topDoctors.map((item) => (
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
                        #{stats.topDoctors.indexOf(item) + 1}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Yaklaşan Nöbetler */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Yaklaşan Nöbetler (7 Gün)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {stats.upcomingShifts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Yaklaşan nöbet bulunmuyor
                </Typography>
              ) : (
                <List>
                  {stats.upcomingShifts.slice(0, 5).map((shift) => {
                    const employee = stats.employees.find(emp => emp.id === shift.employeeId);
                    const shiftDate = new Date(shift.startTime);
                    const isToday = shiftDate.toDateString() === new Date().toDateString();
                    const isTomorrow = shiftDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                    
                    return (
                      <ListItem key={shift.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={employee?.profileImageUrl}
                            sx={{ bgcolor: isToday ? 'error.main' : isTomorrow ? 'warning.main' : 'primary.main' }}
                          >
                            {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${employee?.firstName || 'Bilinmeyen'} ${employee?.lastName || 'Çalışan'}`}
                          secondary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {employee?.department || 'Departman Bilinmiyor'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption">
                                  {formatDateTime(shift.startTime)}
                                </Typography>
                                <Chip
                                  label={isToday ? 'Bugün' : isTomorrow ? 'Yarın' : shiftDate.toLocaleDateString('tr-TR')}
                                  color={isToday ? 'error' : isTomorrow ? 'warning' : 'default'}
                                  size="small"
                                />
                                <Chip
                                  label={getShiftTypeLabel(shift.shiftType)}
                                  color={getShiftTypeColor(shift.shiftType) as any}
                                  size="small"
                                />
                              </Box>
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
        </Box>

        {/* Hastane Departmanları */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card sx={{ height: '100%' }}>
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
                  flexDirection: 'column', 
                  gap: 2
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
        </Box>
      </Box>

      {/* Form'lar */}
      <ShiftForm
        open={shiftFormOpen}
        onClose={() => setShiftFormOpen(false)}
        onSuccess={() => {
          setShiftFormOpen(false);
          loadDashboardData(); // Verileri yenile
        }}
      />

      <DepartmentForm
        open={departmentFormOpen}
        onClose={() => {
          setDepartmentFormOpen(false);
          loadDashboardData(); // Verileri yenile
        }}
        onSubmit={() => {
          setDepartmentFormOpen(false);
          loadDashboardData(); // Verileri yenile
        }}
      />
    </Box>
  );
};
