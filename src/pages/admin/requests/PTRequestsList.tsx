import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { sessionService } from "@/services/sessionService";
import { CancelRequest } from "@/types/session";
import { toast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";

const PTRequestsList = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState(sessionService.getAllCancelRequests());
  const [denyDialog, setDenyDialog] = useState<CancelRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const refresh = () => setRequests(sessionService.getAllCancelRequests());

  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleApprove = (req: CancelRequest) => {
    sessionService.reviewCancelRequest(req.id, true, user?.id ?? "");
    toast({ title: t("admin.ptRequests.approveSuccess") });
    refresh();
  };

  const handleDeny = () => {
    if (!denyDialog) return;
    sessionService.reviewCancelRequest(denyDialog.id, false, user?.id ?? "", rejectionReason);
    toast({ title: t("admin.ptRequests.denySuccess") });
    setDenyDialog(null);
    setRejectionReason("");
    refresh();
  };

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
    approved: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
    denied: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isRTL ? "mr-16" : "ml-16"}`}>
        <div className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              {t("admin.ptRequests.title")}
            </h1>

            {sorted.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">{t("admin.ptRequests.noRequests")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.map((req, i) => {
                  const config = statusConfig[req.status];
                  const StatusIcon = config.icon;
                  return (
                    <motion.div
                      key={req.id}
                      className="bg-card border border-border rounded-xl p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{req.teacherName}</h3>
                            <span className="text-sm text-muted-foreground">→</span>
                            <span className="text-sm text-foreground">{req.studentName}</span>
                            <Badge className={`${config.color} text-xs`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {t(`admin.ptRequests.status.${req.status}`)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">{t("admin.ptRequests.reason")}:</span> {req.reason}
                          </p>
                          {req.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">
                              <span className="font-medium">{t("admin.ptRequests.rejectionReason")}:</span> {req.rejectionReason}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(parseISO(req.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>

                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(req)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t("admin.ptRequests.approve")}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setDenyDialog(req)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              {t("admin.ptRequests.deny")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Dialog open={!!denyDialog} onOpenChange={() => setDenyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.ptRequests.denyTitle")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder={t("admin.ptRequests.rejectionReasonPlaceholder")}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialog(null)}>{t("admin.ptRequests.cancel")}</Button>
            <Button onClick={handleDeny} className="bg-red-600 hover:bg-red-700 text-white">{t("admin.ptRequests.confirmDeny")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PTRequestsList;
