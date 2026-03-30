import React from "react";
import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderTabProps {
  tabName: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ tabName }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t(`admin.clientProfile.tabs.${tabName}`)}</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {t("admin.clientProfile.comingSoon")}
          <br />
          {t("admin.clientProfile.featureNotAvailable")}
        </p>
      </CardContent>
    </Card>
  );
};

export default PlaceholderTab;
