import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StickyNote, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import useLanguage from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface NotesSectionProps {
  notes?: Note[];
  onAddNote?: (content: string) => void;
  onEditNote?: (id: string, content: string) => void;
  onDeleteNote?: (id: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes = [], onAddNote, onEditNote, onDeleteNote }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        title: t("admin.clientProfile.notes.emptyNote", "Please enter a note"),
        variant: "destructive",
      });
      return;
    }

    if (onAddNote) {
      onAddNote(newNote);
    }

    toast({
      title: t("admin.clientProfile.notes.addedSuccess", "Note added successfully"),
    });

    setNewNote("");
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingId) return;

    if (onEditNote) {
      onEditNote(editingId, editContent);
    }

    toast({
      title: t("admin.clientProfile.notes.editedSuccess", "Note updated successfully"),
    });

    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleDeleteClick = (id: string) => {
    setNoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete && onDeleteNote) {
      onDeleteNote(noteToDelete);
      toast({
        title: t("admin.clientProfile.notes.deletedSuccess", "Note deleted successfully"),
      });
    }
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  return (
    <Card className="overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
        <CardTitle className={`text-primary flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
          <StickyNote className="h-5 w-5" />
          {t("admin.clientProfile.notes.title", "Staff Notes")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Existing Notes at Top */}
        {notes.length > 0 && (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-3 bg-muted/50 rounded-lg border border-border">
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                    <div className={`flex gap-2 ${isRTL ? "justify-start" : "justify-end"}`}>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 px-2">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit} className="h-7 px-2 bg-primary hover:bg-primary/90">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`flex items-start justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <p className={`text-sm flex-1 ${isRTL ? "text-right" : "text-left"}`}>{note.content}</p>
                      <div className={`flex gap-1 flex-shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(note)}
                          className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(note.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${isRTL ? "flex-row-reverse justify-end" : ""}`}
                    >
                      <span>{note.createdBy}</span>
                      <span>•</span>
                      <span>{note.createdAt}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Note - Below existing notes */}
        {notes.length > 0 && <div className="border-t border-border pt-4" />}
        <div className="space-y-3">
          <Label htmlFor="new-note" className={`text-sm font-medium ${isRTL ? "text-right block" : ""}`}>
            {t("admin.clientProfile.notes.newNote", "New note")}
          </Label>
          <Textarea
            id="new-note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={t("admin.clientProfile.notes.placeholder", "Type your note here...")}
            className={`min-h-[80px] resize-none border-primary/30 focus:border-primary ${isRTL ? "text-right" : ""}`}
          />
          <Button
            onClick={handleAddNote}
            size="sm"
            className={`gap-2 bg-primary hover:bg-primary/90 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Plus className="h-4 w-4" />
            {t("admin.clientProfile.notes.addNote", "Add note")}
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
            <AlertDialogHeader>
              <AlertDialogTitle className={isRTL ? "text-right" : ""}>
                {t("admin.clientProfile.notes.deleteConfirmTitle", "Delete Note")}
              </AlertDialogTitle>
              <AlertDialogDescription className={isRTL ? "text-right" : ""}>
                {t("admin.clientProfile.notes.deleteConfirmMessage", "Are you sure you want to delete this note? This action cannot be undone.")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel>
                {t("admin.clientProfile.notes.cancel", "Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("admin.clientProfile.notes.delete", "Delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default NotesSection;