import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import useScrollAnimation from "@/hooks/useScrollAnimation";

interface PricingPlan {
  name: string;
  duration: string;
  price: string;
  features: string[];
  isBestseller?: boolean;
  accentColor: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "3 Levels",
    duration: "3 months of daily English practice and speaking.",
    price: "3750 EGP",
    accentColor: "from-purple-500 to-blue-500",
    features: [
      "24 interactive sessions with learners at your level.",
      "24 private sessions with the trainer.",
      "12 accent improvement training sessions",
      "3 free orientation sessions.",
      "Continuous support and customer service available 24/7.",
    ],
  },
  {
    name: "8 Levels",
    duration: "12 months of daily English practice and speaking.",
    price: "8500 EGP",
    isBestseller: true,
    accentColor: "from-orange-500 to-yellow-500",
    features: [
      "64 interactive sessions with learners at your level.",
      "64 private sessions with the trainer.",
      "32 accent improvement training sessions",
      "12 free orientation sessions.",
      "Continuous support and customer service available 24/7.",
      "Guarantee to repeat any level for free for a year if you commit to attendance.",
    ],
  },
  {
    name: "6 Levels",
    duration: "6 months of daily English practice and speaking.",
    price: "6900 EGP",
    accentColor: "from-purple-500 to-blue-500",
    features: [
      "48 interactive sessions with learners at your level.",
      "48 private sessions with the trainer.",
      "24 accent improvement training sessions",
      "6 free orientation sessions.",
      "Continuous support and customer service available 24/7.",
      "Guarantee to repeat any level for free for a year if you commit to attendance.",
    ],
  },
];

const PricingSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 });

  const scrollToStart = () => {
    const element = document.querySelector("#start");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-14 lg:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          ref={headerRef}
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={headerVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Choose the right plan for you!
          </h2>
        </motion.div>

        {/* Pricing Cards */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative bg-card rounded-2xl shadow-lg overflow-hidden border flex flex-col ${
                plan.isBestseller ? "border-orange-300" : "border-border"
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={cardsVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.15,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ 
                y: -8,
                boxShadow: plan.isBestseller 
                  ? "0 25px 50px -12px rgba(251, 146, 60, 0.25)"
                  : "0 25px 50px -12px hsl(var(--primary) / 0.2)"
              }}
            >
              {/* Top accent line */}
              <motion.div 
                className={`h-1.5 bg-gradient-to-r ${plan.accentColor}`}
                initial={{ scaleX: 0 }}
                animate={cardsVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                style={{ transformOrigin: "left" }}
              />

              {/* Bestseller badge glow effect */}
              {plan.isBestseller && (
                <motion.div 
                  className="absolute -top-4 -right-4 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <div className="p-6 lg:p-8 flex flex-col flex-1 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  {plan.isBestseller && (
                    <motion.span 
                      className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                      initial={{ scale: 0 }}
                      animate={cardsVisible ? { scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Bestseller
                    </motion.span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-4">{plan.duration}</p>

                {/* Price */}
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={cardsVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
                >
                  <span className="text-3xl lg:text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                </motion.div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <motion.li 
                      key={idx} 
                      className="flex items-start gap-3 group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={cardsVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: index * 0.1 + idx * 0.05 + 0.3 }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"
                        whileHover={{ scale: 1.2, backgroundColor: "hsl(var(--primary))" }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-3 h-3 text-primary group-hover:text-white transition-colors" />
                      </motion.div>
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={scrollToStart}
                    className={`w-full py-6 mt-auto btn-interactive ${
                      plan.isBestseller 
                        ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:opacity-90"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
                    }`}
                  >
                    Subscribe Now
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;