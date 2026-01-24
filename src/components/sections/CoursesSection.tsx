import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import course3in1 from "@/assets/course-3in1.png";
import course2in1 from "@/assets/course-2in1.png";
import courseTeens from "@/assets/course-teens.png";
import courseVip from "@/assets/course-vip.png";
import useScrollAnimation from "@/hooks/useScrollAnimation";

interface LearnItem {
  title: string;
  description: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  introText: string[];
  whatYouLearn: LearnItem[];
  impact: string[];
  image?: string;
}

const courses: Course[] = [
  {
    id: 1,
    name: "3in1 Program",
    description: "Speak English from zero to confidence and fluency and develop your skills the right way.",
    introText: [
      "If every time you try to learn English you find academic methods like school and this makes you confused between many sources.",
      "In every situation you face, you feel shy and don't know how to respond to a word in English or start a conversation, and this causes you anxiety and tension from facing people and delays you from your dream and future.",
      "Imagine learning English through interactive methods and enjoyable practice all the time with games and different activities.",
      "After seeing many places offering English courses without real practice, we decided to create the right method that helped thousands of people learn English and make a real change in their lives.",
      "Through 3in1, an interactive program that helps you get rid of fear and shyness from communication and speak with confidence without any barriers and achieve your dream in work, travel, or study through interactive methods, conversation sessions, and daily practice in different ways.",
    ],
    whatYouLearn: [
      {
        title: "Fluency Sessions",
        description: "We help you break the fear barrier and speak with people at your level and from different cultures around the world, through 8 sessions weekly, 2 hours per session, where you get words, grammar, conversation, pronunciation.",
      },
      {
        title: "Speaking Sessions",
        description: "We help you reach confidence through private conversation sessions, where you get special focus and evaluation from the trainer and speak about topics you learned in the fluency session and about your normal day, through 8 sessions monthly, 30 minutes per session.",
      },
      {
        title: "Accent Task Training",
        description: "Speak English like foreigners and open better opportunities for yourself through 4 monthly tasks (tasks) aimed at improving your accent and speaking the right way, you listen to a simple video explaining a specific sound and record your pronunciation and send it to the trainer to evaluate you and give you comprehensive feedback.",
      },
    ],
    impact: [
      "With every session or task you get detailed evaluation or feedback to continuously develop yourself.",
      "With The Pro English guarantee that gives you a guarantee through which you can repeat any level for free for a year if you book 8 levels and commit to attendance.",
    ],
  },
  {
    id: 2,
    name: "2in1 Course",
    description: "Focus on speaking and listening skills with intensive practice sessions and real-world conversations.",
    introText: [
      "If your time is busy and you want to practice the language in a simple and fun way that leads to progress, then the 2in1 course is suitable for you, where you get:",
    ],
    whatYouLearn: [
      {
        title: "Speaking Sessions",
        description: "Sessions where you practice the language privately and speak about common topics and situations from your normal day with special focus and evaluation from the trainer, through 12 sessions monthly, 60 minutes per session.",
      },
      {
        title: "Accent Task Training",
        description: "Speak English like foreigners and open better opportunities for yourself through 4 monthly tasks (tasks) aimed at improving your accent and speaking the right way, you listen to a simple video explaining a specific sound and record your pronunciation and send it to the trainer to evaluate you and give you comprehensive feedback.",
      },
    ],
    impact: [],
  },
  {
    id: 3,
    name: "Teens Course",
    description: "Develop your skills and speak English with confidence, suitable for teenagers aged 13-17.",
    introText: [
      "If you want to build your children's future right and help them learn English the right way away from academic methods that depend on memorization and rote learning.",
      "Your goal is for them to speak English with confidence and know how to study in English without problems and come out ready for the job market.",
      "Then the Teens program is suitable for them!",
      "It will help them break the fear barrier and speak English with confidence through interactive methods that depend on fun games and activities, daily practice in different ways and follow-up through the platform.",
    ],
    whatYouLearn: [
      {
        title: "Fluency Sessions",
        description: "We help them learn English through interactive sessions with trainees at their level, where they get words, grammar, conversation, pronunciation, through 8 sessions weekly, 2 hours per session.",
      },
      {
        title: "Speaking Sessions",
        description: "They gain more confidence in themselves through private conversation sessions, where they get special focus and evaluation from the trainer, they speak about topics they studied in fluency sessions and common topics in their day, through 8 sessions monthly, 30 minutes per session.",
      },
      {
        title: "Accent Task Training",
        description: "Speak English like foreigners and open better opportunities for yourself through 4 monthly tasks (tasks) aimed at improving your accent and speaking the right way, you listen to a simple video explaining a specific sound and record your pronunciation and send it to the trainer to evaluate you and give you comprehensive feedback.",
      },
      {
        title: "All content and sessions in one place",
        description: "Through The Pro English platform you can download all content and files, and you can follow session schedules, and your child's absence and attendance days so you can track them through the website.",
      },
    ],
    impact: [
      "With The Pro English guarantee that gives you a guarantee through which you can repeat any level for free for a year if you book 8 levels and commit to attendance.",
    ],
  },
  {
    id: 4,
    name: "The Pro English VIP Course",
    description: "Reach your goal faster and develop your level with a customized plan through 1:1 individual sessions.",
    introText: [
      "If you need to learn English quickly and are looking for a course that provides you with a customized plan and focuses on your goal whether it's fluency, pronunciation, interviews, work, or travel.",
      "The course is designed specifically based on your goals and you can complete the level within a month or request intensification for two weeks according to your needs, with complete flexibility in time and content.",
    ],
    whatYouLearn: [
      {
        title: "Individual 1:1 Sessions",
        description: "2 sessions weekly, including speech and fluency training through diverse topics, grammar in context, new vocabulary and different situations from your daily life.",
      },
      {
        title: "Conversation and Practical Application",
        description: "In each session, dedicated time for speaking and interactive conversation with pronunciation training and error correction through the trainer.",
      },
      {
        title: "Weekly Pronunciation Training",
        description: "Our goal is for you to speak English correctly, through 4 monthly tasks, with each task you listen to a simple video explaining a specific sound, record your pronunciation and send it to the trainer to get comprehensive evaluation and track your progress continuously.",
      },
    ],
    impact: [
      "Reach your goal in the shortest possible time with a 100% customized plan for your personal needs and goals.",
    ],
  },
];

