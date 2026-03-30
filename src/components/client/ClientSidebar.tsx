import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileCheck,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import useLanguage from "@/hooks/useLanguage";
import { ThemeToggleCompact } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ClientSidebar = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const sidebarVariants = {
    collapsed: { width: 64 },
    expanded: { width: 260 },
  };

  const handleOverlayClick = () => setIsExpanded(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActiveRoute = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/client", icon: Home, label: t("client.sidebar.home"), end: true },
    { path: "/client/placement", icon: FileCheck, label: t("client.sidebar.placement") },
    { path: "/client/profile", icon: User, label: t("client.sidebar.profile") },
  ];

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[45]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleOverlayClick}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed top-0 h-screen bg-card border-border z-50 flex flex-col overflow-hidden",
          isRTL ? "right-0 border-l" : "left-0 border-r"
        )}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => { if (!langDropdownOpen) setIsExpanded(false); }}
      >
        {/* Logo Header */}
        <div
          className="h-16 border-b border-border flex items-center px-3 gap-3 flex-shrink-0 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate("/client")}
        >
          <img src={logo} alt="The Pro English" className="h-10 flex-shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                className="text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full whitespace-nowrap"
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                {t("client.sidebar.home")}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActiveRoute(item.path, item.end)
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <div className={cn("flex-shrink-0 flex items-center justify-center", !isExpanded && "w-full")}>
                <item.icon className="h-5 w-5" />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    className="font-medium text-sm whitespace-nowrap"
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* Logout button (always visible as icon) */}
        <div className="p-2">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-destructive hover:bg-destructive/10"
            )}
          >
            <div className={cn("flex-shrink-0 flex items-center justify-center", !isExpanded && "w-full")}>
              <LogOut className="h-5 w-5" />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="font-medium text-sm whitespace-nowrap"
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {t("client.sidebar.logout")}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Footer - Theme & Language */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="p-3 border-t border-border space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between px-2">
                <ThemeToggleCompact />
                <DropdownMenu open={langDropdownOpen} onOpenChange={(open) => {
                  setLangDropdownOpen(open);
                  if (!open) setIsExpanded(false);
                }}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                      {currentLanguage === "ar" ? "العربية" : "English"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => changeLanguage("en")}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage("ar")}>العربية</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
};

export default ClientSidebar;
