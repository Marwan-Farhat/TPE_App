import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowRight, Mail } from "lucide-react";

const blogs = [
  {
    id: 1,
    title: "10 Tips to Improve Your English Speaking Skills",
    excerpt:
      "Discover practical strategies to boost your confidence and fluency in English conversations...",
    date: "January 10, 2024",
    category: "Learning Tips",
    image: null,
  },
  {
    id: 2,
    title: "Why Immersive Learning Works Best for Languages",
    excerpt:
      "Research shows that immersive learning environments accelerate language acquisition...",
    date: "January 5, 2024",
    category: "Research",
    image: null,
  },
  {
    id: 3,
    title: "Success Story: From Beginner to Business English in 6 Months",
    excerpt:
      "Read how one of our students transformed their career with intensive English training...",
    date: "December 28, 2023",
    category: "Success Stories",
    image: null,
  },
];

const NewsSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section id="news" className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Stay updated with our blog
          </h2>
          <p className="text-muted-foreground text-base">
            Explore tips, insights, and stories to help you on your English learning journey.
          </p>
        </div>

        {/* Blog Posts */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-card rounded-2xl overflow-hidden shadow-card border border-border group hover:shadow-soft transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  {blog.date}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent"
                >
                  Read more <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-secondary rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Subscribe to our newsletter
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get the latest English learning tips, exclusive offers, and updates 
            delivered directly to your inbox.
          </p>
          
          {isSubscribed ? (
            <div className="text-primary font-medium">
              ✓ Thank you for subscribing! Check your email for confirmation.
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background"
              />
              <Button type="submit" className="gradient-primary text-white">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
