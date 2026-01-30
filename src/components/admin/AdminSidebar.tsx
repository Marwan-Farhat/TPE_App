import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, List, Search, ChevronRight, User, Phone, Mail, Loader2, Languages, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
import { clientService } from '@/services/clientService';
import { Client } from '@/types/client';
import useLanguage from '@/hooks/useLanguage';
import { ThemeToggleCompact } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(
    location.pathname.includes('/admin/clients')
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const sidebarVariants = {
    collapsed: {
      width: 64,
    },
    expanded: {
      width: 260,
    },
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await clientService.search(searchQuery);
        setSearchResults(results.slice(0, 5)); // Limit to 5 results
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleClientsClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setIsClientsOpen(true);
    } else {
      setIsClientsOpen(!isClientsOpen);
    }
  };

  const handleOverlayClick = () => {
    setIsExpanded(false);
    setIsClientsOpen(false);
    setShowResults(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsExpanded(false);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleResultClick = (clientId: string) => {
    navigate(`/admin/clients/${clientId}`);
    setIsExpanded(false);
    setSearchQuery('');
    setShowResults(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">{part}</mark> : part
    );
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
        {/* Logo Header - Clickable to navigate to admin home */}
        <div 
          className="h-16 border-b border-border flex items-center px-3 gap-3 flex-shrink-0 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/admin')}
        >
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
                {t('admin.sidebar.admin')}
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
              ref={searchRef}
            >
              <div className="relative w-full">
                {isSearching ? (
                  <Loader2 className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin",
                    isRTL ? "right-3" : "left-3"
                  )} />
                ) : (
                  <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                    isRTL ? "right-3" : "left-3"
                  )} />
                )}
                <input
                  type="text"
                  placeholder={t('admin.sidebar.search')}
                  dir={isRTL ? "rtl" : "ltr"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowResults(true)}
                  className={cn(
                    "w-full h-10 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                />
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {searchResults.map((client) => (
                          <button
                            key={client.id}
                            onClick={() => handleResultClick(client.id)}
                            className="w-full p-3 hover:bg-accent text-left transition-colors border-b border-border last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {highlightMatch(client.name, searchQuery)}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1 truncate">
                                    <Phone className="h-3 w-3" />
                                    {highlightMatch(client.phoneNumber, searchQuery)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                  <Mail className="h-3 w-3" />
                                  {highlightMatch(client.email, searchQuery)}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* View All Results */}
                      <button
                        onClick={() => {
                          navigate(`/admin/clients?search=${encodeURIComponent(searchQuery)}`);
                          setIsExpanded(false);
                          setSearchQuery('');
                          setShowResults(false);
                        }}
                        className="w-full p-2 text-xs text-center text-primary hover:bg-accent transition-colors border-t border-border"
                      >
                        {t('admin.sidebar.viewAllResults')} →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* No Results */}
                <AnimatePresence>
                  {showResults && searchQuery.trim() && searchResults.length === 0 && !isSearching && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 z-50"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <User className="h-6 w-6 opacity-50" />
                        <p className="text-sm">{t('admin.sidebar.noClientsFound')}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                (isClientsOpen && isExpanded) && "bg-secondary/50 text-foreground"
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
                    {t('admin.sidebar.clients')}
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
                      onClick={() => handleNavigation('/admin/clients/add')}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                        isActiveRoute('/admin/clients/add')
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <UserPlus className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm whitespace-nowrap">{t('admin.sidebar.addNewClient')}</span>
                    </button>

                    {/* All Clients */}
                    <button
                      onClick={() => handleNavigation('/admin/clients')}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                        isActiveRoute('/admin/clients')
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <List className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm whitespace-nowrap">{t('admin.sidebar.allClients')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Bottom Controls - Language & Theme */}
        <div className="p-2 border-t border-border flex-shrink-0 space-y-2">
          <AnimatePresence>
            {isExpanded ? (
              // Expanded view
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Language Switcher */}
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5 justify-between text-xs">
                        <span>{currentLanguage === "ar" ? "العربية" : "English"}</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-popover" align={isRTL ? "end" : "start"}>
                      <DropdownMenuItem
                        onClick={() => changeLanguage("en")}
                        className={`cursor-pointer ${currentLanguage === "en" ? 'bg-secondary' : ''}`}
                      >
                        English
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => changeLanguage("ar")}
                        className={`cursor-pointer ${currentLanguage === "ar" ? 'bg-secondary' : ''}`}
                      >
                        العربية
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center gap-2">
                  <ThemeToggleCompact />
                </div>
              </motion.div>
            ) : (
              // Collapsed view
              <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Language Switcher Icon */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                      <Languages className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover" align={isRTL ? "end" : "start"}>
                    <DropdownMenuItem
                      onClick={() => changeLanguage("en")}
                      className={`cursor-pointer ${currentLanguage === "en" ? 'bg-secondary' : ''}`}
                    >
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => changeLanguage("ar")}
                      className={`cursor-pointer ${currentLanguage === "ar" ? 'bg-secondary' : ''}`}
                    >
                      العربية
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <ThemeToggleCompact />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;