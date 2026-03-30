import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TestTemplate } from "@/types/testTemplate";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TestTemplate;
}

const TestTemplateViewDialog = ({ open, onOpenChange, template }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {t("admin.placementTests.templates.fields.description")}
            </p>
            <p className="text-foreground">{template.description}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {t("admin.placementTests.templates.fields.price")}
            </p>
            <p className="text-foreground font-semibold">{template.price.toFixed(2)} EGP</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={template.isActive ? "default" : "secondary"}>
              {template.isActive
                ? t("admin.placementTests.templates.fields.active")
                : t("admin.placementTests.templates.inactive")}
            </Badge>
            {template.isCurrent && (
              <Badge className="bg-success/10 text-success border-success/20">
                {t("admin.placementTests.templates.fields.current")}
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {t("admin.placementTests.templates.createdAt")}:{" "}
            {new Date(template.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestTemplateViewDialog;
