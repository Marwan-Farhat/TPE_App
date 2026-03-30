import React from "react";
import { useTranslation } from "react-i18next";
import { History } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusHistoryItem {
  status: string;
  changedAt: string;
}

interface StatusHistorySectionProps {
  statusHistory?: StatusHistoryItem[];
}

const StatusHistorySection: React.FC<StatusHistorySectionProps> = ({ statusHistory = [] }) => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
        <CardTitle className="text-primary">
          <History className="h-5 w-5" />
          {t("admin.clientProfile.statusHistory")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {statusHistory && statusHistory.length > 0 ? (
            statusHistory
              .slice()
              .reverse()
              .map((history, index) => {
                const statusKey = `admin.status.${history.status.replace(/\s+/g, "")}`;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t(statusKey, history.status)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(history.changedAt), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-sm text-muted-foreground">{t("admin.clientProfile.noStatusHistory")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusHistorySection;