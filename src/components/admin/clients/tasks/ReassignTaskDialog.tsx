 import React, { useState } from "react";
 import { useTranslation } from "react-i18next";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import useLanguage from "@/hooks/useLanguage";
 
 interface ReassignTaskDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSubmit: (userId: string, userName: string) => Promise<void>;
   teamMembers?: Array<{ id: string; name: string }>;
 }
 
 const ReassignTaskDialog: React.FC<ReassignTaskDialogProps> = ({
   open,
   onOpenChange,
   onSubmit,
   teamMembers = [],
 }) => {
   const { t } = useTranslation();
   const { isRTL } = useLanguage();
  
  // Helper for staffTasks translations
  const tTask = (key: string) => t(`admin.staffTasks.${key}`);
 
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const filteredMembers = teamMembers.filter((m) =>
     m.name.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const handleSubmit = async () => {
     if (!selectedUser) return;
 
     setIsSubmitting(true);
     try {
       await onSubmit(selectedUser.id, selectedUser.name);
       onOpenChange(false);
       setSearchQuery("");
       setSelectedUser(null);
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-md" dir={isRTL ? "rtl" : "ltr"}>
         <DialogHeader>
           <DialogTitle>
            {tTask("reassignTask")}
           </DialogTitle>
         </DialogHeader>
 
         <div className="space-y-4 mt-4">
           <div className="space-y-2">
            <Label>{tTask("user")}</Label>
             <div className="flex gap-2">
               <Input
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tTask("searchAssignee")}
               />
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => {
                   const me = teamMembers.find((m) => m.id === "current-user");
                   if (me) setSelectedUser(me);
                   else if (teamMembers.length > 0) setSelectedUser(teamMembers[0]);
                 }}
               >
                {tTask("me")}
               </Button>
             </div>
           </div>
 
           {/* Search Results */}
           {searchQuery && (
             <div className="border rounded-lg max-h-40 overflow-y-auto">
               {filteredMembers.map((member) => (
                 <div
                   key={member.id}
                   className={`p-2 cursor-pointer hover:bg-muted ${
                     selectedUser?.id === member.id ? "bg-primary/10" : ""
                   }`}
                   onClick={() => setSelectedUser(member)}
                 >
                   {member.name}
                 </div>
               ))}
               {filteredMembers.length === 0 && (
                 <div className="p-2 text-muted-foreground text-sm">
              {tTask("noResultsFound")}
                 </div>
               )}
             </div>
           )}
 
           {selectedUser && (
             <div className="p-2 bg-muted rounded-lg text-sm">
            {tTask("selected")}: <strong>{selectedUser.name}</strong>
             </div>
           )}
         </div>
 
         <div className="flex justify-center gap-2 mt-6">
           <Button onClick={handleSubmit} disabled={!selectedUser || isSubmitting}>
            ✓ {tTask("continue")}
           </Button>
           <Button variant="outline" onClick={() => onOpenChange(false)}>
            ✕ {tTask("close")}
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default ReassignTaskDialog;