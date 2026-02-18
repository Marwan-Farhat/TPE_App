import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Eye, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import useLanguage from "@/hooks/useLanguage";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/hooks/use-toast";
import { TestTemplate } from "@/types/testTemplate";
import { testTemplateService } from "@/services/testTemplateService";
import TestTemplateDialog from "@/components/admin/placementTests/TestTemplateDialog";
import TestTemplateViewDialog from "@/components/admin/placementTests/TestTemplateViewDialog";

const TestTemplatesList = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TestTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<TestTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadTemplates = () => {
    setTemplates(testTemplateService.getAll());
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleToggleActive = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template?.isActive && template?.isCurrent) {
      toast({
        title: t("admin.placementTests.templates.cannotDeactivateCurrent"),
        variant: "destructive",
      });
      return;
    }
    const result = testTemplateService.toggleActive(id);
    if (result) loadTemplates();
  };

  const handleToggleCurrent = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template?.isCurrent) {
      toast({
        title: t("admin.placementTests.templates.cannotUnsetCurrent"),
        variant: "destructive",
      });
      return;
    }
    if (!template?.isActive) {
      toast({
        title: t("admin.placementTests.templates.mustBeActive"),
        variant: "destructive",
      });
      return;
    }
    const result = testTemplateService.toggleCurrent(id);
    if (result) {
      loadTemplates();
      toast({ title: t("admin.placementTests.templates.currentUpdated") });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const template = templates.find((t) => t.id === deleteId);
    if (template?.isCurrent) {
      toast({
        title: t("admin.placementTests.templates.cannotDeleteCurrent"),
        variant: "destructive",
      });
      setDeleteId(null);
      return;
    }
    const success = testTemplateService.remove(deleteId);
    if (success) {
      loadTemplates();
      toast({ title: t("admin.placementTests.templates.deleteSuccess") });
    }
    setDeleteId(null);
  };

  const handleSave = () => {
    loadTemplates();
    setIsAddOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="min-h-screen admin-page-bg" dir={isRTL ? "rtl" : "ltr"}>
      <AdminSidebar />
      <main className={cn("transition-all duration-300 pt-6 pb-10", isRTL ? "mr-16 ml-4" : "ml-16 mr-4")}>
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("admin.placementTests.templates.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("admin.placementTests.templates.subtitle")}
              </p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="gradient-primary text-white gap-2">
              <Plus className="h-4 w-4" />
              {t("admin.placementTests.templates.addTemplate")}
            </Button>
          </div>

          {/* Table */}
          <div className="admin-section p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>{t("admin.placementTests.templates.fields.title")}</TableHead>
                  <TableHead>{t("admin.placementTests.templates.fields.description")}</TableHead>
                  <TableHead className="text-center">{t("admin.placementTests.templates.fields.price")}</TableHead>
                  <TableHead className="text-center">{t("admin.placementTests.templates.fields.active")}</TableHead>
                  <TableHead className="text-center">{t("admin.placementTests.templates.fields.current")}</TableHead>
                  <TableHead className="text-center">{t("admin.placementTests.templates.fields.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {t("admin.placementTests.templates.noTemplates")}
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium max-w-[200px] truncate">{template.title}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px] truncate">
                        {template.description}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {template.price.toFixed(2)} EGP
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleToggleActive(template.id)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {template.isActive
                              ? t("admin.placementTests.templates.yes")
                              : t("admin.placementTests.templates.no")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={template.isCurrent}
                            onCheckedChange={() => handleToggleCurrent(template.id)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {template.isCurrent
                              ? t("admin.placementTests.templates.yes")
                              : t("admin.placementTests.templates.no")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewingTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-popover">
                              <DropdownMenuItem
                                onClick={() => setDeleteId(template.id)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 me-2" />
                                {t("admin.placementTests.templates.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Add Dialog */}
      <TestTemplateDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSave={handleSave}
      />

      {/* Edit Dialog */}
      {editingTemplate && (
        <TestTemplateDialog
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          template={editingTemplate}
          onSave={handleSave}
        />
      )}

      {/* View Dialog */}
      {viewingTemplate && (
        <TestTemplateViewDialog
          open={!!viewingTemplate}
          onOpenChange={(open) => !open && setViewingTemplate(null)}
          template={viewingTemplate}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.placementTests.templates.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.placementTests.templates.deleteMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.placementTests.templates.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t("admin.placementTests.templates.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestTemplatesList;
