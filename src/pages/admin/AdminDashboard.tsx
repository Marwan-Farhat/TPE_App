import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Settings, 
  LogOut,
  Bell,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import AdminSidebar from '@/components/admin/AdminSidebar';
import useLanguage from '@/hooks/useLanguage';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const [totalClients, setTotalClients] = useState<number>(0);

  useEffect(() => {
    const loadTotalClients = () => {
      try {
        const stored = localStorage.getItem('proenglish_clients');
        const clients = stored ? JSON.parse(stored) : [];
        setTotalClients(Array.isArray(clients) ? clients.length : 0);
      } catch (error) {
        console.error('Error reading clients from localStorage:', error);
        setTotalClients(0);
      }
    };

    loadTotalClients();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'proenglish_clients') {
        loadTotalClients();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const stats = [
    { label: t('admin.dashboard.totalClients'), value: totalClients.toLocaleString(), change: '+12%', icon: Users },
    { label: t('admin.dashboard.activeCourses'), value: '56', change: '+4%', icon: GraduationCap },
    { label: t('admin.dashboard.monthlyRevenue'), value: '$45,230', change: '+18%', icon: LayoutDashboard },
    { label: t('admin.dashboard.pendingTasks'), value: '23', change: '-5%', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Wrapper - offset by sidebar width */}
      <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-end px-6 h-16">

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {user?.fullName ? getInitials(user.fullName) : 'AD'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className={`w-56 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <DropdownMenuItem className="flex items-center">
                    {isRTL ? (
                      <>
                        <Settings className="h-4 w-4 flex-shrink-0" />
                        <span className="mr-2"> {t('admin.header.settings')}</span>
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{t('admin.header.settings')}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center justify-between cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    {isRTL ? (
                      <>
                        <div className="flex items-center">
                          {theme === 'dark' ? (
                            <Moon className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <Sun className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="mr-2"> {t('admin.header.darkMode')}</span>
                        </div>
                        <Switch
                          checked={theme === 'dark'}
                          onCheckedChange={toggleTheme}
                          className="scale-75"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          {theme === 'dark' ? (
                            <Moon className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <Sun className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span>{t('admin.header.darkMode')}</span>
                        </div>
                        <Switch
                          checked={theme === 'dark'}
                          onCheckedChange={toggleTheme}
                          className="scale-75"
                        />
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center">
                    {isRTL ? (
                      <>
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className="mr-2"> {t('admin.header.logout')}</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{t('admin.header.logout')}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t('admin.dashboard.welcome')}, {user?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') 
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/30' 
                      : 'text-red-600 bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Placeholder Content */}
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('admin.dashboard.placeholder.title')}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('admin.dashboard.placeholder.description')}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded">{t('admin.dashboard.placeholder.role')}: {user?.role}</span>
              <span className="px-2 py-1 bg-secondary rounded">{t('admin.dashboard.placeholder.interface')}: {user?.interface}</span>
            </div>
          </div>
        </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
