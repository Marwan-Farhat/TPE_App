import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CoursesSection from "@/components/sections/CoursesSection";
import PricingSection from "@/components/sections/PricingSection";
import CoachingSection from "@/components/sections/CoachingSection";
import FAQsSection from "@/components/sections/FAQsSection";
import SuccessStoriesSection from "@/components/sections/SuccessStoriesSection";
import NewsSection from "@/components/sections/NewsSection";
import StartSection from "@/components/sections/StartSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <CoursesSection />
        <PricingSection />
        <CoachingSection />
        <FAQsSection />
        <SuccessStoriesSection />
        <NewsSection />
        <StartSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
