 import React, { useState } from "react";
 import { useTranslation } from "react-i18next";
 import { format } from "date-fns";
 import { User, Clock, Edit2, Trash2, Plus, Info, Check, X } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
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
 import { TaskNote } from "@/types/staffTask";
 import useLanguage from "@/hooks/useLanguage";
 
 interface TaskNotesSectionProps {
   notes: TaskNote[];
   onAddNote: (content: string) => Promise<void>;
   onEditNote: (noteId: string, content: string) => Promise<void>;
   onDeleteNote: (noteId: string) => Promise<void>;
 }
 
 const TaskNotesSection: React.FC<TaskNotesSectionProps> = ({
   notes,
   onAddNote,
   onEditNote,
   onDeleteNote,
 }) => {
   const { t } = useTranslation();
   const { isRTL } = useLanguage();
 
   const [newNote, setNewNote] = useState("");
   const [isAddingNote, setIsAddingNote] = useState(false);
   const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
   const [editingContent, setEditingContent] = useState("");
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
 
   const tTask = (key: string) => t(`admin.staffTasks.${key}`);
 
   const formatDate = (dateStr: string) => {
     return format(new Date(dateStr), "dd/MM/yyyy, hh:mm a");
   };
 
   const handleAddNote = async () => {
     if (!newNote.trim()) return;
     setIsAddingNote(true);
     try {
       await onAddNote(newNote.trim());
       setNewNote("");
     } finally {
       setIsAddingNote(false);
     }
   };
 
   const startEditing = (note: TaskNote) => {
     setEditingNoteId(note.id);
     setEditingContent(note.content);
   };
 
   const cancelEditing = () => {
     setEditingNoteId(null);
     setEditingContent("");
   };
 
   const saveEdit = async () => {
     if (!editingNoteId || !editingContent.trim()) return;
     await onEditNote(editingNoteId, editingContent.trim());
     setEditingNoteId(null);
     setEditingContent("");
   };
 
   const confirmDelete = (noteId: string) => {
     setNoteToDelete(noteId);
     setDeleteDialogOpen(true);
   };
 
   const handleConfirmDelete = async () => {
     if (noteToDelete) {
       await onDeleteNote(noteToDelete);
       setNoteToDelete(null);
     }
     setDeleteDialogOpen(false);
   };
 
   return (
     <Card className="shadow-[0_2px_8px_hsl(220_20%_20%/0.08),0_4px_16px_hsl(220_20%_20%/0.06)]">
       <CardHeader className="pb-3 border-b border-admin-border-light">
         <CardTitle className="text-base text-primary">
           {tTask("updatesAndNotes")}
         </CardTitle>
       </CardHeader>
       <CardContent className="pt-4">
         {/* Existing Notes */}
         {notes.length > 0 ? (
           <div className="space-y-3 mb-4">
             {notes.map((note) => (
               <div
                 key={note.id}
                 className="p-3 bg-muted/50 rounded-lg border border-border"
               >
                 {editingNoteId === note.id ? (
                   <div className="space-y-2">
                     <Textarea
                       value={editingContent}
                       onChange={(e) => setEditingContent(e.target.value)}
                       rows={3}
                       autoFocus
                     />
                     <div className="flex gap-2">
                       <Button size="sm" onClick={saveEdit} disabled={!editingContent.trim()}>
                         <Check className="h-4 w-4 me-1" />
                         {tTask("save")}
                       </Button>
                       <Button size="sm" variant="outline" onClick={cancelEditing}>
                         <X className="h-4 w-4 me-1" />
                         {tTask("cancel")}
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <>
                     <p className="text-sm">{note.content}</p>
                     <div className="flex items-center justify-between mt-2">
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <User className="h-3 w-3" />
                         <span>{note.createdByName}</span>
                         <Clock className="h-3 w-3 ms-2" />
                         <span>{formatDate(note.createdAt)}</span>
                       </div>
                       <div className="flex gap-1">
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7"
                           onClick={() => startEditing(note)}
                         >
                           <Edit2 className="h-3.5 w-3.5" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7 text-destructive hover:text-destructive"
                           onClick={() => confirmDelete(note.id)}
                         >
                           <Trash2 className="h-3.5 w-3.5" />
                         </Button>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             ))}
           </div>
         ) : (
           <p className="text-sm text-muted-foreground mb-4">
             {tTask("noNotes")}
           </p>
         )}
 
         {/* Add Note */}
         <div className="space-y-2">
           <div className="flex items-center gap-1">
             <span className="text-sm font-medium">{tTask("newNote")}</span>
             <Info className="h-3.5 w-3.5 text-muted-foreground" />
           </div>
           <Textarea
             value={newNote}
             onChange={(e) => setNewNote(e.target.value)}
             placeholder={tTask("newNoteTooltip")}
             rows={3}
           />
           <Button
             size="sm"
             onClick={handleAddNote}
             disabled={!newNote.trim() || isAddingNote}
           >
             <Plus className="h-4 w-4 me-1" />
             {tTask("addNote")}
           </Button>
         </div>
 
         {/* Delete Confirmation */}
         <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
           <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
             <AlertDialogHeader>
               <AlertDialogTitle>{tTask("deleteNoteConfirmTitle")}</AlertDialogTitle>
               <AlertDialogDescription>
                 {tTask("deleteNoteConfirmMessage")}
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
 
 export default TaskNotesSection;