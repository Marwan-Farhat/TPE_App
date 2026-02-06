import React from "react";
import { useTranslation } from "react-i18next";
import { Route, AlertTriangle, ChevronDown, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import useLanguage from "@/hooks/useLanguage";

interface TrainingPathSectionProps {
  currentPath?: string;
  pathCost?: number;
  paidForPath?: number;
}

const TrainingPathSection: React.FC<TrainingPathSectionProps> = ({ currentPath, pathCost, paidForPath }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(true);

  const hasPath = !!currentPath;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-admin-section-alt border-b border-admin-border-light">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">
              <Route className="h-5 w-5" />
              {t("admin.clientProfile.trainingPath.title")}
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-2">
            {hasPath ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{currentPath}</span>
                  <span className="text-sm text-muted-foreground">
                    ${paidForPath?.toLocaleString()} / ${pathCost?.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pathCost ? ((paidForPath || 0) / pathCost) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                    {t("admin.clientProfile.trainingPath.noPathWarning")}
                  </AlertDescription>
                </Alert>
                <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <Edit className="h-4 w-4" />
                  {t("admin.clientProfile.trainingPath.selectCreatePath")}
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default TrainingPathSection;