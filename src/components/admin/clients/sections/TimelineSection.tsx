import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, Filter, CheckCircle, Tag, CreditCard, Users, Route, ListTodo, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import useLanguage from "@/hooks/useLanguage";
import { format } from "date-fns";
 import { formatDistanceToNow } from "date-fns";
 import { ar, enUS } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  type: "task" | "tag" | "payment" | "batch" | "status";
  title: string;
  description?: string;
  performedBy: string;
  timestamp: string;
  relativeTime: string;
}

interface TimelineSectionProps {
  events?: TimelineEvent[];
  statusHistory?: {
    status: string;
    changedAt: string;
    changedBy: string;
  }[];
}

const filterButtons = [
  { id: "all", icon: Filter, labelKey: "all" },
  { id: "placement", icon: Filter, labelKey: "placementTesting" },
  { id: "waiting", icon: Filter, labelKey: "waiting" },
  { id: "batches", icon: Filter, labelKey: "batches" },
  { id: "paths", icon: Filter, labelKey: "paths" },
  { id: "payments", icon: Filter, labelKey: "payments" },
  { id: "tags", icon: Filter, labelKey: "tags" },
  { id: "tasks", icon: Filter, labelKey: "tasks" },
];

const TimelineSection: React.FC<TimelineSectionProps> = ({ events = [] }) => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const [activeFilter, setActiveFilter] = React.useState<string>("all");

  const selectFilter = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Timeline events - exclude any status type events (client status should not appear here)
  const timelineEvents: TimelineEvent[] = events.filter(e => e.type !== "status");

  // Filter events based on active filter
  const filteredEvents = activeFilter === "all" 
    ? timelineEvents 
    : timelineEvents.filter(event => {
        const filterMap: Record<string, string[]> = {
          placement: ["placement"],
          waiting: ["waiting"],
          batches: ["batch"],
          paths: ["path"],
          payments: ["payment"],
          tags: ["tag"],
          tasks: ["task"],
        };
        return filterMap[activeFilter]?.includes(event.type) || false;
      });

  function getEventType(status: string): "task" | "tag" | "payment" | "batch" | "status" {
    const lower = status.toLowerCase();
    if (lower.includes("task")) return "task";
    if (lower.includes("tag")) return "tag";
    if (lower.includes("payment") || lower.includes("paid")) return "payment";
    if (lower.includes("batch")) return "batch";
    return "task"; // Default to task instead of status
  }

  const getRelativeTime = (dateStr: string): string => {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: currentLanguage === "ar" ? ar : enUS,
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "task":
        return <ListTodo className="h-4 w-4 text-teal-600" />;
      case "tag":
        return <Tag className="h-4 w-4 text-purple-600" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case "batch":
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
        <CardTitle className="text-primary">
          <Clock className="h-5 w-5" />
          {t("admin.clientProfile.timeline.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => selectFilter(filter.id)}
            >
              <Filter className="h-3 w-3" />
              {t(`admin.clientProfile.timeline.filters.${filter.labelKey}`)}
            </Button>
          ))}
        </div>

        {/* Timeline Events */}
        <ScrollArea className="h-[300px] pr-4">
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(event.timestamp), "dd/MM, yy")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), "HH:mm")}
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-1">{getEventIcon(event.type)}</div>
                  <div className="flex-1 pb-4 border-b border-border last:border-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{event.performedBy}</span>
                      <span className="text-xs text-muted-foreground">• {getRelativeTime(event.timestamp)}</span>
                      {event.type === "batch" && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          {t("admin.clientProfile.timeline.view")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {t("admin.clientProfile.timeline.noEvents")}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TimelineSection;
