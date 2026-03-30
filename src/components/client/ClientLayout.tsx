import React from "react";
import { Outlet } from "react-router-dom";
import useLanguage from "@/hooks/useLanguage";
import ClientSidebar from "./ClientSidebar";

const ClientLayout: React.FC = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex" dir={isRTL ? "rtl" : "ltr"}>
      <ClientSidebar />
      <div className={`flex-1 transition-all duration-300 ${isRTL ? "mr-16" : "ml-16"}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default ClientLayout;
