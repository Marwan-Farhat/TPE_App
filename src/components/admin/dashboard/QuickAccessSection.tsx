import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserPlus, Users, Settings2, Zap, Plus, X, GripVertical, Clock, ClipboardList, BookOpen, FileText, Mic, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import useLanguage from "@/hooks/useLanguage";

const STORAGE_KEY = "proenglish_quick_access";

interface QuickAccessItem {
  id: string;
  labelKey: string;
  icon: string;
  path: string;
  enabled: boolean;
}

const DEFAULT_QUICK_ACCESS: QuickAccessItem[] = [
  { id: "new-client", labelKey: "newClient", icon: "UserPlus", path: "/admin/clients/add", enabled: true },
  { id: "all-clients", labelKey: "allClients", icon: "Users", path: "/admin/clients", enabled: true },
];

const AVAILABLE_QUICK_ACCESS: QuickAccessItem[] = [
  { id: "new-client", labelKey: "newClient", icon: "UserPlus", path: "/admin/clients/add", enabled: true },
  { id: "all-clients", labelKey: "allClients", icon: "Users", path: "/admin/clients", enabled: true },
  { id: "time-slots", labelKey: "timeSlots", icon: "Clock", path: "/admin/coordination/time-slots", enabled: false },
  { id: "test-templates", labelKey: "testTemplates", icon: "ClipboardList", path: "/admin/placement-tests/templates", enabled: false },
  { id: "quizzes", labelKey: "quizzes", icon: "BookOpen", path: "/admin/testing-center/quizzes", enabled: false },
  { id: "questions", labelKey: "questions", icon: "FileText", path: "/admin/testing-center/questions", enabled: false },
  { id: "oral-test-types", labelKey: "oralTestTypes", icon: "Mic", path: "/admin/oral-exams/test-types", enabled: false },
  { id: "exam-slots", labelKey: "examSlots", icon: "CalendarDays", path: "/admin/oral-exams/slots", enabled: false },
  { id: "settings", labelKey: "settings", icon: "Settings2", path: "/admin/settings", enabled: false },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "UserPlus":
      return UserPlus;
    case "Users":
      return Users;
    case "Settings2":
      return Settings2;
    case "Clock":
      return Clock;
    case "ClipboardList":
      return ClipboardList;
    case "BookOpen":
      return BookOpen;
    case "FileText":
      return FileText;
    case "Mic":
      return Mic;
    case "CalendarDays":
      return CalendarDays;
    default:
      return Zap;
  }
};

const QuickAccessSection: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState<QuickAccessItem[]>([]);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [tempItems, setTempItems] = useState<QuickAccessItem[]>([]);

  const tDash = (key: string) => t(`admin.dashboard.quickAccess.${key}`);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as QuickAccessItem[];
        const migrated = parsed.map((item) =>
          item.id === "new-client" && item.path === "/admin/add-client"
            ? { ...item, path: "/admin/clients/add" }
            : item,
        );
        setItems(migrated);
        if (migrated !== parsed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      } catch {
        setItems(DEFAULT_QUICK_ACCESS);
      }
    } else {
      setItems(DEFAULT_QUICK_ACCESS);
    }
  }, []);

  const saveItems = (newItems: QuickAccessItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const openManageDialog = () => {
    // Merge available items with stored items to preserve enabled state
    const merged = AVAILABLE_QUICK_ACCESS.map((available) => {
      const stored = items.find((i) => i.id === available.id);
      return stored || available;
    });
    setTempItems(merged);
    setShowManageDialog(true);
  };

  const handleToggleItem = (id: string) => {
    setTempItems((prev) => prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  };

  const handleSaveManage = () => {
    saveItems(tempItems.filter((item) => item.enabled));
    setShowManageDialog(false);
  };

  const enabledItems = items.filter((item) => item.enabled);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {tDash("title")}
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1" onClick={openManageDialog}>
              <Settings2 className="h-4 w-4" />
              {tDash("manage")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {enabledItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">{tDash("noItems")}</p>
              <Button variant="outline" onClick={openManageDialog}>
                <Plus className="h-4 w-4 mr-2" />
                {tDash("addItems")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              {enabledItems.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors min-w-[80px] group"
                  >
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs text-center font-medium">{tDash(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="max-w-md" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{tDash("manageTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{tDash("manageDescription")}</p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {tempItems.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox id={item.id} checked={item.enabled} onCheckedChange={() => handleToggleItem(item.id)} />
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                      {tDash(item.labelKey)}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            <Button onClick={handleSaveManage}>✓ {tDash("save")}</Button>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>
              ✕ {tDash("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickAccessSection;
