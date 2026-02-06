import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, Upload, HardDrive, Trash2, FileText, Image, File, Download } from "lucide-react";
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
import { clientFileService } from "@/services/staffTaskService";
import { TaskAttachment } from "@/types/staffTask";
import { useToast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";

interface FilesSectionProps {
  clientId: string;
  maxStorageGB?: number;
}

const FilesSection: React.FC<FilesSectionProps> = ({ clientId, maxStorageGB = 3 }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<TaskAttachment[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [clientId]);

  const loadFiles = () => {
    const clientFiles = clientFileService.getByClientId(clientId);
    setFiles(clientFiles);
  };

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
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleFileUpload(droppedFiles[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFileUpload(selectedFiles[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t("admin.clientProfile.files.invalidType"),
        variant: "destructive",
      });
      return;
    }
    if (file.size > maxFileSize) {
      toast({
        title: t("admin.clientProfile.files.tooLarge"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      clientFileService.addFile(clientId, file, "current-user", "You");
      loadFiles();
      toast({
        title: t("admin.clientProfile.files.uploadSuccess"),
      });
    } catch (error) {
      toast({
        title: t("admin.clientProfile.files.uploadError"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      clientFileService.deleteFile(fileToDelete);
      loadFiles();
      toast({
        title: t("admin.clientProfile.files.deleteSuccess"),
      });
    }
    setFileToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDownload = (file: TaskAttachment) => {
    const fileData = clientFileService.getFileData(file.id);
    if (fileData) {
      const link = document.createElement("a");
      link.href = fileData;
      link.download = file.name;
      link.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-5 w-5 text-primary" />;
    if (type === "application/pdf") return <FileText className="h-5 w-5 text-destructive" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const totalUsed = clientFileService.getTotalFilesSize(clientId);
  const availableSpace = maxStorageGB - totalUsed / (1024 * 1024 * 1024);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
        <CardTitle className="text-primary flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          {t("admin.clientProfile.files.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-primary/30 hover:border-primary/50"
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
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t("admin.clientProfile.files.dropHere")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("admin.clientProfile.files.supportedFormats")}
              </p>
              <p className="text-xs text-muted-foreground">{t("admin.clientProfile.files.maxSize")}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <HardDrive className="h-4 w-4" />
              {t("admin.clientProfile.files.availableSpace")}: {Math.max(0, availableSpace).toFixed(2)} GB
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.uploadedByName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(file.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2 mt-3">
            {t("admin.clientProfile.files.noFiles")}
          </p>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("admin.clientProfile.files.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("admin.clientProfile.files.deleteMessage")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
              <AlertDialogCancel>{t("admin.clients.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("admin.clients.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default FilesSection;
