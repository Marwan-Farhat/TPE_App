import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, User, Eye, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sessionService } from "@/services/sessionService";
import TeacherLayout from "@/components/teacher/TeacherLayout";

const TeacherSessions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");

  const sessions = sessionService.getSessionsByTeacher(user?.id ?? "");
  const filtered = filter === "all" ? sessions : sessions.filter(s => s.status === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
  );

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
    scheduled: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Calendar },
    completed: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
    cancelled: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  };

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          {t("teacher.sessions.title")}
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "scheduled", "completed", "cancelled"] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {t(`teacher.sessions.filter.${f}`)}
            </Button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t("teacher.sessions.noSessions")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((session, index) => {
              const config = statusConfig[session.status];
              const evaluation = session.evaluationId ? sessionService.getEvaluationBySessionId(session.id) : null;
              return (
                <motion.div
                  key={session.id}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/teacher/sessions/${session.id}`)}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <User className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{session.studentName}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(parseISO(session.date), "MMM dd, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {session.startTime} - {session.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {session.writtenTestResult && (
                        <Badge variant="outline" className="text-xs">
                          {t("teacher.sessions.writtenTest")}: {session.writtenTestResult.totalScore}/{session.writtenTestResult.maxScore}
                        </Badge>
                      )}
                      {evaluation && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                          {t("teacher.sessions.evaluated")}
                        </Badge>
                      )}
                      <Badge className={`${config.color} text-xs`}>
                        {t(`teacher.sessions.status.${session.status}`)}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </TeacherLayout>
  );
};

export default TeacherSessions;
