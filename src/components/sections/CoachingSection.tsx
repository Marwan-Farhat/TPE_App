import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import coachingIllustration from "@/assets/coaching-illustration.png";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";

const CoachingSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const scrollToStart = () => {
    const element = document.querySelector("#start");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-r from-primary via-primary to-accent relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-64 h-64 bg-white/5 rounded-full blur-3xl`}
        animate={{ 
          x: [0, 30, 0], 
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-96 h-96 bg-white/5 rounded-full blur-3xl`}
        animate={{ 
          x: [0, -40, 0], 
          y: [0, 30, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={sectionRef}
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
        >
          {/* Content */}
          <motion.div 
            className="w-full lg:w-1/2 text-white"
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t("coaching.title")}
            </motion.h2>
            <motion.p 
              className="text-white/90 text-lg leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {t("coaching.description")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={scrollToStart}
                variant="outline"
                className="border-white text-primary bg-white hover:bg-white/90 hover:text-primary px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t("coaching.cta")}
              </Button>
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 lg:p-8"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src={coachingIllustration}
                alt="Coaching network illustration"
                className="w-full h-auto"
                initial={{ scale: 0.95 }}
                animate={isVisible ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CoachingSection;