import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronRight, Sparkles, Info, LayoutGrid, HelpCircle, Star, Newspaper } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";
import { ThemeToggle, ThemeToggleCompact } from "@/components/ThemeToggle";

const navLinksData = [
  { nameKey: "nav.home", href: "#home", icon: Sparkles },
  { nameKey: "nav.about", href: "#about", icon: Info },
  { nameKey: "nav.courses", href: "#courses", icon: LayoutGrid },
  { nameKey: "nav.faqs", href: "#faqs", icon: HelpCircle },
  { nameKey: "nav.successStories", href: "#success-stories", icon: Star },
  { nameKey: "nav.news", href: "#news", icon: Newspaper, hasDropdown: true },
  { nameKey: "nav.start", href: "#start", icon: ChevronRight, isArrow: true },
];

const languages = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const sections = navLinksData.map(link => link.href.replace("#", ""));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 bg-background border-b transition-all duration-300 ${
        isScrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.a 
            href="#home" 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <img src={logo} alt="The Pro English" className="h-12 w-auto" />
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinksData.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <motion.button
                  key={link.nameKey}
                  onClick={() => scrollToSection(link.href)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.2 }}
                >
                  {link.isArrow ? (
                    <>
                      {t(link.nameKey)}
                      <link.icon className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <link.icon className="w-4 h-4" />
                      {t(link.nameKey)}
                      {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
                    </>
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                      layoutId="activeSection"
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
             {/* Theme Toggle */}
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" className="gradient-primary text-white px-6 btn-interactive">
                {t("nav.login")}
              </Button>
            </motion.div>
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 border-border hover:border-primary/50 transition-colors min-w-[100px]">
                  {currentLanguage === "ar" ? "العربية" : "English"}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`cursor-pointer hover:bg-secondary transition-colors ${currentLanguage === lang.code ? 'bg-secondary' : ''}`}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="lg:hidden py-4 border-t border-border bg-background"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex flex-col gap-1">
                {navLinksData.map((link, index) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <motion.button
                      key={link.nameKey}
                      onClick={() => scrollToSection(link.href)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive 
                          ? "text-primary bg-secondary" 
                          : "text-muted-foreground hover:text-primary hover:bg-secondary"
                      }`}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <link.icon className="w-4 h-4" />
                      {t(link.nameKey)}
                      {link.hasDropdown && <ChevronDown className={`w-3 h-3 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />}
                      {link.isArrow && <ChevronRight className={`w-3 h-3 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />}
                    </motion.button>
                  );
                })}
                <motion.div 
                  className="flex items-center gap-3 px-4 pt-4 border-t border-border mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  {/* Mobile Theme Toggle */}
                  <ThemeToggleCompact />
                  <Button size="sm" className="gradient-primary text-white flex-1">
                    {t("nav.login")}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        {currentLanguage === "ar" ? "AR" : "EN"}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-popover">
                      {languages.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`cursor-pointer ${currentLanguage === lang.code ? 'bg-secondary' : ''}`}
                        >
                          {lang.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;