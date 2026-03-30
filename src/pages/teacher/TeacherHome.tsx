import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowRight, BookOpen, MessageSquare, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, isAfter, parseISO } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { sessionService } from "@/services/sessionService";
import TeacherLayout from "@/components/teacher/TeacherLayout";
import useLanguage from "@/hooks/useLanguage";

const TeacherHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const sessions = sessionService.getSessionsByTeacher(user?.id ?? "");
  const cancelRequests = sessionService.getCancelRequestsByTeacher(user?.id ?? "");
  
  const now = new Date();
  const upcomingSessions = sessions
    .filter(s => s.status === "scheduled" && isAfter(parseISO(`${s.date}T${s.startTime}`), now))
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
    .slice(0, 5);

  const completedCount = sessions.filter(s => s.status === "completed").length;
  const scheduledCount = sessions.filter(s => s.status === "scheduled").length;
  const pendingRequests = cancelRequests.filter(r => r.status === "pending").length;

  const stats = [
    { label: t("teacher.home.totalSessions"), value: sessions.length.toString(), icon: BookOpen },
    { label: t("teacher.home.scheduled"), value: scheduledCount.toString(), icon: Calendar },
    { label: t("teacher.home.completed"), value: completedCount.toString(), icon: Users },
    { label: t("teacher.home.pendingRequests"), value: pendingRequests.toString(), icon: MessageSquare },
  ];

  const firstName = user?.fullName
    ? (user.fullName.split(" ").find((part) => !["Dr.", "Mr.", "Ms.", "Mrs."].includes(part)) ?? user.fullName.split(" ")[0])
    : t("teacher.home.teacher");

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("teacher.home.welcome", { name: firstName })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("teacher.home.subtitle", { count: scheduledCount })}
          </p>
        </div>

        {/* Stats */}
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

        {/* Upcoming Sessions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              {t("teacher.home.upcomingSessions")}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/teacher/sessions")} className="text-primary">
              {t("teacher.home.viewAll")}
              <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-1 rotate-180" : "ml-1"}`} />
            </Button>
          </div>

          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">{t("teacher.home.noUpcoming")}</p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => navigate(`/teacher/sessions/${session.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full whitespace-nowrap">
                      {format(parseISO(session.date), "MMM dd")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.studentName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    {t("teacher.home.openSession")}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </TeacherLayout>
  );
};

export default TeacherHome;
