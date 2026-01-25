import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowRight, Mail, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";

const NewsSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: newsletterRef, isVisible: newsletterVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useTranslation();

  const blogs = [
    {
      id: 1,
      title: t("news.blogs.1.title"),
      excerpt: t("news.blogs.1.excerpt"),
      date: t("news.blogs.1.date"),
      category: t("news.blogs.1.category"),
    },
    {
      id: 2,
      title: t("news.blogs.2.title"),
      excerpt: t("news.blogs.2.excerpt"),
      date: t("news.blogs.2.date"),
      category: t("news.blogs.2.category"),
    },
    {
      id: 3,
      title: t("news.blogs.3.title"),
      excerpt: t("news.blogs.3.excerpt"),
      date: t("news.blogs.3.date"),
      category: t("news.blogs.3.category"),
    },
  ];

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
            {t("news.title")}
          </h2>
          <p className="text-muted-foreground text-base">
            {t("news.subtitle")}
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
                    {t("news.readMore")} 
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
            {t("news.newsletter.title")}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("news.newsletter.description")}
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
              {t("news.newsletter.success")}
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
                  placeholder={t("news.newsletter.placeholder")}
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
                  {t("news.newsletter.subscribe")}
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