 import { motion } from "framer-motion";
 import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
 import { LayoutDashboard, Users, GraduationCap, Settings, LogOut, Bell, ChevronDown, Moon, Sun, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import AdminSidebar from "@/components/admin/AdminSidebar";
import useLanguage from "@/hooks/useLanguage";
 import { StaffTask, TaskCategory } from "@/types/staffTask";
 import { staffTaskService, taskCategoryService } from "@/services/staffTaskService";
 import AssignedTasksSection from "@/components/admin/dashboard/AssignedTasksSection";
 import QuickAccessSection from "@/components/admin/dashboard/QuickAccessSection";
  import DraggableSections, { DashboardSection } from "@/components/admin/dashboard/DraggableSections";
  import OralExamScheduler from "@/components/admin/dashboard/OralExamScheduler";
 import ReassignTaskDialog from "@/components/admin/clients/tasks/ReassignTaskDialog";
 import mockUsersData from "@/data/mockUsers.json";
 import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
   const { toast } = useToast();
 
   // Task state
   const [tasks, setTasks] = useState<StaffTask[]>([]);
   const [categories, setCategories] = useState<TaskCategory[]>([]);
   const [loadingTasks, setLoadingTasks] = useState(true);
   const [showReassignDialog, setShowReassignDialog] = useState(false);
   const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
 
   // Get admin team members for reassignment
   const teamMembers = useMemo(() => {
     return mockUsersData.staff
       .filter((u) => u.interface === "Admin" && u.isActive)
       .map((u) => ({ id: u.id, name: u.fullName }));
   }, []);
 
   // Load tasks assigned to current user
   useEffect(() => {
     const loadTasks = async () => {
       if (!user?.id) return;
       setLoadingTasks(true);
       try {
         const [taskData, catData] = await Promise.all([
           staffTaskService.getByAssignee(user.id),
           taskCategoryService.getAll(),
         ]);
         setTasks(taskData);
         setCategories(catData);
       } catch (error) {
         console.error("Error loading tasks:", error);
       } finally {
         setLoadingTasks(false);
       }
     };
     loadTasks();
   }, [user?.id]);
 
   const handleReassignTask = async (userId: string, userName: string) => {
     if (!selectedTask || !user) return;
     const updated = await staffTaskService.reassign(
       selectedTask.id,
       { userId, userName },
       { userId: user.id, userName: user.fullName }
     );
     if (updated) {
       // Remove from local list since it's no longer assigned to current user
       setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
       toast({ title: t("admin.staffTasks.taskReassignedSuccess") });
     }
     setSelectedTask(null);
   };
 
   const handleOpenReassign = (task: StaffTask) => {
     setSelectedTask(task);
     setShowReassignDialog(true);
   };
 
   // Check if task allows reassignment
   const canReassign = (task: StaffTask) => task.allowReassign;

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

  const [totalClients, setTotalClients] = useState<number>(0);

  useEffect(() => {
    const loadTotalClients = () => {
      try {
        const stored = localStorage.getItem("proenglish_clients");
        const clients = stored ? JSON.parse(stored) : [];
        setTotalClients(Array.isArray(clients) ? clients.length : 0);
      } catch (error) {
        console.error("Error reading clients from localStorage:", error);
        setTotalClients(0);
      }
    };

    loadTotalClients();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "proenglish_clients") {
        loadTotalClients();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const stats = [
     { label: t("admin.dashboard.totalClients"), value: totalClients.toLocaleString(), change: "+12%", icon: Users, color: "text-blue-600" },
     { label: t("admin.dashboard.activeCourses"), value: "56", change: "+4%", icon: GraduationCap, color: "text-emerald-600" },
     { label: t("admin.dashboard.monthlyRevenue"), value: "$45,230", change: "+18%", icon: LayoutDashboard, color: "text-violet-600" },
     { label: t("admin.dashboard.pendingTasks"), value: tasks.length.toString(), change: tasks.length > 0 ? `${tasks.length}` : "0", icon: Bell, color: "text-amber-600" },
  ];

   // Define dashboard sections
   const dashboardSections: DashboardSection[] = useMemo(() => [
     {
       id: "statistics",
       component: (
         <Card className="overflow-hidden">
           <CardHeader className="bg-admin-section-alt border-b border-admin-border-light">
             <CardTitle className="text-primary flex items-center gap-2">
               <LayoutDashboard className="h-5 w-5" />
               {t("admin.dashboard.statistics") || "Statistics Overview"}
             </CardTitle>
           </CardHeader>
           <CardContent className="pt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {stats.map((stat, index) => (
                 <motion.div
                   key={stat.label}
                   className="admin-section-nested p-5 rounded-xl"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.4, delay: index * 0.1 }}
                 >
                   <div className="flex items-center justify-between mb-4">
                     <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                       <stat.icon className="h-5 w-5 text-primary" />
                     </div>
                     <span
                       className={`text-xs font-medium px-2 py-1 rounded-full ${
                         stat.change.startsWith("+")
                           ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                           : "text-red-600 bg-red-100 dark:bg-red-900/30"
                       }`}
                     >
                       {stat.change}
                     </span>
                   </div>
                   <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                   <p className="text-sm text-muted-foreground">{stat.label}</p>
                 </motion.div>
               ))}
             </div>
           </CardContent>
         </Card>
       ),
     },
     {
       id: "assigned-tasks",
       component: loadingTasks ? (
         <Card className="overflow-hidden">
           <CardContent className="flex items-center justify-center py-12">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           </CardContent>
         </Card>
       ) : (
         <AssignedTasksSection
           tasks={tasks}
           categories={categories}
           onReassign={handleOpenReassign}
           allowReassignCheck={canReassign}
         />
       ),
     },
      {
        id: "quick-access",
        component: <QuickAccessSection />,
      },
      {
        id: "oral-exam-scheduler",
        component: <OralExamScheduler />,
      },
    ], [stats, tasks, categories, loadingTasks, t]);

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Wrapper - offset by sidebar width */}
      <div className={`flex-1 overflow-x-hidden ${isRTL ? "mr-16" : "ml-16"}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-admin-border-light shadow-[0_2px_8px_hsl(220_20%_20%/0.08)]">
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
                        {user?.fullName ? getInitials(user.fullName) : "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isRTL ? "start" : "end"}
                  className={`w-56 ${isRTL ? "text-right" : "text-left"}`}
                >
                  <DropdownMenuItem className="flex items-center">
                    {isRTL ? (
                      <>
                        <Settings className="h-4 w-4 flex-shrink-0" />
                        <span className="mr-2"> {t("admin.header.settings")}</span>
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{t("admin.header.settings")}</span>
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
                          {theme === "dark" ? (
                            <Moon className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <Sun className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="mr-2"> {t("admin.header.darkMode")}</span>
                        </div>
                        <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} className="scale-75" />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          {theme === "dark" ? (
                            <Moon className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <Sun className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span>{t("admin.header.darkMode")}</span>
                        </div>
                        <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} className="scale-75" />
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center">
                    {isRTL ? (
                      <>
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className="mr-2"> {t("admin.header.logout")}</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{t("admin.header.logout")}</span>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Welcome Section */}
            <Card className="mb-8 overflow-hidden">
              <CardHeader className="bg-admin-section-alt border-b border-admin-border-light pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t("admin.dashboard.welcome")}, {user?.fullName?.split(" ")[0]}! 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">{t("admin.dashboard.subtitle")}</p>
                </div>
              </CardHeader>
            </Card>

             {/* Draggable Sections */}
             <DraggableSections sections={dashboardSections} />
          </motion.div>
        </main>
      </div>

       {/* Reassign Task Dialog */}
       <ReassignTaskDialog
         open={showReassignDialog}
         onOpenChange={setShowReassignDialog}
         onSubmit={handleReassignTask}
         teamMembers={teamMembers}
       />
    </div>
  );
};

export default AdminDashboard;
