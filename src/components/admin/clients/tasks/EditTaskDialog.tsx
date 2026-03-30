 import React, { useState, useEffect } from "react";
 import { useTranslation } from "react-i18next";
 import { Plus, X } from "lucide-react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { Checkbox } from "@/components/ui/checkbox";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import useLanguage from "@/hooks/useLanguage";
 import { StaffTask, TaskCategory, TaskUrgency, UpdateTaskPayload } from "@/types/staffTask";
 import { taskCategoryService } from "@/services/staffTaskService";
 import { useToast } from "@/hooks/use-toast";
 
 interface EditTaskDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   task: StaffTask;
   onSubmit: (payload: UpdateTaskPayload) => Promise<void>;
   teamMembers?: Array<{ id: string; name: string }>;
 }
 
 const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
   open,
   onOpenChange,
   task,
   onSubmit,
   teamMembers = [],
 }) => {
   const { t } = useTranslation();
   const { isRTL } = useLanguage();
   const { toast } = useToast();
   
   const tTask = (key: string) => t(`admin.staffTasks.${key}`) as string;
 
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [categories, setCategories] = useState<TaskCategory[]>([]);
   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
   const [assignedTo, setAssignedTo] = useState("");
   const [urgency, setUrgency] = useState<TaskUrgency>("normal");
   const [allowReassign, setAllowReassign] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const [showAddCategory, setShowAddCategory] = useState(false);
   const [newCategoryName, setNewCategoryName] = useState("");
 
   useEffect(() => {
     if (open && task) {
       loadCategories();
       // Pre-fill form with task data
       setTitle(task.title);
       setDescription(task.description || "");
       setSelectedCategories(task.categories || []);
       setAssignedTo(task.assignedTo);
       setUrgency(task.urgency);
       setAllowReassign(task.allowReassign);
     }
   }, [open, task]);
 
   const loadCategories = async () => {
     const cats = await taskCategoryService.getAll();
     setCategories(cats);
   };
 
   const handleCategoryToggle = (categoryId: string) => {
     setSelectedCategories((prev) =>
       prev.includes(categoryId)
         ? prev.filter((id) => id !== categoryId)
         : [...prev, categoryId]
     );
   };
 
   const handleAddCategory = async () => {
     if (!newCategoryName.trim()) return;
     
     const newCat = await taskCategoryService.create(newCategoryName.trim());
     setCategories((prev) => [...prev, newCat]);
     setSelectedCategories((prev) => [...prev, newCat.id]);
     setNewCategoryName("");
     setShowAddCategory(false);
     toast({ title: tTask("categoryAddedSuccess") });
   };
 
   const handleSubmit = async () => {
     if (!title.trim() || !assignedTo) {
       toast({
         title: tTask("fillRequiredFields"),
         variant: "destructive",
       });
       return;
     }
 
     setIsSubmitting(true);
     try {
       const selectedMember = teamMembers.find((m) => m.id === assignedTo);
       await onSubmit({
         title: title.trim(),
         description: description.trim() || undefined,
         assignedTo,
         assignedToName: selectedMember?.name || assignedTo,
         categories: selectedCategories,
         urgency,
         allowReassign,
       });
       onOpenChange(false);
     } catch (error) {
       console.error("Error updating task:", error);
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent
         className="max-w-2xl max-h-[90vh] overflow-y-auto"
         dir={isRTL ? "rtl" : "ltr"}
       >
         <DialogHeader>
           <DialogTitle className="text-xl font-semibold">
             {tTask("editTask")}
           </DialogTitle>
         </DialogHeader>
 
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
           {/* Left Column */}
           <div className="space-y-4">
             {/* Task Title */}
             <div className="space-y-2">
               <Label htmlFor="edit-task-title">
                 {tTask("task")} *
               </Label>
               <Input
                 id="edit-task-title"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 placeholder={tTask("task")}
               />
             </div>
 
             {/* Description */}
             <div className="space-y-2">
               <Label htmlFor="edit-task-description">
                 {tTask("description")}
               </Label>
               <Textarea
                 id="edit-task-description"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder={tTask("descriptionPlaceholder")}
                 rows={4}
               />
             </div>
 
             {/* Assigned To */}
             <div className="space-y-2">
               <Label>{tTask("assignedTo")} *</Label>
               <div className="flex gap-2">
                 <Select value={assignedTo} onValueChange={setAssignedTo}>
                   <SelectTrigger className="flex-1">
                     <SelectValue placeholder={tTask("searchAssignee")} />
                   </SelectTrigger>
                   <SelectContent>
                     {teamMembers.map((member) => (
                       <SelectItem key={member.id} value={member.id}>
                         {member.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     if (teamMembers.length > 0) setAssignedTo(teamMembers[0].id);
                   }}
                 >
                   {tTask("me")}
                 </Button>
               </div>
             </div>
 
             {/* Urgency */}
             <div className="space-y-2">
               <Label>{tTask("urgency")}</Label>
               <Select value={urgency} onValueChange={(v) => setUrgency(v as TaskUrgency)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="critical">{tTask("urgencyCritical")}</SelectItem>
                   <SelectItem value="important">{tTask("urgencyImportant")}</SelectItem>
                   <SelectItem value="normal">{tTask("urgencyNormal")}</SelectItem>
                 </SelectContent>
               </Select>
             </div>
 
             {/* Allow Reassign */}
             <div className="flex items-center gap-2">
               <Checkbox
                 id="edit-allow-reassign"
                 checked={allowReassign}
                 onCheckedChange={(checked) => setAllowReassign(checked === true)}
               />
               <Label htmlFor="edit-allow-reassign" className="text-sm font-normal cursor-pointer">
                 {tTask("allowReassign")}
               </Label>
             </div>
           </div>
 
           {/* Right Column */}
           <div className="space-y-4">
             {/* Associated Client */}
             <div className="space-y-2">
               <Label>{tTask("associatedClient")}</Label>
               <div className="p-3 border rounded-lg bg-muted/50">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium text-primary">{task.clientName}</p>
                     <p className="text-xs text-muted-foreground">{task.clientCode}</p>
                   </div>
                 </div>
               </div>
             </div>
 
             {/* Categories */}
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <Label>{tTask("categories")}</Label>
                 <Button
                   variant="default"
                   size="sm"
                   className="h-6 px-2 text-xs"
                   onClick={() => setShowAddCategory(!showAddCategory)}
                 >
                   <Plus className="h-3 w-3 mr-1" />
                   {tTask("addCategory")}
                 </Button>
               </div>
 
               {showAddCategory && (
                 <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
                   <Input
                     placeholder={tTask("categoryName")}
                     value={newCategoryName}
                     onChange={(e) => setNewCategoryName(e.target.value)}
                     className="text-sm"
                   />
                   <div className="flex gap-2">
                     <Button size="sm" onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                       {tTask("addCategory")}
                     </Button>
                     <Button size="sm" variant="ghost" onClick={() => setShowAddCategory(false)}>
                       {tTask("cancel")}
                     </Button>
                   </div>
                 </div>
               )}
 
               <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                 {categories.map((cat) => (
                   <label
                     key={cat.id}
                     className="flex items-center gap-1.5 cursor-pointer"
                   >
                     <Checkbox
                       checked={selectedCategories.includes(cat.id)}
                       onCheckedChange={() => handleCategoryToggle(cat.id)}
                     />
                     <span className="text-sm">{cat.name}</span>
                   </label>
                 ))}
               </div>
             </div>
           </div>
         </div>
 
         {/* Footer */}
         <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             {tTask("cancel")}
           </Button>
           <Button onClick={handleSubmit} disabled={isSubmitting}>
             {isSubmitting ? "..." : tTask("saveChanges")}
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default EditTaskDialog;