const CourseCard = ({ course, index }: { course: Course; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const isReversed = index % 2 === 1;

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
              alt={course.name}
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
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{course.name}</h3>
          <p className="text-muted-foreground leading-relaxed">{course.description}</p>

          <div className="flex flex-wrap gap-4 pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={scrollToStart} className="gradient-primary text-white px-8 btn-interactive">
                Subscribe Now
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 gap-2 transition-all duration-200"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                More Info
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
                  <h4 className="text-xl font-bold text-foreground">{course.name}</h4>

                  {/* Intro paragraphs */}
                  <div className="space-y-3">
                    {course.introText.map((text, idx) => (
                      <p key={idx} className="text-muted-foreground leading-relaxed text-sm">
                        {text}
                      </p>
                    ))}
                  </div>

                  {/* What you'll learn */}
                  <div className="pt-2">
                    <h5 className="text-base font-bold text-foreground mb-3">What you'll learn:</h5>
                    <div className="space-y-4">
                      {course.whatYouLearn.map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          className="flex gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <h6 className="font-semibold text-foreground mb-1 text-sm">{item.title}</h6>
                            <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* The Impact */}
                  {course.impact.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-base font-bold text-foreground mb-3">The Impact:</h5>
                      <div className="space-y-2">
                        {course.impact.map((text, idx) => (
                          <p key={idx} className="text-muted-foreground leading-relaxed text-sm">
                            {text}
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

  return (
    <section id="courses" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 animate-fade-up ${headerVisible ? "visible" : ""}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose the right plan for you!
          </h2>
          <p className="text-muted-foreground text-lg">
            We offer a variety of courses to match your learning goals and schedule.
          </p>
        </div>

        {/* Course Cards */}
        <div className="space-y-16 max-w-8xl mx-auto">
        {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
