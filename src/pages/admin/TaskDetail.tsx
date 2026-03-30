 import React, { useState, useEffect } from "react";
 import { useParams, useNavigate, Link } from "react-router-dom";
 import { useTranslation } from "react-i18next";
 import { formatDistanceToNow, format } from "date-fns";
 import { ar, enUS } from "date-fns/locale";
 import {
   ArrowLeft,
   UserPlus,
   Edit2,
   Trash2,
   Clock,
   User,
   AlertCircle,
   CheckCircle2,
 } from "lucide-react";
 import { motion } from "framer-motion";
 
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Skeleton } from "@/components/ui/skeleton";
 import { Badge } from "@/components/ui/badge";
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
 
import AdminSidebar from "@/components/admin/AdminSidebar";
import ReassignTaskDialog from "@/components/admin/clients/tasks/ReassignTaskDialog";
import EditTaskDialog from "@/components/admin/clients/tasks/EditTaskDialog";
import TaskNotesSection from "@/components/admin/clients/tasks/TaskNotesSection";
import TaskAttachmentsSection from "@/components/admin/clients/tasks/TaskAttachmentsSection";
import useLanguage from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { StaffTask, TaskCategory, UpdateTaskPayload } from "@/types/staffTask";
import { staffTaskService, taskCategoryService, taskTimelineService, taskAttachmentService } from "@/services/staffTaskService";
import mockUsersData from "@/data/mockUsers.json";
 
