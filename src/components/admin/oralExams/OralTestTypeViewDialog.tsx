import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OralTestType } from "@/types/oralTestType";
import { testTemplateService } from "@/services/testTemplateService";
import useLanguage from "@/hooks/useLanguage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testType: OralTestType | null;
}

const OralTestTypeViewDialog = ({ open, onOpenChange, testType }: Props) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  if (!testType) return null;

  const tKey = (key: string) => t(`admin.oralExams.testTypes.${key}`);
  const template = testType.templateId ? testTemplateService.getById(testType.templateId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{testType.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {tKey(`categories.${testType.category === "placement_test" ? "placementTest" : "course"}`)}
            </Badge>
            <Badge variant={testType.isActive ? "default" : "secondary"}>
              {testType.isActive ? tKey("active") : tKey("inactive")}
            </Badge>
          </div>

          {template && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tKey("fields.testTemplate")}</p>
              <p className="text-sm">{template.title}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">{tKey("fields.description")}</p>
            <p className="text-sm">{testType.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tKey("fields.duration")}</p>
              <p className="text-sm">{testType.duration} {t("admin.coordination.timeSlots.minutes")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tKey("fields.totalScore")}</p>
              <p className="text-sm">{testType.totalScore}</p>
            </div>
          </div>

          {testType.evaluationCriteria && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tKey("fields.evaluationCriteria")}</p>
              <p className="text-sm whitespace-pre-wrap">{testType.evaluationCriteria}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">{tKey("createdAt")}</p>
            <p className="text-sm">{new Date(testType.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tKey("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OralTestTypeViewDialog;
