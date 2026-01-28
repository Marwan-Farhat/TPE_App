import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, List, Search, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const AdminSidebar = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

  const sidebarVariants = {
    collapsed: {
      width: 64,
    },
    expanded: {
      width: 260,
    },
  };

  const handleClientsClick = () => {
    if (!isExpanded) {
      // If collapsed, expand and open clients
      setIsExpanded(true);
      setIsClientsOpen(true);
    } else {
      // If already expanded, toggle clients submenu
      setIsClientsOpen(!isClientsOpen);
    }
  };

  const handleOverlayClick = () => {
    setIsExpanded(false);
    setIsClientsOpen(false);
  };

  return (
    <>
      {/* Overlay for dimming effect */}
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
      >
        {/* Logo Header */}
        <div className="h-16 border-b border-border flex items-center px-3 gap-3 flex-shrink-0">
          <img src={logo} alt="The Pro English" className="h-10 flex-shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap"
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                Admin
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Search - Only visible when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative w-full">
                <Search className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )} />
                <input
                  type="text"
                  placeholder={isRTL ? "...بحث العملاء" : "...Search clients"}
                  dir={isRTL ? "rtl" : "ltr"}
                  className={cn(
                    "w-full h-10 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {/* Clients Category */}
          <div>
            <button
              onClick={handleClientsClick}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors",
                isClientsOpen && isExpanded && "bg-secondary/50 text-foreground"
              )}
            >
              {/* Chevron - Only show when expanded */}
              {isExpanded && (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: isClientsOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              )}
              
              {/* Icon - Always visible */}
              <div className={cn(
                "flex-shrink-0 flex items-center justify-center",
                !isExpanded && "w-full"
              )}>
                <Users className="h-5 w-5 text-primary" />
              </div>

              {/* Label - Only when expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    className="font-medium text-sm whitespace-nowrap flex-1 text-start"
                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    Clients
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Submenu Items */}
            <AnimatePresence>
              {isExpanded && isClientsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={cn("mt-1 space-y-1", isRTL ? "pr-6" : "pl-6")}>
                    {/* Add New Client */}
                    <button
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                    >
                      <UserPlus className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm whitespace-nowrap">Add New Client</span>
                    </button>

                    {/* All Clients */}
                    <button
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                    >
                      <List className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm whitespace-nowrap">All Clients</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
