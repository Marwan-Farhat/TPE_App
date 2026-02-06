import React from "react";
import { useTranslation } from "react-i18next";
import {
  Route,
  Users,
  ClipboardCheck,
  Clock,
  PauseCircle,
  CreditCard,
  FileText,
  Phone,
  MessageCircle,
  Bell,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";

interface ClientQuickActionsProps {
  clientId: string;
  clientPhone?: string;
}

const ClientQuickActions: React.FC<ClientQuickActionsProps> = ({ clientId, clientPhone }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  const handleAction = (actionKey: string) => {
    toast({
      title: t("admin.clientProfile.comingSoon"),
      description: t("admin.clientProfile.featureNotAvailable"),
    });
  };

  const quickActions = [
    {
      id: "enrollBatch",
      label: t("admin.clientProfile.quickActions.enrollInBatch"),
      icon: Users,
      variant: "default" as const,
      className: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      id: "createPlacement",
      label: t("admin.clientProfile.quickActions.createPlacementTest"),
      icon: ClipboardCheck,
      variant: "default" as const,
      className: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      id: "addWaiting",
      label: t("admin.clientProfile.quickActions.addToWaiting"),
      icon: Clock,
      variant: "default" as const,
      className: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      id: "postpone",
      label: t("admin.clientProfile.quickActions.postponeTraining"),
      icon: PauseCircle,
      variant: "outline" as const,
      className: "border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20",
    },
    {
      id: "addPayment",
      label: t("admin.clientProfile.quickActions.addPayment"),
      icon: CreditCard,
      variant: "default" as const,
      className: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      id: "newInvoice",
      label: t("admin.clientProfile.quickActions.newInvoice"),
      icon: FileText,
      variant: "default" as const,
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
  ];

  const contactActions = [
    { id: "call", icon: Phone, onClick: () => window.open(`tel:${clientPhone}`, "_self") },
    { id: "whatsapp", icon: MessageCircle, onClick: () => window.open(`https://wa.me/${clientPhone?.replace(/\D/g, "")}`, "_blank") },
    { id: "notify", icon: Bell, onClick: () => handleAction("notify") },
    { id: "message", icon: Send, onClick: () => handleAction("message") },
  ];

  return (
    <div className="bg-background border border-admin-border-light rounded-lg p-3 shadow-[0_2px_8px_hsl(220_20%_20%/0.08),0_4px_16px_hsl(220_20%_20%/0.06)]">
      <div className="flex flex-wrap items-center gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant}
              size="sm"
              className={`gap-2 ${action.className}`}
              onClick={() => handleAction(action.id)}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Button>
          );
        })}

        <div className="h-6 w-px bg-border mx-2" />

        <div className="flex items-center gap-1">
          {contactActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-teal-50 border-teal-200 text-teal-600 hover:bg-teal-100 dark:bg-teal-950/20 dark:border-teal-800 dark:text-teal-400"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientQuickActions;