import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
  const scrollToStart = () => {
    const element = document.querySelector("#start");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Choose the right plan for you!
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className="relative bg-card rounded-2xl shadow-lg overflow-hidden border border-border flex flex-col"
            >
              {/* Top accent line */}
              <div className={`h-1.5 bg-gradient-to-r ${plan.accentColor}`} />

              <div className="p-6 lg:p-8 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  {plan.isBestseller && (
                    <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                      Bestseller
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-4">{plan.duration}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl lg:text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={scrollToStart}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 py-6 mt-auto"
                >
                  Subscribe Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
