 import React from "react";
 import { useTranslation } from "react-i18next";
 import { useNavigate } from "react-router-dom";
 import { formatDistanceToNow } from "date-fns";
 import { ar, enUS } from "date-fns/locale";
 import { CheckSquare, ExternalLink, UserPlus } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import useLanguage from "@/hooks/useLanguage";
 import { StaffTask, TaskCategory } from "@/types/staffTask";
 
 interface AssignedTasksSectionProps {
   tasks: StaffTask[];
   categories: TaskCategory[];
   onReassign: (task: StaffTask) => void;
   allowReassignCheck: (task: StaffTask) => boolean;
 }
 
 const AssignedTasksSection: React.FC<AssignedTasksSectionProps> = ({
   tasks,
   categories,
   onReassign,
   allowReassignCheck,
 }) => {
   const { t } = useTranslation();
   const { isRTL, currentLanguage } = useLanguage();
   const navigate = useNavigate();
 
   const tDash = (key: string) => t(`admin.dashboard.assignedTasks.${key}`);
   const tTask = (key: string) => t(`admin.staffTasks.${key}`);
 
   const getCategoryName = (catId: string) => {
     const cat = categories.find((c) => c.id === catId);
     return cat?.name || catId;
   };
 
   const getUrgencyColor = (urgency: string) => {
     switch (urgency) {
       case "critical":
         return "bg-red-500";
       case "important":
         return "bg-amber-500";
       default:
         return "bg-yellow-400";
     }
   };
 
   const handleViewTask = (task: StaffTask) => {
     navigate(`/admin/tasks/${task.id}`);
   };
 
   const handleViewClient = (clientId: string) => {
     navigate(`/admin/clients/${clientId}`);
   };
 
   return (
     <Card className="overflow-hidden">
       <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
         <div className="flex items-center justify-between">
           <CardTitle className="text-primary flex items-center gap-2">
             <CheckSquare className="h-5 w-5" />
             {tDash("title")}
             <Badge variant="secondary" className="ml-2">
               {tasks.length}
             </Badge>
           </CardTitle>
         </div>
       </CardHeader>
       <CardContent className="p-0">
         {tasks.length === 0 ? (
           <div className="flex items-center justify-center py-8 text-muted-foreground">
             <span className="text-sm">{tDash("noTasks")}</span>
           </div>
         ) : (
           <div className="divide-y divide-border">
             {tasks.map((task) => {
               const formattedDate = formatDistanceToNow(new Date(task.createdAt), {
                 addSuffix: true,
                 locale: currentLanguage === "ar" ? ar : enUS,
               });
 
               return (
                 <div
                   key={task.id}
                   className="p-4 hover:bg-muted/30 transition-colors"
                 >
                   <div className="flex flex-col gap-3">
                     {/* Header Row */}
                     <div className="flex items-start justify-between gap-4">
                       <div className="flex items-start gap-3 flex-1 min-w-0">
                         {/* Urgency indicator */}
                         <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${getUrgencyColor(task.urgency)}`} />
 
                         <div className="flex-1 min-w-0">
                           {/* Code and Title */}
                           <div
                             className="flex flex-wrap items-center gap-2 cursor-pointer group"
                             onClick={() => handleViewTask(task)}
                           >
                             <span className="text-primary font-semibold">{task.code}</span>
                             <span className="font-medium truncate group-hover:text-primary transition-colors">
                               {task.title}
                             </span>
                           </div>
 
                           {/* Description */}
                           {task.description && (
                             <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                               {task.description}
                             </p>
                           )}
                         </div>
                       </div>
 
                       {/* Reassign button */}
                       {allowReassignCheck(task) && (
                         <Button
                           variant="outline"
                           size="sm"
                           className="h-7 px-2 text-xs gap-1 shrink-0"
                           onClick={() => onReassign(task)}
                         >
                           <UserPlus className="h-3 w-3" />
                           <span className="hidden sm:inline">{tTask("reassign")}</span>
                         </Button>
                       )}
                     </div>
 
                     {/* Client Info Row */}
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                       <button
                         className="flex items-center gap-1 text-primary hover:underline"
                         onClick={() => handleViewClient(task.clientId)}
                       >
                         <span className="font-medium">{task.clientName}</span>
                         <span className="text-muted-foreground">{task.clientCode}</span>
                         <ExternalLink className="h-3 w-3" />
                       </button>
 
                       <span>
                         {tDash("addedBy")}: {task.addedByName}
                       </span>
 
                       <span>{formattedDate}</span>
                     </div>
 
                     {/* Categories */}
                     {task.categories.length > 0 && (
                       <div className="flex flex-wrap gap-1">
                         {task.categories.map((catId) => (
                           <Badge key={catId} variant="secondary" className="text-xs">
                             {getCategoryName(catId)}
                           </Badge>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}
           </div>
         )}
       </CardContent>
     </Card>
   );
 };
 
 export default AssignedTasksSection;