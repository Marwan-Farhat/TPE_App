import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";

const FAQsSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.05 });
  const { t } = useTranslation();

  const faqKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  return (
    <section id="faqs" className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-10 animate-fade-up ${headerVisible ? "visible" : ""}`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t("faqs.title")}
          </h2>
          <p className="text-muted-foreground text-base">
            {t("faqs.subtitle")}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div 
          ref={contentRef}
          className={`max-w-4xl mx-auto animate-fade-up ${contentVisible ? "visible" : ""}`}
          style={{ transitionDelay: "150ms" }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqKeys.map((key, index) => (
              <AccordionItem
                key={key}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-soft data-[state=open]:border-primary/20 transition-all duration-300 hover:border-primary/30"
              >
                <AccordionTrigger className="text-start text-foreground font-medium py-4 hover:no-underline hover:text-primary text-sm md:text-base transition-colors duration-200">
                  {t(`faqs.questions.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 whitespace-pre-line text-sm leading-relaxed">
                  {t(`faqs.questions.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQsSection;