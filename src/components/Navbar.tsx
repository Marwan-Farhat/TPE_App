import { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight, Sparkles, Info, LayoutGrid, HelpCircle, Star, Newspaper } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", href: "#home", icon: Sparkles },
  { name: "About", href: "#about", icon: Info },
  { name: "Courses", href: "#courses", icon: LayoutGrid },
  { name: "FAQs", href: "#faqs", icon: HelpCircle },
  { name: "Success Stories", href: "#success-stories", icon: Star },
  { name: "News", href: "#news", icon: Newspaper, hasDropdown: true },
  { name: "Start", href: "#start", icon: ChevronRight, isArrow: true },
];

const languages = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img src={logo} alt="The Pro English" className="h-12 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                {link.isArrow ? (
                  <>
                    {link.name}
                    <link.icon className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <link.icon className="w-4 h-4" />
                    {link.name}
                    {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button size="sm" className="gradient-primary text-white px-6">
              Login
            </Button>
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 border-border">
                  {currentLang === "en" ? "English" : "العربية"}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className="cursor-pointer"
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-background">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="w-3 h-3 ml-auto" />}
                  {link.isArrow && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              ))}
              <div className="flex items-center gap-3 px-4 pt-4 border-t border-border mt-2">
                <Button size="sm" className="gradient-primary text-white flex-1">
                  Login
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      {currentLang === "en" ? "English" : "العربية"}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setCurrentLang(lang.code)}
                        className="cursor-pointer"
                      >
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
