import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import aboutLaptop from "@/assets/about-laptop.png";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const AboutSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const benefits = [
    t("about.benefits.1"),
    t("about.benefits.2"),
    t("about.benefits.3"),
    t("about.benefits.4"),
    t("about.benefits.5"),
  ];

  const scrollToCourses = () => {
    const element = document.querySelector("#courses");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-20 lg:py-28 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div 
          ref={sectionRef}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left Content */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight"
              variants={itemVariants}
            >
              {t("about.title")}
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground text-lg leading-relaxed"
              variants={itemVariants}
            >
              {t("about.description")}
            </motion.p>

            <motion.div className="space-y-4 pt-2" variants={itemVariants}>
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-3 group"
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"
                    whileHover={{ scale: 1.2, backgroundColor: "hsl(var(--primary))" }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                  </motion.div>
                  <span className="text-foreground group-hover:text-primary transition-colors duration-200">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={scrollToCourses}
                  size="lg"
                  className="gradient-primary text-white mt-4 gap-2 btn-interactive animate-subtle-pulse"
                >
                  {t("about.cta")}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - Laptop Image */}
          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={aboutLaptop} 
                alt="Learning platform on laptop" 
                className="w-full h-auto rounded-2xl shadow-2xl object-cover min-h-[300px] lg:min-h-[380px]"
              />
              {/* Decorative elements with animations */}
              <motion.div 
                className={`absolute -top-4 ${isRTL ? '-left-4' : '-right-4'} w-20 h-20 bg-primary/10 rounded-full blur-sm`}
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className={`absolute -bottom-4 ${isRTL ? '-right-4' : '-left-4'} w-16 h-16 bg-emerald-400/20 rounded-full blur-sm`}
                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;