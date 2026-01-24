import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowRight, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import useScrollAnimation from "@/hooks/useScrollAnimation";

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
  const [isFocused, setIsFocused] = useState(false);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: newsletterRef, isVisible: newsletterVisible } = useScrollAnimation({ threshold: 0.2 });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section id="news" className="py-14 lg:py-20 bg-background overflow-hidden">
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
            Stay updated with our blog
          </h2>
          <p className="text-muted-foreground text-base">
            Explore tips, insights, and stories to help you on your English learning journey.
          </p>
        </motion.div>

        {/* Blog Posts */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 mb-20">
          {blogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              className="bg-card rounded-2xl overflow-hidden shadow-card border border-border group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={cardsVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8, 
                boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)",
                borderColor: "hsl(var(--primary) / 0.3)"
              }}
            >
              {/* Category Badge */}
              <div className="px-6 pt-6">
                <motion.span 
                  className="inline-block bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full"
                  whileHover={{ scale: 1.05 }}
                >
                  {blog.category}
                </motion.span>
              </div>
              
              <div className="p-6 pt-4">
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
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent group/btn"
                  >
                    Read more 
                    <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div 
          ref={newsletterRef}
          className="bg-gradient-to-br from-secondary via-secondary to-primary/5 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={newsletterVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <motion.div 
            className="absolute top-4 right-4 text-primary/10"
            animate={{ rotate: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-24 h-24" />
          </motion.div>

          <motion.div 
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Mail className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Subscribe to our newsletter
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get the latest English learning tips, exclusive offers, and updates 
            delivered directly to your inbox.
          </p>
          
          {isSubscribed ? (
            <motion.div 
              className="text-primary font-medium flex items-center justify-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2, type: "spring" }}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white"
              >
                ✓
              </motion.span>
              Thank you for subscribing! Check your email for confirmation.
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10"
            >
              <motion.div 
                className="flex-1"
                animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  required
                  className={`bg-background transition-all duration-200 ${
                    isFocused ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="gradient-primary text-white btn-interactive">
                  Subscribe
                </Button>
              </motion.div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;