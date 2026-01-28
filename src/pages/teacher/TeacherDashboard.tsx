import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Bell,
  BookOpen,
  Clock,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

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
import logo from '@/assets/logo.png';

const TeacherDashboard = () => {
  const { t } = useTranslation();
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

  const stats = [
    { label: 'My Students', value: '48', icon: Users },
    { label: 'Active Classes', value: '6', icon: BookOpen },
    { label: 'Sessions Today', value: '4', icon: Clock },
    { label: 'Upcoming Tests', value: '12', icon: Calendar },
  ];

  const todaySchedule = [
    { time: '09:00 - 10:30', student: 'Omar Khalid', course: 'Business English', type: 'One-on-One' },
    { time: '11:00 - 12:30', student: 'Group A', course: 'General English', type: 'Group' },
    { time: '14:00 - 15:30', student: 'Layla Ahmed', course: 'IELTS Prep', type: 'One-on-One' },
    { time: '16:00 - 17:30', student: 'Group B', course: 'Teen English', type: 'Group' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="The Pro English" className="h-10" />
            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              Teacher
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                2
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-emerald-500 text-white text-xs">
                      {user?.fullName ? getInitials(user.fullName) : 'TC'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center justify-between cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center">
                    {theme === 'dark' ? (
                      <Moon className="h-4 w-4 mr-2" />
                    ) : (
                      <Sun className="h-4 w-4 mr-2" />
                    )}
                    Dark Mode
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="scale-75"
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
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
              Good morning, {user?.fullName ? (user.fullName.split(' ').find(part => !['Dr.', 'Mr.', 'Ms.', 'Mrs.'].includes(part)) ?? user.fullName.split(' ')[0]) : 'Teacher'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              You have {todaySchedule.length} sessions scheduled for today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-3">
                  <stat.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Today's Schedule */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Today's Schedule
            </h2>
            <div className="space-y-3">
              {todaySchedule.map((session, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {session.time}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.student}</p>
                      <p className="text-sm text-muted-foreground">{session.course}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    session.type === 'One-on-One' 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' 
                      : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                  }`}>
                    {session.type}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Placeholder */}
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Teacher Dashboard
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              This is a placeholder for the Teacher interface. Additional features like student management, course materials, and assessments can be added here.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded">Role: {user?.role}</span>
              <span className="px-2 py-1 bg-secondary rounded">Interface: {user?.interface}</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
