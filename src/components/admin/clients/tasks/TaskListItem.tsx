 import React from "react";
 import { useTranslation } from "react-i18next";
 import { formatDistanceToNow } from "date-fns";
 import { ar, enUS } from "date-fns/locale";
 import { Edit2, Trash2, UserPlus } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import useLanguage from "@/hooks/useLanguage";
 import { StaffTask, TaskCategory } from "@/types/staffTask";
 
 interface TaskListItemProps {
   task: StaffTask;
   categories: TaskCategory[];
   onView: (task: StaffTask) => void;
   onReassign: (task: StaffTask) => void;
   onEdit: (task: StaffTask) => void;
   onDelete: (task: StaffTask) => void;
   hideReassignIfNotAllowed?: boolean;
 }
 
 const TaskListItem: React.FC<TaskListItemProps> = ({
   task,
   categories,
   onView,
   onReassign,
   onEdit,
   onDelete,
   hideReassignIfNotAllowed = false,
 }) => {
   const { t } = useTranslation();
   const { isRTL, currentLanguage } = useLanguage();
  
  // Helper for staffTasks translations
  const tTask = (key: string) => t(`admin.staffTasks.${key}`);
 
   const getCategoryName = (catId: string) => {
     const cat = categories.find((c) => c.id === catId);
     if (!cat) return catId;
    return cat.name;
   };
 
  const getStatusColor = (status: string, urgency: string) => {
    // If resolved, always show green
    if (status === "resolved") {
      return "bg-emerald-500";
    }
    // Otherwise show urgency color
    switch (urgency) {
      case "critical":
        return "bg-red-500";
      case "important":
        return "bg-amber-500";
      default:
        return "bg-yellow-400";
    }
  };
 
   const formattedDate = formatDistanceToNow(new Date(task.createdAt), {
     addSuffix: true,
     locale: currentLanguage === "ar" ? ar : enUS,
   });
 
   return (
    <div className="p-3 sm:p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
           {/* Urgency indicator */}
          <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(task.status, task.urgency)}`} />
 
           <div className="flex-1 min-w-0">
             {/* Task code and title */}
             <div
              className="flex flex-wrap items-center gap-1 sm:gap-2 cursor-pointer"
               onClick={() => onView(task)}
             >
              <span className="text-primary font-semibold text-sm sm:text-base">{task.code}</span>
              <span className="font-medium truncate text-sm sm:text-base">{task.title}</span>
             </div>
 
             {/* Description preview */}
             {task.description && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                 {task.description}
               </p>
             )}
 
             {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
               <span>
                {tTask("assignedTo")}:{" "}
                 <span className="text-primary">{task.assignedToName}</span>
               </span>
               <span>
                {tTask("by")}:{" "}
                 <span className="text-foreground">{task.addedByName}</span>
               </span>
               <span>{formattedDate}</span>
             </div>
           </div>
         </div>
 
         {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
            {(!hideReassignIfNotAllowed || task.allowReassign) && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => onReassign(task)}
              >
                <UserPlus className="h-3 w-3" />
               <span className="hidden sm:inline">{tTask("reassign")}</span>
              </Button>
            )}
           <Button
             variant="ghost"
             size="icon"
             className="h-7 w-7 text-primary"
             onClick={() => onEdit(task)}
           >
             <Edit2 className="h-3.5 w-3.5" />
           </Button>
           <Button
             variant="ghost"
             size="icon"
             className="h-7 w-7 text-destructive"
             onClick={() => onDelete(task)}
           >
             <Trash2 className="h-3.5 w-3.5" />
           </Button>
         </div>
       </div>
     </div>
   );
 };
 
 export default TaskListItem;