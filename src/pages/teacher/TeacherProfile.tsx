import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/contexts/AuthContext";
import TeacherLayout from "@/components/teacher/TeacherLayout";

const TeacherProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const fields = [
    { icon: User, label: t("teacher.profile.fullName"), value: user?.fullName },
    { icon: Mail, label: t("teacher.profile.email"), value: user?.email },
    { icon: Shield, label: t("teacher.profile.role"), value: user?.role },
    { icon: Calendar, label: t("teacher.profile.interface"), value: user?.interface },
  ];

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <User className="h-6 w-6 text-emerald-600" />
          {t("teacher.profile.title")}
        </h1>

        <div className="bg-card border border-border rounded-xl p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-xl font-bold text-emerald-600">
                {user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user?.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.label} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <field.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium text-foreground">{field.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </TeacherLayout>
  );
};

export default TeacherProfile;
