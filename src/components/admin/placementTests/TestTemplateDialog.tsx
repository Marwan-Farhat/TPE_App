import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TestTemplate, TestTemplateFormData } from "@/types/testTemplate";
import { testTemplateService } from "@/services/testTemplateService";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: TestTemplate;
  onSave: () => void;
}

const TestTemplateDialog = ({ open, onOpenChange, template, onSave }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isEdit = !!template;

  const [form, setForm] = useState<TestTemplateFormData>({
    title: "",
    description: "",
    price: 0,
    isActive: true,
    isCurrent: false,
  });

  useEffect(() => {
    if (template) {
      setForm({
        title: template.title,
        description: template.description,
        price: template.price,
        isActive: template.isActive,
        isCurrent: template.isCurrent,
      });
    } else {
      setForm({ title: "", description: "", price: 0, isActive: true, isCurrent: false });
    }
  }, [template, open]);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim() || form.price <= 0) {
      toast({
        title: t("admin.placementTests.templates.validation.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    if (isEdit && template) {
      testTemplateService.update(template.id, form);
      toast({ title: t("admin.placementTests.templates.updateSuccess") });
    } else {
      testTemplateService.create(form);
      toast({ title: t("admin.placementTests.templates.createSuccess") });
    }

    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("admin.placementTests.templates.editTemplate")
              : t("admin.placementTests.templates.addNewTemplate")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>{t("admin.placementTests.templates.fields.title")} *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t("admin.placementTests.templates.fields.title")}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{t("admin.placementTests.templates.fields.description")} *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={t("admin.placementTests.templates.fields.description")}
              rows={4}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label>{t("admin.placementTests.templates.fields.price")} *</Label>
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
            />
            <Label>{t("admin.placementTests.templates.fields.active")}</Label>
          </div>

          {/* Current */}
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isCurrent}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, isCurrent: checked }))}
            />
            <Label>{t("admin.placementTests.templates.fields.current")}</Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.placementTests.templates.cancel")}
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            {isEdit
              ? t("admin.placementTests.templates.save")
              : t("admin.placementTests.templates.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestTemplateDialog;
