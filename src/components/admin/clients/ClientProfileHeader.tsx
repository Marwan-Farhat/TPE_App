import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, PhoneCall, Edit2, Trash2, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client, ClientStatus } from "@/types/client";
import useLanguage from "@/hooks/useLanguage";

const statusColors: Record<ClientStatus, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Booked a placement test": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Waiting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "In training": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Completed training": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

interface ClientProfileHeaderProps {
  client: Client;
  onDelete: () => void;
  isDeleting: boolean;
}

const ClientProfileHeader: React.FC<ClientProfileHeaderProps> = ({ client, onDelete, isDeleting }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const getStatusTranslation = (status: ClientStatus) => {
    const statusKey = `admin.status.${status.replace(/\s+/g, "")}`;
    return t(statusKey, status);
  };

  return (
    <>
      {/* Breadcrumb Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/clients")}>
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary cursor-pointer hover:underline flex items-center gap-1" onClick={() => navigate("/admin/clients")}>
                {t("admin.clientProfile.clients")}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">{t("admin.clientProfile.title")}</span>
            </div>
          </div>

          <Button variant="default" size="sm" onClick={() => navigate("/admin/clients")}>
            {t("admin.clientProfile.viewAll")}
          </Button>
        </div>
      </header>

      {/* Client Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-admin-border-light rounded-xl p-6 mt-6 mx-6 shadow-[0_2px_8px_hsl(220_20%_20%/0.08),0_4px_16px_hsl(220_20%_20%/0.06)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={client.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background bg-muted"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "end" : "start"}>
                  <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.id}/edit`)}>
                    <Edit2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("admin.clientProfile.editProfile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("admin.clientProfile.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold">{client.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-1">{client.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/clients/${client.id}/edit`)}
                  className="h-7 text-xs gap-1.5 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                >
                  <Edit2 className="h-3 w-3" />
                  {t("admin.clients.edit")}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5 bg-destructive/5 border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t("admin.clients.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className={isRTL ? "text-right" : ""}>
                        {t("admin.clientProfile.deleteClient")}
                      </AlertDialogTitle>
                      <AlertDialogDescription className={isRTL ? "text-right" : ""}>
                        {t("admin.clientProfile.deleteConfirm")} <strong>{client.name}</strong>?
                        {t("admin.clientProfile.deleteWarning")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel>{t("admin.clientProfile.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? t("admin.clientProfile.deleting") : t("admin.clientProfile.deleteClient")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="flex flex-col items-start gap-2 min-w-[200px]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("admin.clients.table.status")}</span>
            </div>
            <Badge className={`${statusColors[client.status as ClientStatus]} px-3 py-1`}>
              {getStatusTranslation(client.status as ClientStatus)}
            </Badge>
          </div>

          {/* Financial Summary */}
          <div className="flex gap-6 lg:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {(client.totalPaidEver || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">{t("admin.clientProfile.totalPaid")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {(client.remainingForPath || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("admin.clientProfile.totalPending")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {((client.totalPaidEver || 0) - (client.paidForPath || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">{t("admin.clientProfile.balance")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ClientProfileHeader;