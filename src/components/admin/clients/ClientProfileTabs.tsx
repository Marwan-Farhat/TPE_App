import React from "react";
import { useTranslation } from "react-i18next";
import {
  Info,
  Users,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  Award,
  FileCheck,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import useLanguage from "@/hooks/useLanguage";

interface ClientProfileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const tabConfig = [
  { id: "information", icon: Info },
  { id: "batches", icon: Users },
  { id: "placement", icon: ClipboardCheck },
  { id: "waiting", icon: Clock },
  { id: "payments", icon: CreditCard },
  { id: "invoices", icon: FileText },
  { id: "certificates", icon: Award },
  { id: "tests", icon: FileCheck },
  { id: "messages", icon: MessageSquare },
  { id: "misc", icon: MoreHorizontal },
];

const ClientProfileTabs: React.FC<ClientProfileTabsProps> = ({ activeTab, onTabChange, children }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      <TabsList className="w-full justify-start bg-background border border-admin-border-light rounded-lg p-1.5 h-auto flex-wrap gap-1.5 shadow-[0_2px_8px_hsl(220_20%_20%/0.08),0_4px_16px_hsl(220_20%_20%/0.06)]">
        {tabConfig.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-3 py-2 text-foreground/70 hover:text-foreground hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200 font-medium group border border-transparent hover:border-admin-border-light data-[state=active]:border-primary/20 text-sm"
            >
              <Icon className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-data-[state=active]:text-primary-foreground transition-colors" />
              <span className="hidden sm:inline">{t(`admin.clientProfile.tabs.${tab.id}`)}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {children}
    </Tabs>
  );
};

export default ClientProfileTabs;
