import { Compass, MessageCircle, CalendarDays, Target, Shield, Layers } from "lucide-react";

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
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-soft transition-shadow"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
