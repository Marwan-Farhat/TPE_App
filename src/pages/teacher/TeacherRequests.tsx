import { motion } from "framer-motion";
import { MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { sessionService } from "@/services/sessionService";
import TeacherLayout from "@/components/teacher/TeacherLayout";

const TeacherRequests = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const requests = sessionService.getCancelRequestsByTeacher(user?.id ?? "");
  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
    approved: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
    denied: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  };

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-emerald-600" />
          {t("teacher.requests.title")}
        </h1>

        {sorted.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t("teacher.requests.noRequests")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((req, index) => {
              const config = statusConfig[req.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={req.id}
                  className="bg-card border border-border rounded-xl p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{req.studentName}</h3>
                        <Badge className={`${config.color} text-xs`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {t(`teacher.requests.status.${req.status}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">{t("teacher.requests.reason")}:</span> {req.reason}
                      </p>
                      {req.status === "denied" && req.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          <span className="font-medium">{t("teacher.requests.rejectionReason")}:</span> {req.rejectionReason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(parseISO(req.createdAt), "MMM dd, yyyy HH:mm")}
                      </p>
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

export default TeacherRequests;
