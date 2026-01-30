import { Button } from "@/components/ui/button";
import { Users, Award, TrendingUp, ArrowRight, Star } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const scrollToStart = () => {
    const element = document.querySelector("#start");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const statsVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const stats = [
    { icon: Users, value: "15,000+", labelKey: "hero.stats.trainee" },
    { icon: Award, value: "50+", labelKey: "hero.stats.trainer" },
    { icon: TrendingUp, value: "5+", labelKey: "hero.stats.program" },
  ];

  return (
    <section
      id="home"
      className="min-h-screen pt-20 lg:pt-24 bg-background relative overflow-hidden"
    >
      {/* Decorative circles with floating animation */}
      <motion.div 
        className={`absolute top-32 ${isRTL ? 'right-8' : 'left-8'} w-24 h-24 bg-primary/20 rounded-full blur-sm`}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className={`absolute top-64 ${isRTL ? 'right-1/3' : 'left-1/3'} w-16 h-16 bg-emerald-400/30 rounded-full`}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className={`absolute bottom-32 ${isRTL ? 'left-20' : 'right-20'} w-20 h-20 bg-primary/10 rounded-full`}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className={`absolute bottom-48 ${isRTL ? 'left-1/4' : 'right-1/4'} w-8 h-8 bg-emerald-400/40 rounded-full`}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)] py-12">
          {/* Left Content */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-secondary border border-primary/20 px-4 py-2 rounded-full text-sm text-primary"
              variants={itemVariants}
            >
              <Star className="w-4 h-4 fill-primary" />
              {t("hero.badge")}
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight text-foreground"
              variants={itemVariants}
            >
              {t("hero.title")}
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
              variants={itemVariants}
            >
              {t("hero.description")}
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 pt-2"
              variants={itemVariants}
            >
              <Button
                onClick={scrollToStart}
                size="lg"
                className="gradient-primary text-white font-medium px-6 gap-2 btn-interactive animate-subtle-pulse"
              >
                {t("hero.cta")}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>

            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              className="flex flex-wrap gap-4 pt-8"
              variants={itemVariants}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.labelKey}
                  className="flex flex-col items-center px-8 py-4 bg-card border border-border rounded-xl shadow-sm min-w-[140px] card-interactive"
                  variants={statsVariants}
                  whileHover={{ y: -4, boxShadow: "0 12px 40px -8px rgba(0,0,0,0.12)" }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="w-6 h-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Logo with powerful context */}
          <motion.div 
            className="relative mt-8 lg:mt-0 flex items-center justify-center"
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <div className="relative max-w-lg mx-auto lg:max-w-none w-full">
              {/* Animated gradient background circles */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-400/20 rounded-3xl blur-3xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Logo container with glass effect */}
              <motion.div 
                className="relative bg-card/50 backdrop-blur-xl rounded-3xl lg:rounded-3xl overflow-hidden shadow-2xl border border-border/50 p-0 lg:p-2 flex items-center justify-center"
                whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated background pattern */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-400/10"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                {/* Logo image */}
                <motion.img
                  src={logo}
                  alt="Pro English Logo"
                  className="relative w-56 h-56 lg:w-80 lg:h-80 object-contain drop-shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              {/* Decorative corner elements */}
              <motion.div 
                className={`absolute -bottom-4 ${isRTL ? '-left-4 lg:-left-6' : '-right-4 lg:-right-6'} w-20 h-20 lg:w-32 lg:h-32 bg-emerald-400/20 rounded-full blur-lg`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className={`absolute -top-4 ${isRTL ? '-right-4 lg:-right-6' : '-left-4 lg:-left-6'} w-16 h-16 lg:w-24 lg:h-24 bg-primary/20 rounded-full blur-lg`}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;