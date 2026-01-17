import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import aboutLaptop from "@/assets/about-laptop.png";

const benefits = [
  "Strong interactive curriculum focused on conversation and listening.",
  "Comprehensive platform for all content, schedules, and attendance.",
  "Professional trainers and friendly, motivating environment.",
  "Continuous support and customer service available 24/7.",
  "Individual and group sessions.",
];

const AboutSection = () => {
  const scrollToCourses = () => {
    const element = document.querySelector("#courses");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight">
              Shorten your path and learn English the right way!
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              We provide you with an interactive, direct, and enjoyable experience through constantly 
              evolving content that helps you speak English quickly and easily.
            </p>

            <div className="space-y-4 pt-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={scrollToCourses}
              size="lg"
              className="gradient-primary text-white mt-4 gap-2"
            >
              Choose the right course for your dreams
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right Content - Laptop Image */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <img 
                src={aboutLaptop} 
                alt="Learning platform on laptop" 
                className="w-full h-auto rounded-2xl shadow-2xl object-cover min-h-[300px] lg:min-h-[380px]"
              />
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-sm" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-400/20 rounded-full blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
