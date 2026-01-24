import { Compass, MessageCircle, CalendarDays, Target, Shield, Layers } from "lucide-react";
import { motion } from "framer-motion";
import useScrollAnimation from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Compass,
    title: "Free Orientation Session",
    description: "An introductory session at the beginning to map out your language journey and understand how we'll proceed the right way.",
  },
  {
    icon: MessageCircle,
    title: "Private Conversation Sessions",
    description: "Customized sessions so you can speak a lot and get special focus from the trainer.",
  },
  {
    icon: CalendarDays,
    title: "Daily Practice",
    description: "You'll speak English 5 times a week and practice the language in an interactive and fun way.",
  },
  {
    icon: Target,
    title: "Personal Assessment",
    description: "With every session or task, you get personal evaluation or feedback to continuously improve.",
  },
  {
    icon: Shield,
    title: "The Pro English Guarantee",
    description: "Guarantee to repeat any level for free for a year if you commit to attendance and get the guarantee.",
  },
  {
    icon: Layers,
    title: "Lifetime Platform Access",
    description: "Once you join the course, you get lifetime access to the platform with all content files and exercises.",
  },
];

const FeaturesSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div 
          ref={sectionRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-2xl p-8 border border-border group cursor-default"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ 
                y: -8, 
                boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)",
                borderColor: "hsl(var(--primary) / 0.3)"
              }}
            >
              <motion.div 
                className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
              </motion.div>
              <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