// Get admin interface users from mock data
const getAdminTeamMembers = () => {
  return mockUsersData.staff
    .filter(user => user.interface === "Admin" && user.isActive)
    .map(user => ({
      id: user.id,
      name: user.fullName,
    }));
};
 
 const TaskDetail = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { t } = useTranslation();
   const { isRTL, currentLanguage } = useLanguage();
   const { toast } = useToast();
 
   const [task, setTask] = useState<StaffTask | null>(null);
   const [categories, setCategories] = useState<TaskCategory[]>([]);
   const [loading, setLoading] = useState(true);
  const [teamMembers] = useState(getAdminTeamMembers());
 
   // Dialog states
   const [showReassignDialog, setShowReassignDialog] = useState(false);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
 
   // Note input
   const [isUploading, setIsUploading] = useState(false);

  // Helper for staffTasks translations
  const tTask = (key: string) => t(`admin.staffTasks.${key}`);
 
   useEffect(() => {
     if (id) loadTask(id);
   }, [id]);
 
   const loadTask = async (taskId: string) => {
     setLoading(true);
     try {
       const [taskData, catData] = await Promise.all([
         staffTaskService.getById(taskId),
         taskCategoryService.getAll(),
       ]);
       setTask(taskData);
       setCategories(catData);
     } catch (error) {
       console.error("Error loading task:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const getCategoryName = (catId: string) => {
     const cat = categories.find((c) => c.id === catId);
     if (!cat) return catId;
    return cat.name;
   };
 
   const getUrgencyLabel = (urgency: string) => {
     switch (urgency) {
       case "critical":
        return tTask("urgencyCritical");
       case "important":
        return tTask("urgencyImportant");
       default:
        return tTask("urgencyNormal");
     }
   };
 
   const getUrgencyColor = (urgency: string) => {
     switch (urgency) {
       case "critical":
         return "text-red-600";
       case "important":
         return "text-amber-600";
       default:
         return "text-yellow-600";
     }
   };
 
   const handleReassign = async (userId: string, userName: string) => {
     if (!task) return;
    const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
     const oldAssignee = task.assignedToName;
     const updated = await staffTaskService.reassign(
       task.id,
       { userId, userName },
      { userId: currentUser.id, userName: currentUser.name }
     );
     if (updated) {
       setTask(updated);
       // Log to client timeline
       await taskTimelineService.addTaskEvent(
         task.clientId,
         "reassigned",
         task.code,
         task.title,
         currentUser.name,
         task.id,
         { fromUser: oldAssignee, toUser: userName }
       );
      toast({ title: tTask("taskReassignedSuccess") });
     }
   };
 
  const handleEditTask = async (payload: UpdateTaskPayload) => {
    if (!task) return;
    const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
    const updated = await staffTaskService.update(
      task.id,
      payload,
      { userId: currentUser.id, userName: currentUser.name }
    );
    if (updated) {
      setTask(updated);
      toast({ title: tTask("taskUpdatedSuccess") });
    }
  };

   const handleDelete = async () => {
     if (!task) return;
     const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
     // Log to client timeline before delete
     await taskTimelineService.addTaskEvent(
       task.clientId,
       "deleted",
       task.code,
       task.title,
       currentUser.name,
       task.id
     );
     await staffTaskService.delete(task.id);
    toast({ title: tTask("taskDeletedSuccess") });
     navigate(-1);
   };
 
   const handleMarkResolved = async () => {
     if (!task) return;
    const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
    const updated = await staffTaskService.resolve(task.id, {
      userId: currentUser.id,
      userName: currentUser.name,
    });
     if (updated) {
       setTask(updated);
       // Log to client timeline
       await taskTimelineService.addTaskEvent(
         task.clientId,
         "resolved",
         task.code,
         task.title,
         currentUser.name,
         task.id
       );
      toast({ title: tTask("taskResolvedSuccess") });
     }
   };
 
   const handleAddNote = async (content: string) => {
     if (!task) return;
     const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
     const updated = await staffTaskService.addNote(
       task.id,
       content,
       { userId: currentUser.id, userName: currentUser.name }
     );
     if (updated) {
       setTask(updated);
       toast({ title: tTask("noteAddedSuccess") });
     }
   };
 
   const handleEditNote = async (noteId: string, content: string) => {
     if (!task) return;
     const updated = await staffTaskService.editNote(task.id, noteId, content);
     if (updated) {
       setTask(updated);
       toast({ title: tTask("noteUpdatedSuccess") });
     }
   };
 
   const handleDeleteNote = async (noteId: string) => {
     if (!task) return;
     const updated = await staffTaskService.deleteNote(task.id, noteId);
     if (updated) {
       setTask(updated);
       toast({ title: tTask("noteDeletedSuccess") });
     }
   };
 
   const handleUploadAttachment = async (file: File) => {
     if (!task) return;
     setIsUploading(true);
     try {
       const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
       // Create a data URL for localStorage (in production, upload to storage)
       const reader = new FileReader();
       reader.onload = async () => {
         const url = reader.result as string;
         const updated = await taskAttachmentService.addAttachment(
           task.id,
           { name: file.name, size: file.size, type: file.type, url },
           { userId: currentUser.id, userName: currentUser.name }
         );
         if (updated) {
           setTask(updated);
           toast({ title: tTask("attachmentAddedSuccess") });
         }
         setIsUploading(false);
       };
       reader.readAsDataURL(file);
     } catch (error) {
       setIsUploading(false);
       console.error("Error uploading attachment:", error);
     }
   };
 
   const handleDeleteAttachment = async (attachmentId: string) => {
     if (!task) return;
     const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
     const updated = await taskAttachmentService.deleteAttachment(
       task.id,
       attachmentId,
       { userId: currentUser.id, userName: currentUser.name }
     );
     if (updated) {
       setTask(updated);
       toast({ title: tTask("attachmentDeletedSuccess") });
     }
   };
 
   const formatDate = (dateStr: string) => {
     return format(new Date(dateStr), "dd/MM/yyyy, hh:mm a");
   };
 
   const formatRelativeTime = (dateStr: string) => {
     return formatDistanceToNow(new Date(dateStr), {
       addSuffix: false,
       locale: currentLanguage === "ar" ? ar : enUS,
     });
   };
 
   if (loading) {
     return (
       <div className="min-h-screen bg-admin-bg flex" dir={isRTL ? "rtl" : "ltr"}>
         <AdminSidebar />
         <div className={`flex-1 ${isRTL ? "mr-16" : "ml-16"} p-6`}>
           <Skeleton className="h-8 w-48 mb-6" />
           <Skeleton className="h-64" />
         </div>
       </div>
     );
   }
 
   if (!task) {
     return (
       <div className="min-h-screen bg-admin-bg flex" dir={isRTL ? "rtl" : "ltr"}>
         <AdminSidebar />
         <div className={`flex-1 ${isRTL ? "mr-16" : "ml-16"} p-6`}>
           <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
             <AlertCircle className="h-16 w-16 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold">{tTask("taskNotFound")}</h2>
             <Button onClick={() => navigate(-1)}>
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {tTask("goBack")}
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
         {/* Breadcrumb Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-admin-border-light shadow-[0_2px_8px_hsl(220_20%_20%/0.08)] px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
             <span className="text-muted-foreground">
              {tTask("title")}
             </span>
             <span className="text-muted-foreground">/</span>
             <span className="font-medium">
              {tTask("task")} {task.code}
             </span>
           </div>
         </header>
 
        <main className="p-4 sm:p-6">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4 }}
           >
             {/* Task Info Card */}
             <Card className="mb-6 shadow-[0_2px_8px_hsl(220_20%_20%/0.08),0_4px_16px_hsl(220_20%_20%/0.06)]">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                   {/* Left: Meta Info */}
                  <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
                     <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-20 sm:min-w-24 text-sm">
                        {tTask("status")}
                       </span>
                       <Badge
                         variant={task.status === "resolved" ? "default" : "secondary"}
                         className={task.status === "resolved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                       >
                         {task.status === "resolved"
                          ? tTask("statusResolved")
                          : tTask("statusPending")}
                       </Badge>
                     </div>
 
                     <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-20 sm:min-w-24 text-sm">
                        {tTask("assignedTo")}
                       </span>
                       <span className="text-primary font-medium">{task.assignedToName}</span>
                     </div>
 
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground min-w-20 sm:min-w-24 text-sm">
                        {tTask("client")}
                       </span>
                       <Link
                         to={`/admin/clients/${task.clientId}`}
                         className="text-primary hover:underline font-medium"
                       >
                         {task.clientName}
                       </Link>
                       <span className="text-xs text-muted-foreground">
                         {task.clientCode}
                       </span>
                     </div>
 
                     <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-20 sm:min-w-24 text-sm">
                        {tTask("categories")}
                       </span>
                      <span className="text-sm">
                         {task.categories.length > 0
                           ? task.categories.map((c) => getCategoryName(c)).join(", ")
                           : "--"}
                       </span>
                     </div>
 
                     <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-20 sm:min-w-24 text-sm">
                        {tTask("urgency")}
                       </span>
                       <div className="flex items-center gap-1.5">
                         <div
                           className={`w-2.5 h-2.5 rounded-full ${
                             task.urgency === "critical"
                               ? "bg-red-500"
                               : task.urgency === "important"
                               ? "bg-amber-500"
                               : "bg-yellow-400"
                           }`}
                         />
                         <span className={getUrgencyColor(task.urgency)}>
                           {getUrgencyLabel(task.urgency)}
                         </span>
                       </div>
                     </div>
 
                     <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-20 sm:min-w-24 text-sm">
                        {tTask("addedBy")}
                       </span>
                       <span>{task.addedByName}</span>
                     </div>
 
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground min-w-20 sm:min-w-24 text-sm">
                        {tTask("createdAt")}
                       </span>
                       <div>
                         <span>{formatDate(task.createdAt)}</span>
                         <span className="text-xs text-muted-foreground ms-2">
                          ({formatRelativeTime(task.createdAt)} {tTask("ago")})
                         </span>
                       </div>
                     </div>
                   </div>
 
                   {/* Right: Title & Description */}
                  <div className="order-1 lg:order-2">
                    <h1 className="text-lg sm:text-xl font-semibold mb-2">{task.title}</h1>
                     {task.description && (
                      <p className="text-sm sm:text-base text-muted-foreground">{task.description}</p>
                     )}
                   </div>
                 </div>
 
                 {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-2 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                   <Button
                     variant="default"
                     className="bg-primary"
                     onClick={() => setShowReassignDialog(true)}
                   >
                     <UserPlus className="h-4 w-4 me-1.5" />
                    <span className="hidden sm:inline">{tTask("reassign")}</span>
                   </Button>
                  <Button variant="secondary" onClick={() => setShowEditDialog(true)}>
                     <Edit2 className="h-4 w-4 me-1.5" />
                    <span className="hidden sm:inline">{tTask("edit")}</span>
                   </Button>
                   <Button
                     variant="destructive"
                     size="icon"
                     onClick={() => setShowDeleteDialog(true)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                   {task.status === "pending" && (
                     <Button
                       variant="outline"
                       className="ms-4"
                       onClick={handleMarkResolved}
                     >
                       <CheckCircle2 className="h-4 w-4 me-1.5" />
                      <span className="hidden sm:inline">{tTask("markResolved")}</span>
                     </Button>
                   )}
                 </div>
               </CardContent>
             </Card>
 
             {/* Notes & History Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Updates & Notes */}
               <TaskNotesSection
                 notes={task.notes}
                 onAddNote={handleAddNote}
                 onEditNote={handleEditNote}
                 onDeleteNote={handleDeleteNote}
               />
 
               {/* History & Changes */}
               <Card className="shadow-[0_2px_8px_hsl(220_20%_20%/0.08),0_4px_16px_hsl(220_20%_20%/0.06)]">
                 <CardHeader className="pb-3 border-b border-admin-border-light">
                   <CardTitle className="text-base text-primary">
                    {tTask("historyAndChanges")}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4">
                   {task.history.length > 0 ? (
                     <div className="space-y-4">
                       {task.history
                         .slice()
                         .reverse()
                         .map((entry) => (
                           <div key={entry.id} className="flex gap-3">
                             <div className="text-xs text-muted-foreground whitespace-nowrap min-w-20">
                               {format(new Date(entry.performedAt), "dd/MM, yy")}
                               <br />
                               {format(new Date(entry.performedAt), "hh:mm a")}
                             </div>
                             <div className="flex-1">
                               <div className="flex items-start gap-2">
                                 <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                 <div>
                                   <p className="text-sm">{entry.action}</p>
                                   <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                     <User className="h-3 w-3" />
                                     <span>{entry.performedByName}</span>
                                     <Clock className="h-3 w-3 ms-1" />
                                     <span>
                                       {formatRelativeTime(entry.performedAt)}{" "}
                                      {tTask("ago")}
                                     </span>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground">
                      {tTask("noHistory")}
                     </p>
                   )}
                 </CardContent>
               </Card>
             </div>

             {/* Attachments Section */}
             <div className="mt-6">
               <TaskAttachmentsSection
                 attachments={task.attachments || []}
                 onUpload={handleUploadAttachment}
                 onDelete={handleDeleteAttachment}
                 isUploading={isUploading}
               />
             </div>
           </motion.div>
         </main>
       </div>
 
       {/* Reassign Dialog */}
       <ReassignTaskDialog
         open={showReassignDialog}
         onOpenChange={setShowReassignDialog}
         onSubmit={handleReassign}
        teamMembers={teamMembers}
       />
 
      {/* Edit Task Dialog */}
      {task && (
        <EditTaskDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          task={task}
          onSubmit={handleEditTask}
          teamMembers={teamMembers}
        />
      )}

       {/* Delete Confirmation */}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
         <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
           <AlertDialogHeader>
             <AlertDialogTitle>
              {tTask("deleteConfirmTitle")}
             </AlertDialogTitle>
             <AlertDialogDescription>
              {tTask("deleteConfirmMessage")}
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
             <AlertDialogCancel>
              {tTask("cancel")}
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={handleDelete}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
              {tTask("delete")}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   );
 };
 
 export default TaskDetail;