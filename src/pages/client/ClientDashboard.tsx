import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Trophy,
  Settings,
  LogOut,
  Bell,
  Clock,
  Target,
  ChevronDown,
  PlayCircle,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import logo from "@/assets/logo.png";

const ClientDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const courseProgress = [
    { name: "Business English 101", progress: 75, totalLessons: 24, completedLessons: 18 },
    { name: "Business English 102", progress: 45, totalLessons: 20, completedLessons: 9 },
    { name: "Business English 103", progress: 10, totalLessons: 18, completedLessons: 2 },
  ];

  const upcomingSessions = [
    { date: "Today", time: "14:00", instructor: "Dr. Emily Watson", topic: "Business Negotiations" },
    { date: "Tomorrow", time: "09:00", instructor: "James Miller", topic: "Presentation Skills" },
    { date: "Friday", time: "14:00", instructor: "Dr. Emily Watson", topic: "Email Writing" },
  ];

  const achievements = [
    { icon: Trophy, label: "First Session", earned: true },
    { icon: Target, label: "10 Sessions", earned: true },
    { icon: BookOpen, label: "Fast Learner", earned: false },
    { icon: Clock, label: "Consistent", earned: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="The Pro English" className="h-10" />
            <span className="text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
              Student
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-amber-500 text-white text-xs">
                      {user?.fullName ? getInitials(user.fullName) : "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">Student</p>
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
                    {theme === "dark" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    Dark Mode
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} className="scale-75" />
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
      <main className="p-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.fullName?.split(" ")[0]}!</h1>
            <p className="text-muted-foreground mt-1">Keep up the great work! You're making excellent progress.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Progress */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  My Courses
                </h2>
                <div className="space-y-4">
                  {courseProgress.map((course, index) => (
                    <motion.div
                      key={course.name}
                      className="p-4 bg-secondary/50 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{course.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{course.progress}% complete</span>
                        <Button size="sm" variant="ghost" className="text-primary h-auto p-1">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-600" />
                  Achievements
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.label}
                      className={`p-4 rounded-lg text-center ${
                        achievement.earned ? "bg-amber-100 dark:bg-amber-900/30" : "bg-secondary/50 opacity-50"
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: achievement.earned ? 1 : 0.5, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <achievement.icon
                        className={`h-8 w-8 mx-auto mb-2 ${
                          achievement.earned ? "text-amber-600" : "text-muted-foreground"
                        }`}
                      />
                      <p
                        className={`text-xs font-medium ${
                          achievement.earned ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {achievement.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  Upcoming Sessions
                </h2>
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <motion.div
                      key={index}
                      className="p-3 bg-secondary/50 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {session.date}
                        </span>
                        <span className="text-xs text-muted-foreground">{session.time}</span>
                      </div>
                      <p className="font-medium text-foreground text-sm">{session.topic}</p>
                      <p className="text-xs text-muted-foreground">with {session.instructor}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
                <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="opacity-80">Overall Progress</span>
                      <span className="font-medium">43%</span>
                    </div>
                    <Progress value={43} className="h-2 bg-white/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold">29</p>
                      <p className="text-xs opacity-80">Lessons Done</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">12h</p>
                      <p className="text-xs opacity-80">Learning Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded">Role: {user?.role}</span>
              <span className="px-2 py-1 bg-secondary rounded">Interface: {user?.interface}</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ClientDashboard;
