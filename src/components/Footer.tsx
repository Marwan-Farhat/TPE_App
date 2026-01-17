import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import logoFooter from "@/assets/logo-footer.png";

// TikTok icon component since it's not in lucide-react
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const footerLinks = {
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Courses", href: "#courses" },
    { name: "Success Stories", href: "#success-stories" },
    { name: "Blog", href: "#news" },
  ],
  support: [
    { name: "FAQs", href: "#faqs" },
    { name: "Contact Us", href: "#start" },
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/share/1DFdM5d3cX/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/theproenglish?igsh=MXR5dHk1aXkyNDc4dQ==", label: "Instagram" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/the-pro-english/posts/?feedView=all", label: "LinkedIn" },
  { icon: Youtube, href: "https://www.youtube.com/@TheProEnglish", label: "YouTube" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@theproenglish?_r=1&_t=ZS-939bW9EFiyI", label: "TikTok" },
];

const Footer = () => {
  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#home" className="inline-block mb-6">
              <img 
                src={logoFooter} 
                alt="The Pro English" 
                className="h-16 w-auto brightness-0 invert"
              />
            </a>
            <p className="text-background/70 mb-6 max-w-sm">
              Pro English Academy is your trusted partner in mastering the English language. 
              Join thousands of successful learners and achieve your language goals.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-background/70">
                <Mail className="w-5 h-5 text-primary" />
                <span>Mail@theproenglish.net</span>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <Phone className="w-5 h-5 text-primary" />
                <span>+20 2 48813729</span>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Cairo, Egypt</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-background mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-background mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-background/10 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-background/50 text-sm">
              © 2024 Pro English Academy. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
