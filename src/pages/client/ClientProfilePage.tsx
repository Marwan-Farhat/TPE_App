import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Mail, Shield, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const ClientProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const fields = [
    { icon: User, label: t("client.profile.fullName"), value: user?.fullName },
    { icon: Mail, label: t("client.profile.email"), value: user?.email },
    { icon: Shield, label: t("client.profile.role"), value: user?.role },
    { icon: Monitor, label: t("client.profile.interface"), value: user?.interface },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          {t("client.profile.title")}
        </h1>

        {/* Avatar Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-24" />
          <CardContent className="relative pt-0 pb-6">
            <Avatar className="h-20 w-20 border-4 border-card -mt-10 shadow-lg">
              <AvatarFallback className="bg-amber-500 text-white text-xl font-bold">
                {user?.fullName ? getInitials(user.fullName) : "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="mt-3">
              <h2 className="text-xl font-semibold text-foreground">{user?.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {fields.map((field, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/40"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <field.icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium text-foreground">{field.value || "—"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClientProfilePage;
