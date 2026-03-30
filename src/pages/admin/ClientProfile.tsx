import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ClientProfileHeader from "@/components/admin/clients/ClientProfileHeader";
import ClientProfileTabs from "@/components/admin/clients/ClientProfileTabs";
import ClientQuickActions from "@/components/admin/clients/ClientQuickActions";
import TrainingPathSection from "@/components/admin/clients/sections/TrainingPathSection";
import TimelineSection from "@/components/admin/clients/sections/TimelineSection";
import StatusHistorySection from "@/components/admin/clients/sections/StatusHistorySection";
import FilesSection from "@/components/admin/clients/sections/FilesSection";
import StaffTasksSection from "@/components/admin/clients/sections/StaffTasksSection";
import NotesSection from "@/components/admin/clients/sections/NotesSection";
import InformationTab from "@/components/admin/clients/tabs/InformationTab";
import PlaceholderTab from "@/components/admin/clients/tabs/PlaceholderTab";
import PlacementTab from "@/components/admin/clients/tabs/PlacementTab";
import { clientService, extraFieldService, systemOptionsService, SystemOptions } from "@/services/clientService";
 import { taskTimelineService, TimelineEvent } from "@/services/staffTaskService";
import { Client } from "@/types/client";
import { ExtraField } from "@/types/extraField";
import { useToast } from "@/hooks/use-toast";

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [systemOptions, setSystemOptions] = useState<SystemOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("information");
  const [notes, setNotes] = useState<Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }>>([]);
   const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (id) {
      loadClientData(id);
       loadTimelineEvents(id);
    }
  }, [id]);

  const loadClientData = async (clientId: string) => {
    setLoading(true);
    try {
      const [clientData, fields, options] = await Promise.all([
        clientService.getById(clientId),
        extraFieldService.getAll(),
        systemOptionsService.getAll(),
      ]);
      setClient(clientData);
      setExtraFields(fields);
      setSystemOptions(options);
    } catch (error) {
      console.error("Error loading client:", error);
    } finally {
      setLoading(false);
    }
  };

   const loadTimelineEvents = async (clientId: string) => {
     try {
       const events = await taskTimelineService.getByClientId(clientId);
       setTimelineEvents(events);
     } catch (error) {
       console.error("Error loading timeline events:", error);
     }
   };
 
   // Callback to refresh timeline when a task event is added
   const refreshTimeline = () => {
     if (id) {
       loadTimelineEvents(id);
     }
   };
 
  const handleDeleteClient = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const success = await clientService.delete(id);
      if (success) {
        toast({
          title: t("admin.clients.deleteSuccess"),
        });
        navigate("/admin/clients");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      toast({
        title: t("admin.clients.deleteError"),
        description: t("admin.clients.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceLogout = async () => {
    if (!id) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: t("admin.clientProfile.forceLogoutSuccess"),
        description: t("admin.clientProfile.forceLogoutDescription"),
      });
    } catch (error) {
      toast({
        title: t("admin.clientProfile.forceLogoutError"),
        description: t("admin.clients.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!id || !client) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newPassword = Math.random().toString(36).slice(-8);

      const updated = await clientService.update(id, { password: newPassword });

      if (updated) {
        setClient({ ...client, password: newPassword });
        toast({
          title: t("admin.clientProfile.resetPasswordSuccess"),
          description: `${t("admin.clientProfile.newPasswordPrefix")}${newPassword}`,
        });
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast({
        title: t("admin.clientProfile.resetPasswordError"),
        description: t("admin.clients.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async () => {
    if (!id || !client) return;

    setIsProcessing(true);
    try {
      const newStatus = !client.isActive;
      const updated = await clientService.update(id, { isActive: newStatus });

      if (updated) {
        setClient({ ...client, isActive: newStatus });
        toast({
          title: newStatus ? t("admin.clientProfile.accountActivated") : t("admin.clientProfile.accountDeactivated"),
          description: newStatus
            ? t("admin.clientProfile.accountActivatedMessage")
            : t("admin.clientProfile.accountDeactivatedMessage"),
        });
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast({
        title: t("admin.clientProfile.accountStatusError"),
        description: t("admin.clients.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-bg flex" dir={isRTL ? "rtl" : "ltr"}>
        <AdminSidebar />
        <div className={`flex-1 ${isRTL ? "mr-16" : "ml-16"} p-6`}>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 col-span-2" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-admin-bg flex" dir={isRTL ? "rtl" : "ltr"}>
        <AdminSidebar />
        <div className={`flex-1 ${isRTL ? "mr-16" : "ml-16"} p-6`}>
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <User className="h-16 w-16 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold">{t("admin.clientProfile.clientNotFound")}</h2>
            <p className="text-muted-foreground">{t("admin.clientProfile.clientNotFoundMessage")}</p>
            <Button onClick={() => navigate("/admin/clients")}>
              {t("admin.clientProfile.back")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg flex" dir={isRTL ? "rtl" : "ltr"}>
      <AdminSidebar />

      <div className={`flex-1 ${isRTL ? "mr-16" : "ml-16"}`}>
        <ClientProfileHeader client={client} onDelete={handleDeleteClient} isDeleting={isDeleting} />

        {/* Main Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <ClientQuickActions clientId={client.id} clientPhone={client.phoneNumber} />

            {/* Tabs */}
            <ClientProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
              <TabsContent value="information" className="mt-6">
                <div className="space-y-6">
                  {/* Main Content Grid - Left wider, Right for sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Column - Client Information */}
                    <div className="lg:col-span-3 space-y-6">
                      <InformationTab
                        client={client}
                        extraFields={extraFields}
                        systemOptions={systemOptions}
                        onForceLogout={handleForceLogout}
                        onResetPassword={handleResetPassword}
                        onToggleActive={handleToggleActive}
                        isProcessing={isProcessing}
                      />
                    </div>

                    {/* Right Column - Training Path, Timeline, Status History, Files, Tasks, Notes */}
                    <div className="lg:col-span-2 space-y-6">
                      <TrainingPathSection
                        currentPath={client.currentPath}
                        pathCost={client.pathCost}
                        paidForPath={client.paidForPath}
                      />
                     <TimelineSection events={timelineEvents.map(e => ({
                       ...e,
                       relativeTime: e.timestamp,
                     }))} />
                      <StatusHistorySection statusHistory={client.statusHistory} />
                      <FilesSection clientId={client.id} />
                       <StaffTasksSection
                         clientId={client.id}
                         clientName={client.name}
                         clientCode={client.id}
                         onTimelineUpdate={refreshTimeline}
                       />
                      <NotesSection 
                        notes={notes}
                        onAddNote={(content) => {
                          const newNote = {
                            id: Date.now().toString(),
                            content,
                            createdBy: "You",
                            createdAt: format(new Date(), "MM/dd/yy, hh:mm a"),
                          };
                          setNotes([newNote, ...notes]);
                        }}
                        onEditNote={(id, content) => {
                          setNotes(notes.map(note => 
                            note.id === id ? { ...note, content } : note
                          ));
                        }}
                        onDeleteNote={(id) => {
                          setNotes(notes.filter(note => note.id !== id));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="batches" className="mt-6">
                <PlaceholderTab tabName="batches" />
              </TabsContent>

              <TabsContent value="placement" className="mt-6">
                <PlacementTab clientId={client.id} />
              </TabsContent>

              <TabsContent value="waiting" className="mt-6">
                <PlaceholderTab tabName="waiting" />
              </TabsContent>

              <TabsContent value="payments" className="mt-6">
                <PlaceholderTab tabName="payments" />
              </TabsContent>

              <TabsContent value="invoices" className="mt-6">
                <PlaceholderTab tabName="invoices" />
              </TabsContent>

              <TabsContent value="certificates" className="mt-6">
                <PlaceholderTab tabName="certificates" />
              </TabsContent>

              <TabsContent value="tests" className="mt-6">
                <PlaceholderTab tabName="tests" />
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <PlaceholderTab tabName="messages" />
              </TabsContent>

              <TabsContent value="misc" className="mt-6">
                <PlaceholderTab tabName="misc" />
              </TabsContent>
            </ClientProfileTabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ClientProfile;
