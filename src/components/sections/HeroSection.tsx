import { Button } from "@/components/ui/button";
import { Play, Users, Award, TrendingUp, ArrowRight, Star } from "lucide-react";

const HeroSection = () => {
  const scrollToStart = () => {
    const element = document.querySelector("#start");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen pt-20 lg:pt-24 bg-background relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute top-32 left-8 w-24 h-24 bg-primary/20 rounded-full blur-sm" />
      <div className="absolute top-64 left-1/3 w-16 h-16 bg-emerald-400/30 rounded-full" />
      <div className="absolute bottom-32 right-20 w-20 h-20 bg-primary/10 rounded-full" />
      <div className="absolute bottom-48 right-1/4 w-8 h-8 bg-emerald-400/40 rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)] py-12">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary border border-primary/20 px-4 py-2 rounded-full text-sm text-primary">
              <Star className="w-4 h-4 fill-primary" />
              Learn English with certified experts
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight text-foreground">
              Speak English from day one and achieve your dream the right way!
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Get rid of fear and shyness and start communicating with confidence and 
              achieve your dream in work, travel, or study through interactive methods, 
              conversation sessions, and daily practice in different ways from day one.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                onClick={scrollToStart}
                size="lg"
                className="gradient-primary text-white font-medium px-6 gap-2"
              >
                Take the first step towards your dream
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-secondary gap-2 font-medium"
              >
                <Play className="w-4 h-4" />
                Watch Video
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4 pt-8">
              <div className="flex flex-col items-center px-8 py-4 bg-card border border-border rounded-xl shadow-sm min-w-[140px]">
                <Users className="w-6 h-6 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">15,000+</div>
                <div className="text-sm text-muted-foreground">Trainee</div>
              </div>
              <div className="flex flex-col items-center px-8 py-4 bg-card border border-border rounded-xl shadow-sm min-w-[140px]">
                <Award className="w-6 h-6 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Trainer</div>
              </div>
              <div className="flex flex-col items-center px-8 py-4 bg-card border border-border rounded-xl shadow-sm min-w-[140px]">
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">5+</div>
                <div className="text-sm text-muted-foreground">Program</div>
              </div>
            </div>
          </div>

          {/* Right Content - Video Thumbnail */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative max-w-lg mx-auto lg:max-w-none">
              {/* Video container with styled frame like reference */}
              <div className="relative bg-card rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border border-border/50 aspect-video">
                {/* Placeholder for video thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-3 lg:mb-4 rounded-full bg-card flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-primary" />
                    </div>
                    <p className="font-medium text-sm md:text-base">Professional Teacher</p>
                  </div>
                </div>
                
                {/* Play button overlay */}
                <button className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-foreground/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-background fill-background ml-0.5 lg:ml-1" />
                  </div>
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-3 -right-3 lg:-bottom-4 lg:-right-4 w-16 h-16 lg:w-24 lg:h-24 bg-emerald-400/20 rounded-full blur-sm" />
              <div className="absolute -top-3 -left-3 lg:-top-4 lg:-left-4 w-12 h-12 lg:w-16 lg:h-16 bg-primary/20 rounded-full blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
