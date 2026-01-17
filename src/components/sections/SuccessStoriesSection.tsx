import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Ahmed",
    role: "Business Professional",
    image: null,
    rating: 5,
    text: "Pro English Academy transformed my career. After completing the 3in1 Program, I was promoted to a position that requires daily English communication. The teachers are amazing!",
  },
  {
    id: 2,
    name: "Mohamed Hassan",
    role: "Medical Student",
    image: null,
    rating: 5,
    text: "I needed to improve my English for my medical studies abroad. The VIP Course gave me the personalized attention I needed. Now I'm studying medicine in the UK!",
  },
  {
    id: 3,
    name: "Fatima Al-Sayed",
    role: "Marketing Manager",
    image: null,
    rating: 5,
    text: "The flexible schedule was perfect for my busy work life. I could attend classes in the evening and on weekends. My English improved dramatically in just 3 months.",
  },
  {
    id: 4,
    name: "Ahmed Mostafa",
    role: "Software Developer",
    image: null,
    rating: 5,
    text: "As a developer, I needed English for documentation and international team meetings. Pro English made learning fun and practical. Highly recommended!",
  },
];

const companyLogos = [
  "Company 1",
  "Company 2",
  "Company 3",
  "Company 4",
  "Company 5",
  "Company 6",
];

const SuccessStoriesSection = () => {
  return (
    <section id="success-stories" className="py-14 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Thousands of happy students
          </h2>
          <p className="text-muted-foreground text-base">
            Hear from our students who have achieved their English learning goals 
            and transformed their careers with Pro English Academy.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-8 shadow-card border border-border relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-primary text-primary"
                  />
                ))}
              </div>
              
              <p className="text-foreground mb-6 relative z-10">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Trusted by leading companies
          </h3>
          <p className="text-muted-foreground mb-8">
            Teams at these companies train their English with us
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {companyLogos.map((company, index) => (
              <div
                key={index}
                className="text-2xl font-bold text-muted-foreground/40 hover:text-primary transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
