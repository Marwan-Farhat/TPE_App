import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Eye, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import AdminSidebar from "@/components/admin/AdminSidebar";
import OralTestTypeDialog from "@/components/admin/oralExams/OralTestTypeDialog";
import OralTestTypeViewDialog from "@/components/admin/oralExams/OralTestTypeViewDialog";
import { OralTestType } from "@/types/oralTestType";
import { oralTestTypeService } from "@/services/oralTestTypeService";
import { useToast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const OralTestTypesList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [items, setItems] = useState<OralTestType[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editItem, setEditItem] = useState<OralTestType | undefined>();
  const [viewItem, setViewItem] = useState<OralTestType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tKey = (key: string) => t(`admin.oralExams.testTypes.${key}`);

  const reload = () => setItems(oralTestTypeService.getAll());
  useEffect(() => reload(), []);

  const handleEdit = (item: OralTestType) => {
    setEditItem(item);
    setShowDialog(true);
  };

  const handleView = (item: OralTestType) => {
    setViewItem(item);
    setShowViewDialog(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const success = oralTestTypeService.remove(deleteId);
    if (success) {
      toast({ title: tKey("deleteSuccess") });
      reload();
    }
    setDeleteId(null);
  };

  const handleToggleActive = (id: string) => {
    oralTestTypeService.toggleActive(id);
    reload();
  };

  return (
    <div className="flex min-h-screen bg-admin-bg" dir={isRTL ? "rtl" : "ltr"}>
      <AdminSidebar />
      <main className={cn("flex-1 p-6", isRTL ? "mr-16" : "ml-16")}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{tKey("title")}</h1>
              <p className="text-muted-foreground">{tKey("subtitle")}</p>
            </div>
            <Button
              onClick={() => { setEditItem(undefined); setShowDialog(true); }}
              className="gradient-primary text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              {tKey("addTestType")}
            </Button>
          </div>

          {/* Table */}
          <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
            {items.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {tKey("noTestTypes")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead>{tKey("fields.title")}</TableHead>
                    <TableHead>{tKey("fields.type")}</TableHead>
                    <TableHead>{tKey("fields.description")}</TableHead>
                    <TableHead>{tKey("fields.duration")}</TableHead>
                    <TableHead>{tKey("fields.totalScore")}</TableHead>
                    <TableHead>{tKey("fields.evaluationCriteria")}</TableHead>
                    <TableHead>{tKey("fields.status")}</TableHead>
                    <TableHead>{tKey("fields.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {tKey(`categories.${item.category === "placement_test" ? "placementTest" : "course"}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>{item.totalScore}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {item.evaluationCriteria || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleToggleActive(item.id)}
                          />
                          <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                            {item.isActive ? tKey("active") : tKey("inactive")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-popover z-50" align={isRTL ? "start" : "end"}>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(item.id)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 me-2" />
                                {tKey("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <OralTestTypeDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          testType={editItem}
          onSave={reload}
        />

        <OralTestTypeViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          testType={viewItem}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
            <AlertDialogHeader>
              <AlertDialogTitle>{tKey("deleteConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>{tKey("deleteMessage")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tKey("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                {tKey("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default OralTestTypesList;
