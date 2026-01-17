import { Button } from "@/components/ui/button";
import coachingIllustration from "@/assets/coaching-illustration.png";

const CoachingSection = () => {
  const scrollToStart = () => {
    const element = document.querySelector("#start");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-r from-primary via-primary to-accent">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content */}
          <div className="w-full lg:w-1/2 text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Determine your level and evaluate your skills the right way!
            </h2>
            <p className="text-white/90 text-lg leading-relaxed mb-8">
              Start your journey with a Coaching Session individual consultation, 30 minutes with the trainer who speaks and chats with you in English to evaluate your skills and give you a detailed evaluation, plus an MCQ test to determine your level accurately and guide you to the next step.
            </p>
            <Button
              onClick={scrollToStart}
              variant="outline"
              className="border-white text-primary bg-white hover:bg-white/90 hover:text-primary px-8 py-6 text-base font-semibold"
            >
              Book Coaching Session
            </Button>
          </div>

          {/* Illustration */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 lg:p-8">
              <img
                src={coachingIllustration}
                alt="Coaching network illustration"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoachingSection;
