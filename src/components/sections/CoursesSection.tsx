import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import course3in1 from "@/assets/course-3in1.png";
import course2in1 from "@/assets/course-2in1.png";
import courseTeens from "@/assets/course-teens.png";
import courseVip from "@/assets/course-vip.png";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";

interface CourseData {
  id: number;
  nameKey: string;
  descriptionKey: string;
  introKeys: string[];
  learnKeys: { titleKey: string; descriptionKey: string }[];
  impactKeys: string[];
}

const coursesData: CourseData[] = [
  {
    id: 1,
    nameKey: "courses.3in1.name",
    descriptionKey: "courses.3in1.description",
    introKeys: [
      "courses.3in1.intro.1",
      "courses.3in1.intro.2",
      "courses.3in1.intro.3",
      "courses.3in1.intro.4",
      "courses.3in1.intro.5",
    ],
    learnKeys: [
      { titleKey: "courses.3in1.learn.fluency.title", descriptionKey: "courses.3in1.learn.fluency.description" },
      { titleKey: "courses.3in1.learn.speaking.title", descriptionKey: "courses.3in1.learn.speaking.description" },
      { titleKey: "courses.3in1.learn.accent.title", descriptionKey: "courses.3in1.learn.accent.description" },
    ],
    impactKeys: ["courses.3in1.impact.1", "courses.3in1.impact.2"],
  },
  {
    id: 2,
    nameKey: "courses.2in1.name",
    descriptionKey: "courses.2in1.description",
    introKeys: ["courses.2in1.intro.1"],
    learnKeys: [
      { titleKey: "courses.2in1.learn.speaking.title", descriptionKey: "courses.2in1.learn.speaking.description" },
      { titleKey: "courses.2in1.learn.accent.title", descriptionKey: "courses.2in1.learn.accent.description" },
    ],
    impactKeys: [],
  },
  {
    id: 3,
    nameKey: "courses.teens.name",
    descriptionKey: "courses.teens.description",
    introKeys: [
      "courses.teens.intro.1",
      "courses.teens.intro.2",
      "courses.teens.intro.3",
      "courses.teens.intro.4",
    ],
    learnKeys: [
      { titleKey: "courses.teens.learn.fluency.title", descriptionKey: "courses.teens.learn.fluency.description" },
      { titleKey: "courses.teens.learn.speaking.title", descriptionKey: "courses.teens.learn.speaking.description" },
      { titleKey: "courses.teens.learn.accent.title", descriptionKey: "courses.teens.learn.accent.description" },
      { titleKey: "courses.teens.learn.platform.title", descriptionKey: "courses.teens.learn.platform.description" },
    ],
    impactKeys: ["courses.teens.impact.1"],
  },
  {
    id: 4,
    nameKey: "courses.vip.name",
    descriptionKey: "courses.vip.description",
    introKeys: ["courses.vip.intro.1", "courses.vip.intro.2"],
    learnKeys: [
      { titleKey: "courses.vip.learn.individual.title", descriptionKey: "courses.vip.learn.individual.description" },
      { titleKey: "courses.vip.learn.conversation.title", descriptionKey: "courses.vip.learn.conversation.description" },
      { titleKey: "courses.vip.learn.pronunciation.title", descriptionKey: "courses.vip.learn.pronunciation.description" },
    ],
    impactKeys: ["courses.vip.impact.1"],
  },
];

const CourseCard = ({ course, index }: { course: CourseData; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const isReversed = index % 2 === 1;
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const scrollToStart = () => {
    const element = document.querySelector("#start");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getCourseImage = (courseId: number) => {
    if (courseId === 1) return course3in1;
    if (courseId === 2) return course2in1;
    if (courseId === 3) return courseTeens;
    if (courseId === 4) return courseVip;
    return null;
  };

  const courseImage = getCourseImage(course.id);

  return (
    <div
      ref={ref}
      className={`animate-fade-up ${isVisible ? "visible" : ""}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-12 items-start`}
      >
        {/* Image */}
        <motion.div 
          className="w-full lg:w-1/2"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {courseImage ? (
            <img
              src={courseImage}
              alt={t(course.nameKey)}
              className="w-full h-auto rounded-2xl shadow-lg object-cover transition-shadow duration-300 hover:shadow-xl"
            />
          ) : (
            <div className="aspect-video bg-gradient-to-br from-secondary to-muted rounded-2xl flex items-center justify-center shadow-lg">
              <div className="text-center text-muted-foreground p-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-card flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium">Course Image</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Content */}
        <div className="w-full lg:w-1/2 space-y-5">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{t(course.nameKey)}</h3>
          <p className="text-muted-foreground leading-relaxed">{t(course.descriptionKey)}</p>

          <div className="flex flex-wrap gap-4 pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={scrollToStart} className="gradient-primary text-white px-8 btn-interactive">
                {t("courses.subscribeNow")}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 gap-2 transition-all duration-200"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {t("courses.moreInfo")}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-5 mt-4">
                  <h4 className="text-xl font-bold text-foreground">{t(course.nameKey)}</h4>

                  {/* Intro paragraphs */}
                  <div className="space-y-3">
                    {course.introKeys.map((key, idx) => (
                      <p key={idx} className="text-muted-foreground leading-relaxed text-sm">
                        {t(key)}
                      </p>
                    ))}
                  </div>

                  {/* What you'll learn */}
                  <div className="pt-2">
                    <h5 className="text-base font-bold text-foreground mb-3">{t("courses.whatYouLearn")}</h5>
                    <div className="space-y-4">
                      {course.learnKeys.map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          className="flex gap-3"
                          initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <h6 className="font-semibold text-foreground mb-1 text-sm">{t(item.titleKey)}</h6>
                            <p className="text-muted-foreground leading-relaxed text-sm">{t(item.descriptionKey)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* The Impact */}
                  {course.impactKeys.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-base font-bold text-foreground mb-3">{t("courses.theImpact")}</h5>
                      <div className="space-y-2">
                        {course.impactKeys.map((key, idx) => (
                          <p key={idx} className="text-muted-foreground leading-relaxed text-sm">
                            {t(key)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const CoursesSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { t } = useTranslation();

  return (
    <section id="courses" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 animate-fade-up ${headerVisible ? "visible" : ""}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t("courses.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("courses.subtitle")}
          </p>
        </div>

        {/* Course Cards */}
        <div className="space-y-16 max-w-8xl mx-auto">
          {coursesData.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;