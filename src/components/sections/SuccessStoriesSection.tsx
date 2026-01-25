import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";

const companyLogos = [
  "Company 1",
  "Company 2",
  "Company 3",
  "Company 4",
  "Company 5",
  "Company 6",
];

const SuccessStoriesSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: logosRef, isVisible: logosVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useTranslation();

  const testimonialKeys = ["1", "2", "3", "4"];

  return (
    <section id="success-stories" className="py-14 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 animate-fade-up ${headerVisible ? "visible" : ""}`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t("successStories.title")}
          </h2>
          <p className="text-muted-foreground text-base">
            {t("successStories.subtitle")}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          {testimonialKeys.map((key, index) => (
            <motion.div
              key={key}
              className={`bg-card rounded-2xl p-8 shadow-card border border-border relative card-interactive animate-fade-up ${cardsVisible ? "visible" : ""}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Quote className="absolute top-6 end-6 w-10 h-10 text-primary/20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={cardsVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
                  >
                    <Star className="w-5 h-5 fill-primary text-primary" />
                  </motion.div>
                ))}
              </div>
              
              <p className="text-foreground mb-6 relative z-10">
                "{t(`successStories.testimonials.${key}.text`)}"
              </p>
              
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-lg font-semibold text-primary">
                    {t(`successStories.testimonials.${key}.name`).charAt(0)}
                  </span>
                </motion.div>
                <div>
                  <div className="font-semibold text-foreground">
                    {t(`successStories.testimonials.${key}.name`)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t(`successStories.testimonials.${key}.role`)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <div 
          ref={logosRef}
          className={`text-center animate-fade-up ${logosVisible ? "visible" : ""}`}
        >
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {t("successStories.trustedBy")}
          </h3>
          <p className="text-muted-foreground mb-8">
            {t("successStories.companiesSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {companyLogos.map((company, index) => (
              <motion.div
                key={index}
                className="text-2xl font-bold text-muted-foreground/40 hover:text-primary transition-colors cursor-default"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {company}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;