 import React, { useRef, useState } from "react";
 import { useTranslation } from "react-i18next";
 import { Paperclip, Upload, X, FileText, Image, File, Trash2 } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
 import { TaskAttachment } from "@/types/staffTask";
 import useLanguage from "@/hooks/useLanguage";
 
 interface TaskAttachmentsSectionProps {
   attachments: TaskAttachment[];
   onUpload: (file: File) => Promise<void>;
   onDelete: (attachmentId: string) => Promise<void>;
   isUploading?: boolean;
 }
 
 const TaskAttachmentsSection: React.FC<TaskAttachmentsSectionProps> = ({
   attachments,
   onUpload,
   onDelete,
   isUploading = false,
 }) => {
   const { t } = useTranslation();
   const { isRTL } = useLanguage();
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
 
   const tTask = (key: string) => t(`admin.staffTasks.${key}`);
 
   const allowedTypes = [
     "image/png",
     "image/jpeg",
     "image/jpg",
     "text/plain",
     "application/pdf",
     "application/msword",
     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
     "application/vnd.ms-powerpoint",
     "application/vnd.openxmlformats-officedocument.presentationml.presentation",
     "application/vnd.ms-excel",
     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
     "application/zip",
   ];
 
   const maxFileSize = 50 * 1024 * 1024; // 50MB
 
   const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(true);
   };
 
   const handleDragLeave = (e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
   };
 
   const handleDrop = async (e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
     const files = Array.from(e.dataTransfer.files);
     if (files.length > 0) {
       await handleFileUpload(files[0]);
     }
   };
 
   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (files && files.length > 0) {
       await handleFileUpload(files[0]);
     }
     // Reset input
     if (fileInputRef.current) {
       fileInputRef.current.value = "";
     }
   };
 
   const handleFileUpload = async (file: File) => {
     if (!allowedTypes.includes(file.type)) {
       alert(tTask("invalidFileType"));
       return;
     }
     if (file.size > maxFileSize) {
       alert(tTask("fileTooLarge"));
       return;
     }
     await onUpload(file);
   };
 
   const confirmDelete = (attachmentId: string) => {
     setAttachmentToDelete(attachmentId);
     setDeleteDialogOpen(true);
   };
 
   const handleConfirmDelete = async () => {
     if (attachmentToDelete) {
       await onDelete(attachmentToDelete);
       setAttachmentToDelete(null);
     }
     setDeleteDialogOpen(false);
   };
 
   const formatFileSize = (bytes: number): string => {
     if (bytes < 1024) return `${bytes} B`;
     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
   };
 
   const getFileIcon = (type: string) => {
     if (type.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
     if (type === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
     return <File className="h-5 w-5 text-muted-foreground" />;
   };
 
   return (
     <Card className="shadow-[0_2px_8px_hsl(220_20%_20%/0.08),0_4px_16px_hsl(220_20%_20%/0.06)]">
       <CardHeader className="pb-3 border-b border-admin-border-light">
         <CardTitle className="text-base text-primary flex items-center gap-2">
           <Paperclip className="h-4 w-4" />
           {tTask("attachments")}
         </CardTitle>
       </CardHeader>
       <CardContent className="pt-4 space-y-4">
         {/* Upload Area */}
         <div
           className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
             isDragging
               ? "border-primary bg-primary/5"
               : "border-border hover:border-primary/50"
           }`}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}
           onClick={() => fileInputRef.current?.click()}
         >
           <input
             ref={fileInputRef}
             type="file"
             className="hidden"
             onChange={handleFileSelect}
             accept=".png,.jpg,.jpeg,.txt,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
           />
           <Upload className="h-10 w-10 mx-auto text-primary/60 mb-2" />
           <p className="text-sm font-medium">{tTask("dropFileHere")}</p>
           <p className="text-xs text-muted-foreground mt-1">
             PNG, JPG, TXT, PDF, DOC(X), PPT(X), XLS(X), and ZIP.
           </p>
           <p className="text-xs text-muted-foreground">
             {tTask("maxFileSize")}
           </p>
         </div>
 
         {/* Attachments List */}
         {attachments.length > 0 && (
           <div className="space-y-2">
             {attachments.map((attachment) => (
               <div
                 key={attachment.id}
                 className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
               >
                 <div className="flex items-center gap-3 flex-1 min-w-0">
                   {getFileIcon(attachment.type)}
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium truncate">{attachment.name}</p>
                     <p className="text-xs text-muted-foreground">
                       {formatFileSize(attachment.size)} • {attachment.uploadedByName}
                     </p>
                   </div>
                 </div>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-8 w-8 text-muted-foreground hover:text-destructive"
                   onClick={() => confirmDelete(attachment.id)}
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
             ))}
           </div>
         )}
 
         {attachments.length === 0 && (
           <p className="text-sm text-muted-foreground text-center py-2">
             {tTask("noAttachments")}
           </p>
         )}
 
         {/* Delete Confirmation */}
         <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
           <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
             <AlertDialogHeader>
               <AlertDialogTitle>{tTask("deleteAttachmentTitle")}</AlertDialogTitle>
               <AlertDialogDescription>
                 {tTask("deleteAttachmentMessage")}
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
               <AlertDialogCancel>{tTask("cancel")}</AlertDialogCancel>
               <AlertDialogAction
                 onClick={handleConfirmDelete}
                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               >
                 {tTask("delete")}
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       </CardContent>
     </Card>
   );
 };
 
 export default TaskAttachmentsSection;