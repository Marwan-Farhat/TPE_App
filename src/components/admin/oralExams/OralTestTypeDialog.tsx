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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OralTestType, OralTestTypeFormData, OralExamCategory } from "@/types/oralTestType";
import { oralTestTypeService } from "@/services/oralTestTypeService";
import { testTemplateService } from "@/services/testTemplateService";
import { useToast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testType?: OralTestType;
  onSave: () => void;
}

const OralTestTypeDialog = ({ open, onOpenChange, testType, onSave }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const isEdit = !!testType;

  const [form, setForm] = useState<OralTestTypeFormData>({
    title: "",
    category: "placement_test",
    templateId: null,
    description: "",
    duration: 30,
    totalScore: 100,
    evaluationCriteria: "",
    isActive: true,
  });

  const templates = testTemplateService.getActive();

  useEffect(() => {
    if (testType) {
      setForm({
        title: testType.title,
        category: testType.category,
        templateId: testType.templateId,
        description: testType.description,
        duration: testType.duration,
        totalScore: testType.totalScore,
        evaluationCriteria: testType.evaluationCriteria,
        isActive: testType.isActive,
      });
    } else {
      setForm({
        title: "",
        category: "placement_test",
        templateId: null,
        description: "",
        duration: 30,
        totalScore: 100,
        evaluationCriteria: "",
        isActive: true,
      });
    }
  }, [testType, open]);

  const tKey = (key: string) => t(`admin.oralExams.testTypes.${key}`);

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim() || form.duration <= 0 || form.totalScore <= 0) {
      toast({ title: tKey("validation.fillRequired"), variant: "destructive" });
      return;
    }

    if (!form.templateId) {
      toast({ title: form.category === "placement_test" ? tKey("validation.templateRequired") : tKey("validation.courseRequired"), variant: "destructive" });
      return;
    }

    if (isEdit && testType) {
      oralTestTypeService.update(testType.id, form);
      toast({ title: tKey("updateSuccess") });
    } else {
      oralTestTypeService.create(form);
      toast({ title: tKey("createSuccess") });
    }

    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? tKey("editTestType") : tKey("addNewTestType")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>{tKey("fields.title")} *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={tKey("fields.title")}
            />
          </div>

          {/* Category / Type */}
          <div className="space-y-2">
            <Label>{tKey("fields.type")} *</Label>
            <Select
              value={form.category}
              onValueChange={(val) =>
                setForm((p) => ({
                  ...p,
                  category: val as OralExamCategory,
                  templateId: val === "placement_test" ? p.templateId : null,
                }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[100]">
                <SelectItem value="placement_test">{tKey("categories.placementTest")}</SelectItem>
                <SelectItem value="course" disabled>{tKey("categories.course")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Placement Test / Course linked item */}
          <div className="space-y-2">
            <Label>{tKey("fields.placementTestCourse")} *</Label>
            <Select
              value={form.templateId || ""}
              onValueChange={(val) => setForm((p) => ({ ...p, templateId: val }))}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={
                  form.category === "placement_test"
                    ? tKey("fields.selectTemplate")
                    : tKey("fields.selectCourse")
                } />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[100]">
                {form.category === "placement_test" ? (
                  templates.length > 0 ? templates.map((tmpl) => (
                    <SelectItem key={tmpl.id} value={tmpl.id}>
                      {tmpl.title}
                    </SelectItem>
                  )) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {tKey("fields.noTemplates")}
                    </div>
                  )
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {tKey("fields.noCourses")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{tKey("fields.description")} *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={tKey("fields.description")}
              rows={3}
            />
          </div>

          {/* Duration & Total Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tKey("fields.duration")} *</Label>
              <Input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{tKey("fields.totalScore")} *</Label>
              <Input
                type="number"
                min={1}
                value={form.totalScore}
                onChange={(e) => setForm((p) => ({ ...p, totalScore: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="space-y-2">
            <Label>{tKey("fields.evaluationCriteria")} *</Label>
            <Textarea
              value={form.evaluationCriteria}
              onChange={(e) => setForm((p) => ({ ...p, evaluationCriteria: e.target.value }))}
              placeholder={tKey("fields.evaluationCriteriaPlaceholder")}
              rows={3}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
            />
            <Label>{tKey("fields.active")}</Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tKey("cancel")}
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            {isEdit ? tKey("save") : tKey("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OralTestTypeDialog;
