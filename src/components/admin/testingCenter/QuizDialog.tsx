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
import { Quiz, QuizFormData, TestType } from "@/types/quiz";
import { quizService } from "@/services/quizService";
import { testTemplateService } from "@/services/testTemplateService";
import { TestTemplate } from "@/types/testTemplate";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: Quiz;
  onSave: () => void;
}

const QuizDialog = ({ open, onOpenChange, quiz, onSave }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isEdit = !!quiz;

  const [form, setForm] = useState<QuizFormData>({
    title: "",
    testType: "placement_test",
    templateId: null,
    instructions: "",
    timeLimit: 0,
    isActive: true,
    isCurrent: false,
  });

  const [templates, setTemplates] = useState<TestTemplate[]>([]);

  useEffect(() => {
    if (quiz) {
      setForm({
        title: quiz.title,
        testType: quiz.testType,
        templateId: quiz.templateId,
        instructions: quiz.instructions,
        timeLimit: quiz.timeLimit,
        isActive: quiz.isActive,
        isCurrent: quiz.isCurrent,
      });
    } else {
      setForm({
        title: "",
        testType: "placement_test",
        templateId: null,
        instructions: "",
        timeLimit: 0,
        isActive: true,
        isCurrent: false,
      });
    }
  }, [quiz, open]);

  useEffect(() => {
    // Load templates based on test type
    if (form.testType === "placement_test") {
      setTemplates(testTemplateService.getActive());
    } else {
      setTemplates([]);
    }
  }, [form.testType, open]);

  const handleTestTypeChange = (value: TestType) => {
    setForm((p) => ({ ...p, testType: value, templateId: null }));
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.instructions.trim() || form.timeLimit <= 0) {
      toast({
        title: t("admin.testingCenter.quizzes.validation.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    if (form.testType === "placement_test" && !form.templateId) {
      toast({
        title: t("admin.testingCenter.quizzes.validation.selectTemplate"),
        variant: "destructive",
      });
      return;
    }

    if (isEdit && quiz) {
      quizService.update(quiz.id, form);
      toast({ title: t("admin.testingCenter.quizzes.updateSuccess") });
    } else {
      quizService.create(form);
      toast({ title: t("admin.testingCenter.quizzes.createSuccess") });
    }

    onSave();
    onOpenChange(false);
  };

  const tq = (key: string) => t(`admin.testingCenter.quizzes.${key}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? tq("editQuiz") : tq("addNewQuiz")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>{tq("fields.title")} *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={tq("fields.title")}
            />
          </div>

          {/* Test Type */}
          <div className="space-y-2">
            <Label>{tq("fields.testType")} *</Label>
            <Select value={form.testType} onValueChange={(v) => handleTestTypeChange(v as TestType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="placement_test">{tq("testTypes.placementTest")}</SelectItem>
                <SelectItem value="practice_exam">{tq("testTypes.practiceExam")}</SelectItem>
                <SelectItem value="final_exam">{tq("testTypes.finalExam")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label>{tq("fields.instructions")} *</Label>
            <Textarea
              value={form.instructions}
              onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
              placeholder={tq("fields.instructions")}
              rows={3}
            />
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <Label>{tq("fields.timeLimit")} *</Label>
            <Input
              type="number"
              min={1}
              value={form.timeLimit}
              onChange={(e) => setForm((p) => ({ ...p, timeLimit: Number(e.target.value) }))}
            />
          </div>

          {/* Conditional: Test Template dropdown */}
          {form.testType === "placement_test" && (
            <div className="space-y-2">
              <Label>{tq("fields.testTemplate")} *</Label>
              <Select
                value={form.templateId || ""}
                onValueChange={(v) => setForm((p) => ({ ...p, templateId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tq("fields.selectTemplate")} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {templates.map((tmpl) => (
                    <SelectItem key={tmpl.id} value={tmpl.id}>
                      {tmpl.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Future: practice_exam / final_exam template dropdowns */}
          {form.testType === "practice_exam" && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              {tq("comingSoon")}
            </div>
          )}
          {form.testType === "final_exam" && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              {tq("comingSoon")}
            </div>
          )}

          {/* Active */}
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
            />
            <Label>{tq("fields.active")}</Label>
          </div>

          {/* Current */}
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isCurrent}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, isCurrent: checked }))}
            />
            <Label>{tq("fields.current")}</Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tq("cancel")}
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            {isEdit ? tq("save") : tq("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog;
