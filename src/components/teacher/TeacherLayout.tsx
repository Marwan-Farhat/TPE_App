import React from "react";
import useLanguage from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import TeacherSidebar from "./TeacherSidebar";
import TeacherHeader from "./TeacherHeader";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <TeacherSidebar />
      <div className={cn("transition-all duration-300", isRTL ? "mr-16" : "ml-16")}>
        <TeacherHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default TeacherLayout;
