import React from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Building,
  Users,
  CreditCard,
  Tag,
  Clock,
  Calendar,
  Key,
  Shield,
  LogOut,
  RefreshCw,
  UserX,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Client } from "@/types/client";
import { ExtraField } from "@/types/extraField";
import { SystemOptions } from "@/services/clientService";
import useLanguage from "@/hooks/useLanguage";

interface InformationTabProps {
  client: Client;
  extraFields: ExtraField[];
  systemOptions: SystemOptions | null;
  onForceLogout: () => void;
  onResetPassword: () => void;
  onToggleActive: () => void;
  isProcessing: boolean;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) => (
  <div className="py-2 px-3 border-b border-admin-border-light last:border-b-0">
    <label className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </label>
    <p className="text-base font-medium">{value || "-"}</p>
  </div>
);

const InformationTab: React.FC<InformationTabProps> = ({
  client,
  extraFields,
  systemOptions,
  onForceLogout,
  onResetPassword,
  onToggleActive,
  isProcessing,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const [forceLogoutDialog, setForceLogoutDialog] = React.useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = React.useState(false);
  const [deactivateDialog, setDeactivateDialog] = React.useState(false);

  const getCoordinatorName = (coordinatorId?: string) => {
    if (!coordinatorId || !systemOptions) return "-";
    const coord = systemOptions.coordinators.find((c) => c.id === coordinatorId);
    return coord ? coord.name : coordinatorId;
  };

  const getTagNames = (tagIds?: string[]) => {
    if (!tagIds || !tagIds.length || !systemOptions) return [];
    return tagIds.map((id) => {
      const tag = systemOptions.tags.find((t) => t.id === id || t.name === id);
      return tag ? tag : { id, name: id, color: "#888" };
    });
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-admin-section-alt border-b border-admin-border-light">
          <CardTitle className="text-primary">
            <User className="h-5 w-5" />
            {t("admin.clientProfile.personalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={User} label={t("admin.clientProfile.name")} value={client.name} />
            <InfoRow icon={Phone} label={t("admin.clientProfile.phone")} value={client.phoneNumber} />
            <InfoRow icon={Mail} label={t("admin.clientProfile.email")} value={client.email} />
            <InfoRow icon={Briefcase} label={t("admin.clientProfile.jobTitle")} value={client.jobTitle} />
            <InfoRow label={t("admin.clientProfile.age")} value={client.age?.toString()} />
            <InfoRow label={t("admin.clientProfile.gender")} value={client.gender} />
            <InfoRow icon={MapPin} label={t("admin.clientProfile.city")} value={client.city} />
            <InfoRow label={t("admin.clientProfile.country")} value={client.country} />
            <InfoRow icon={Phone} label={t("admin.clientProfile.guardianNumber")} value={client.guardianNumber} />
          </div>
        </CardContent>
      </Card>

      {/* Client Enrollment Details */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-admin-section-alt border-b border-admin-border-light">
          <CardTitle className="text-primary">
            <Briefcase className="h-5 w-5" />
            {t("admin.clientProfile.enrollmentDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label={t("admin.clientProfile.currentPath")} value={client.currentPath} />
            <InfoRow label={t("admin.clientProfile.currentProgram")} value={client.currentProgram} />
            <InfoRow label={t("admin.clientProfile.programType")} value={client.programType} />
            <InfoRow label={t("admin.clientProfile.source")} value={client.source} />
            <InfoRow
              icon={CreditCard}
              label={t("admin.clientProfile.pathCost")}
              value={client.pathCost ? `$${client.pathCost}` : undefined}
            />
            <InfoRow
              label={t("admin.clientProfile.paidForPath")}
              value={client.paidForPath ? `$${client.paidForPath}` : undefined}
            />
            <InfoRow
              label={t("admin.clientProfile.remaining")}
              value={client.remainingForPath ? `$${client.remainingForPath}` : undefined}
            />
            <InfoRow
              label={t("admin.clientProfile.totalPaidEver")}
              value={client.totalPaidEver ? `$${client.totalPaidEver}` : undefined}
            />
            <InfoRow
              icon={Users}
              label={t("admin.clientProfile.coordinator")}
              value={getCoordinatorName(client.assignedCoordinator)}
            />
            <InfoRow icon={Building} label={t("admin.clientProfile.company")} value={client.underCompany} />
          </div>

          {/* Tags */}
          <div className="mt-5 p-4 rounded-lg bg-admin-section-nested border border-admin-border-light">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              {t("admin.clientProfile.tags")}
            </label>
            <div className="flex flex-wrap gap-2">
              {getTagNames(client.tags).length > 0 ? (
                getTagNames(client.tags).map((tag) => (
                  <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-white">
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{t("admin.clientProfile.noTags")}</span>
              )}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mt-4 p-4 rounded-lg bg-admin-section-nested border border-admin-border-light">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              {t("admin.clientProfile.timeSlots")}
            </label>
            <div className="flex flex-wrap gap-2">
              {client.selectedTimeSlots && client.selectedTimeSlots.length > 0 ? (
                client.selectedTimeSlots.map((slot) => (
                  <Badge key={slot} variant="secondary">
                    {slot}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{t("admin.clientProfile.noTimeSlots")}</span>
              )}
            </div>
          </div>

          {/* Training Days */}
          <div className="mt-4 p-4 rounded-lg bg-admin-section-nested border border-admin-border-light">
            <label className="text-sm font-semibold mb-3 block">{t("admin.clientProfile.preferredTrainingDays")}</label>
            <div className="flex flex-wrap gap-2">
              {client.preferredTrainingDays && client.preferredTrainingDays.length > 0 ? (
                client.preferredTrainingDays.map((day) => (
                  <Badge key={day} variant="outline">
                    {day}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{t("admin.clientProfile.noDaysSelected")}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extra Fields */}
      {extraFields.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-admin-section-alt border-b border-admin-border-light">
            <CardTitle className="text-primary">{t("admin.clientProfile.extraInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-3">
              {extraFields.map((field) => {
                const fieldLabel = isRTL
                  ? field.titleAr || field.titleEn || field.title
                  : field.titleEn || field.title || field.titleAr;
                return (
                  <InfoRow
                    key={field.id}
                    label={fieldLabel}
                    value={(client as any).extraFields?.[field.id]?.toString() || field.defaultValue?.toString()}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-admin-section-alt border-b border-admin-border-light">
          <CardTitle className="text-primary">
            <Shield className="h-5 w-5" />
            {t("admin.clientProfile.accountInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg border border-admin-border-light">
            <span className="text-sm font-medium">{t("admin.clientProfile.accountStatus")}</span>
            <Badge variant={client.isActive ? "default" : "secondary"}>
              {client.isActive ? t("admin.clientProfile.active") : t("admin.clientProfile.inactive")}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <InfoRow icon={User} label={t("admin.clientProfile.username")} value={client.username} />
            <InfoRow icon={Key} label={t("admin.clientProfile.password")} value={client.password || undefined} />
            <InfoRow
              icon={Calendar}
              label={t("admin.clientProfile.systemAccount.createdAt")}
              value={format(new Date(client.createdAt), "MMM d, yyyy HH:mm")}
            />
            <InfoRow label={t("admin.clientProfile.systemAccount.lastLogin")} value="-" />
            <InfoRow label={t("admin.clientProfile.systemAccount.lastActivity")} value="-" />
          </div>

          <div className="pt-4 border-t border-admin-border-light">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">
              {t("admin.clientProfile.accountActions")}
            </p>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              <Button
                variant="outline"
                className="justify-center h-10 px-4 text-sm font-medium bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400"
                onClick={() => setForceLogoutDialog(true)}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className={isRTL ? "mr-2" : "ml-2"}>{t("admin.clientProfile.forceLogout")}</span>
              </Button>
              <Button
                variant="outline"
                className="justify-center h-10 px-4 text-sm font-medium bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-700 dark:bg-violet-950/30 dark:hover:bg-violet-950/50 dark:border-violet-800 dark:text-violet-400"
                onClick={() => setResetPasswordDialog(true)}
              >
                <RefreshCw className="h-4 w-4 flex-shrink-0" />
                <span className={isRTL ? "mr-2" : "ml-2"}>{t("admin.clientProfile.resetPassword")}</span>
              </Button>
              <Button
                variant="outline"
                className={`col-span-2 justify-center h-10 px-4 text-sm font-medium ${
                  client.isActive
                    ? "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:border-rose-800 dark:text-rose-400"
                    : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400"
                }`}
                onClick={() => setDeactivateDialog(true)}
              >
                <UserX className="h-4 w-4 flex-shrink-0" />
                <span className={isRTL ? "mr-2" : "ml-2"}>
                  {client.isActive
                    ? t("admin.clientProfile.deactivateAccount")
                    : t("admin.clientProfile.activateAccount")}
                </span>
              </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Force Logout Dialog */}
      <AlertDialog open={forceLogoutDialog} onOpenChange={setForceLogoutDialog}>
        <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : ""}>
              {t("admin.clientProfile.forceLogoutTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className={isRTL ? "text-right" : ""}>
              {t("admin.clientProfile.forceLogoutMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isProcessing}>{t("admin.clientProfile.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onForceLogout();
                setForceLogoutDialog(false);
              }}
              disabled={isProcessing}
            >
              {isProcessing ? t("admin.clientProfile.processing") : t("admin.clientProfile.forceLogout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
        <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : ""}>
              {t("admin.clientProfile.resetPasswordTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className={isRTL ? "text-right" : ""}>
              {t("admin.clientProfile.resetPasswordMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isProcessing}>{t("admin.clientProfile.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onResetPassword();
                setResetPasswordDialog(false);
              }}
              disabled={isProcessing}
            >
              {isProcessing ? t("admin.clientProfile.processing") : t("admin.clientProfile.resetPassword")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate/Activate Account Dialog */}
      <AlertDialog open={deactivateDialog} onOpenChange={setDeactivateDialog}>
        <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : ""}>
              {client.isActive ? t("admin.clientProfile.deactivateTitle") : t("admin.clientProfile.activateTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className={isRTL ? "text-right" : ""}>
              {client.isActive
                ? t("admin.clientProfile.deactivateMessage")
                : t("admin.clientProfile.activateMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isProcessing}>{t("admin.clientProfile.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onToggleActive();
                setDeactivateDialog(false);
              }}
              disabled={isProcessing}
              className={client.isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isProcessing
                ? t("admin.clientProfile.processing")
                : client.isActive
                  ? t("admin.clientProfile.deactivateAccount")
                  : t("admin.clientProfile.activateAccount")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InformationTab;
