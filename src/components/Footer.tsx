import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
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

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.a 
              href="#home" 
              className="inline-block mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src={logoFooter} 
                alt="The Pro English" 
                className="h-16 w-auto brightness-0 invert"
              />
            </motion.a>
            <p className="text-background/70 mb-6 max-w-sm">
              Pro English Academy is your trusted partner in mastering the English language. 
              Join thousands of successful learners and achieve your language goals.
            </p>
            <div className="space-y-3">
              {/* Email - clickable */}
              <motion.a 
                href="mailto:Mail@theproenglish.net"
                className="flex items-center gap-3 text-background/70 group cursor-pointer"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="group-hover:text-background transition-colors hover:underline">Mail@theproenglish.net</span>
              </motion.a>

              {/* Phone - clickable */}
              <motion.a 
                href="tel:+20248813729"
                className="flex items-center gap-3 text-background/70 group cursor-pointer"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Phone className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="group-hover:text-background transition-colors hover:underline">+20 2 48813729</span>
              </motion.a>

              {/* Location - not clickable */}
              <motion.div 
                className="flex items-center gap-3 text-background/70 group cursor-default"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="group-hover:text-background transition-colors">Cairo, Egypt</span>
              </motion.div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-background mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <motion.button
                    onClick={() => scrollToSection(link.href)}
                    className="text-background/70 hover:text-primary transition-colors relative group"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.name}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-background mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <motion.button
                    onClick={() => scrollToSection(link.href)}
                    className="text-background/70 hover:text-primary transition-colors relative group"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.name}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <motion.div 
          className="border-t border-background/10 mt-8 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  // @ts-ignore - framer motion delay
                  custom={index}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
            <p className="text-background/50 text-sm">
              © 2024 Pro English Academy. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
