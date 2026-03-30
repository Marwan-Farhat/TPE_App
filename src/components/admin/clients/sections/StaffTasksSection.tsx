import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CheckSquare, Plus, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useLanguage from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { StaffTask, TaskCategory, CreateTaskPayload, UpdateTaskPayload } from "@/types/staffTask";
import { staffTaskService, taskCategoryService, taskTimelineService } from "@/services/staffTaskService";
import CreateTaskDialog from "../tasks/CreateTaskDialog";
import EditTaskDialog from "../tasks/EditTaskDialog";
import ReassignTaskDialog from "../tasks/ReassignTaskDialog";
import TaskListItem from "../tasks/TaskListItem";
import mockUsersData from "@/data/mockUsers.json";
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

interface StaffTasksSectionProps {
   clientId: string;
   clientName: string;
   clientCode: string;
   onTaskAdded?: (task: StaffTask) => void;
   onTimelineUpdate?: () => void;
}

// Get admin interface users from mock data
const getAdminTeamMembers = () => {
  return mockUsersData.staff
    .filter(user => user.interface === "Admin" && user.isActive)
    .map(user => ({
      id: user.id,
      name: user.fullName,
    }));
};
 
 const StaffTasksSection: React.FC<StaffTasksSectionProps> = ({
   clientId,
   clientName,
   clientCode,
   onTaskAdded,
   onTimelineUpdate,
 }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
   const { toast } = useToast();
   const navigate = useNavigate();
  
  // Helper for staffTasks translations
  const tTask = (key: string) => t(`admin.staffTasks.${key}`);
 
   const [tasks, setTasks] = useState<StaffTask[]>([]);
   const [categories, setCategories] = useState<TaskCategory[]>([]);
   const [loading, setLoading] = useState(true);
  const [teamMembers] = useState(getAdminTeamMembers());
 
   // Dialog states
   const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
   const [showReassignDialog, setShowReassignDialog] = useState(false);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
 
   useEffect(() => {
     loadData();
   }, [clientId]);
 
   const loadData = async () => {
     setLoading(true);
     try {
       const [taskData, catData] = await Promise.all([
         staffTaskService.getByClientId(clientId),
         taskCategoryService.getAll(),
       ]);
       setTasks(taskData);
       setCategories(catData);
     } catch (error) {
       console.error("Error loading tasks:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleCreateTask = async (payload: CreateTaskPayload) => {
    // Use the first admin user as "current user" for demo
    const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
    const newTask = await staffTaskService.create(payload, {
      userId: currentUser.id,
      userName: currentUser.name,
    });
     setTasks((prev) => [newTask, ...prev]);
   // Log to client timeline
   await taskTimelineService.addTaskEvent(
     clientId,
     "created",
     newTask.code,
     newTask.title,
     currentUser.name,
     newTask.id,
     { assignedTo: payload.assignedToName }
   );
    onTimelineUpdate?.();
    toast({ title: tTask("taskAddedSuccess") });
     onTaskAdded?.(newTask);
   };
 
  const handleEditTask = async (payload: UpdateTaskPayload) => {
    if (!selectedTask) return;
    const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
    const updated = await staffTaskService.update(
      selectedTask.id,
      payload,
      { userId: currentUser.id, userName: currentUser.name }
    );
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast({ title: tTask("taskUpdatedSuccess") });
    }
  };

   const handleReassignTask = async (userId: string, userName: string) => {
     if (!selectedTask) return;
    const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
   const oldAssignee = selectedTask.assignedToName;
     const updated = await staffTaskService.reassign(
       selectedTask.id,
       { userId, userName },
      { userId: currentUser.id, userName: currentUser.name }
     );
     if (updated) {
       setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
     // Log to client timeline
     await taskTimelineService.addTaskEvent(
       clientId,
       "reassigned",
       selectedTask.code,
       selectedTask.title,
       currentUser.name,
       selectedTask.id,
       { fromUser: oldAssignee, toUser: userName }
     );
      onTimelineUpdate?.();
      toast({ title: tTask("taskReassignedSuccess") });
     }
   };
 
   const handleDeleteTask = async () => {
     if (!selectedTask) return;
   const currentUser = teamMembers[0] || { id: "admin-001", name: "Ahmed Al-Rashid" };
   // Log to client timeline before delete
   await taskTimelineService.addTaskEvent(
     clientId,
     "deleted",
     selectedTask.code,
     selectedTask.title,
     currentUser.name,
     selectedTask.id
   );
    onTimelineUpdate?.();
     await staffTaskService.delete(selectedTask.id);
     setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
     setShowDeleteDialog(false);
     setSelectedTask(null);
    toast({ title: tTask("taskDeletedSuccess") });
   };
 
   const handleViewTask = (task: StaffTask) => {
     navigate(`/admin/tasks/${task.id}`);
   };
 
  const openEditDialog = (task: StaffTask) => {
    setSelectedTask(task);
    setShowEditDialog(true);
   };

  return (
     <>
       <Card className="overflow-hidden">
         <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
           <div className="flex items-center justify-between">
             <CardTitle className="text-primary flex items-center gap-2">
               <CheckSquare className="h-5 w-5" />
              {tTask("title")}
             </CardTitle>
             <Button
               size="sm"
               className="gap-1.5"
               onClick={() => setShowCreateDialog(true)}
             >
               <Plus className="h-4 w-4" />
              {tTask("newTask")}
             </Button>
           </div>
         </CardHeader>
         <CardContent className="p-0">
           {loading ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
             </div>
           ) : tasks.length > 0 ? (
             <div>
               {tasks.map((task) => (
                 <TaskListItem
                   key={task.id}
                   task={task}
                   categories={categories}
                   onView={handleViewTask}
                   onReassign={(t) => {
                     setSelectedTask(t);
                     setShowReassignDialog(true);
                   }}
                  onEdit={openEditDialog}
                   onDelete={(t) => {
                     setSelectedTask(t);
                     setShowDeleteDialog(true);
                   }}
                 />
               ))}
             </div>
           ) : (
             <div className="flex items-center justify-between py-4 px-4">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <Info className="h-4 w-4" />
                <span className="text-sm">{tTask("noTasks")}</span>
               </div>
            </div>
           )}
         </CardContent>
       </Card>
 
       {/* Create Task Dialog */}
       <CreateTaskDialog
         open={showCreateDialog}
         onOpenChange={setShowCreateDialog}
         clientId={clientId}
         clientName={clientName}
         clientCode={clientCode}
         onSubmit={handleCreateTask}
        teamMembers={teamMembers}
       />
 
      {/* Edit Task Dialog */}
      {selectedTask && (
        <EditTaskDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          task={selectedTask}
          onSubmit={handleEditTask}
          teamMembers={teamMembers}
        />
      )}

       {/* Reassign Task Dialog */}
       <ReassignTaskDialog
         open={showReassignDialog}
         onOpenChange={setShowReassignDialog}
         onSubmit={handleReassignTask}
        teamMembers={teamMembers}
       />
 
       {/* Delete Confirmation Dialog */}
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
               onClick={handleDeleteTask}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
              {tTask("delete")}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </>
  );
};

export default StaffTasksSection;
