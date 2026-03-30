import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { levelService } from "@/services/levelService";
import { Level } from "@/types/evaluation";
import { toast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";

const LevelsList = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const [levels, setLevels] = useState(levelService.getAll().sort((a, b) => a.order - b.order));
  const [showDialog, setShowDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const refresh = () => setLevels(levelService.getAll().sort((a, b) => a.order - b.order));

  const openAdd = () => {
    setEditingLevel(null);
    setNameEn(""); setNameAr(""); setOrder(levels.length + 1); setIsActive(true);
    setShowDialog(true);
  };

  const openEdit = (l: Level) => {
    setEditingLevel(l);
    setNameEn(l.nameEn); setNameAr(l.nameAr); setOrder(l.order); setIsActive(l.isActive);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!nameEn.trim() || !nameAr.trim()) return;
    if (editingLevel) {
      levelService.update(editingLevel.id, { nameEn, nameAr, order, isActive });
      toast({ title: t("admin.evaluation.levels.updateSuccess") });
    } else {
      levelService.create({ nameEn, nameAr, order, isActive });
      toast({ title: t("admin.evaluation.levels.createSuccess") });
    }
    setShowDialog(false);
    refresh();
  };

  const handleDelete = () => {
    if (deletingId) {
      levelService.remove(deletingId);
      toast({ title: t("admin.evaluation.levels.deleteSuccess") });
      setDeletingId(null);
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isRTL ? "mr-16" : "ml-16"}`}>
        <div className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-6 w-6 text-primary" />
                  {t("admin.evaluation.levels.title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.evaluation.levels.subtitle")}</p>
              </div>
              <Button onClick={openAdd} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-1" /> {t("admin.evaluation.levels.add")}
              </Button>
            </div>

            <div className="space-y-2">
              {levels.map((level, i) => (
                <motion.div
                  key={level.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                      {level.order}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {currentLanguage === "ar" ? level.nameAr : level.nameEn}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {currentLanguage === "ar" ? level.nameEn : level.nameAr}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${level.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {level.isActive ? t("admin.evaluation.active") : t("admin.evaluation.inactive")}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(level)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingId(level.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLevel ? t("admin.evaluation.levels.edit") : t("admin.evaluation.levels.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("admin.evaluation.nameEn")}</label>
              <Input value={nameEn} onChange={e => setNameEn(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.evaluation.nameAr")}</label>
              <Input value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.evaluation.levels.order")}</label>
              <Input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 1)} min={1} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <label className="text-sm">{t("admin.evaluation.active")}</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t("admin.evaluation.cancel")}</Button>
            <Button onClick={handleSave} disabled={!nameEn.trim() || !nameAr.trim()}>{t("admin.evaluation.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.evaluation.levels.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.evaluation.levels.deleteMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.evaluation.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("admin.evaluation.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LevelsList;
