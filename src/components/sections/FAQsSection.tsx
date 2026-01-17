import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "1- How do I choose the right course for me from The Pro English programs?",
    answer:
      "Through the Coaching Session, an individual consultation that serves as guidance for you and your life, where we get to know you better and your goals, so you get a comprehensive evaluation of your strengths and areas for improvement, and based on that we recommend the right course for your level and goals, and from here your development and change plan begins for the better.",
  },
  {
    question: "2- What is the specialization and experience of trainers at The Pro English?",
    answer: `At The Pro English, we believe that the quality and continuity of education starts with teachers, so we always ensure to choose the most competent and best trainers through very precise and diverse evaluation stages, including:

Professional language level: Every teacher speaks English fluently at a level equivalent to native speakers to ensure you learn and pronounce English as it's used globally.

Certificates and experience: Trainers hold internationally recognized certificates such as CELTA or TEFL or have passed The Pro English's special training program or have long and deep experience in teaching.

Personal skills: Every teacher enjoys strong personal skills and high professionalism in teaching and communicating with trainees, to ensure a comfortable and fruitful experience.`,
  },
  {
    question: "3- Can I start from scratch without level assessment?",
    answer:
      "To ensure maximum benefit from The Pro English courses, level assessment and Coaching Session are essential, as they will help you know your real level and start with trainees at your same level.\n\nMoreover, you might be at a higher level than zero; then you would waste your time and money on information you already know and lose enthusiasm with trainees whose level is lower than yours, so we ensure you start from the right point to continue.",
  },
  {
    question: "4- I know my level, can I start without level assessment?",
    answer: `To ensure maximum benefit for you, level assessment and Coaching Session in The Pro way are essential.

Because level assessment differs from place to place, for example, we rely on two parts:

• Multiple choice MCQ test consisting of 50 questions from easy to difficult, measuring different aspects of your level such as reading, grammar, vocabulary, and comprehension speed.

• Interactive 30-minute session with the trainer who speaks and chats with you in English to assess your language skills and give you a comprehensive evaluation.

You might have done it before and your level has decreased or increased, and we care that you start from the right level.

If you start from a level lower or higher than yours, you would waste your time and money on an inappropriate level and this would make you lose enthusiasm and feel lost, so we follow a specific system that helps you progress quickly.`,
  },
  {
    question: "5- What distinguishes the Coaching session from anywhere else?",
    answer: `The difference is summarized in 5 points:

First, you enter with the trainer in a session like a regular course... this makes you experience the course and get an idea before starting.

30 minutes of speaking and chatting with you on common topics that help you speak and determine your level.

He tells you your strengths, the points you need to improve, and tells you how we'll continue the right way that leads you to your dream.

After that, you start the course with us from the appropriate level for you and through it you can ask any question you want.

And if you don't book with us, you've learned your level comprehensively and can continue on your own.`,
  },
  {
    question: "6- What happens inside the Coaching Session for level assessment?!",
    answer:
      "The session is a nice chat with the trainer in a friendly way, he gets to know you first and gets an idea about your level.\n\nThen he speaks with you in English like a regular course with life questions from easy to difficult, from which he knows your listening level and evaluates your pronunciation of words and sentences.\n\nSo at the end of the session, he determines your strengths which include the words and sentences you pronounced correctly, and the shortcomings you have so you can start working on them and tells you what level you're at and what level you need to reach to achieve your dream.",
  },
  {
    question: "7- Are you available offline or online?",
    answer:
      "We are online only, our programs depend on interaction and take more than twice a week, and this is difficult to happen offline, besides offline problems in transportation, political situations and others, while online is easier, faster, and through it you get to know young people from different cultures around the world.",
  },
  {
    question: "8- Can I know more about The Pro English guarantee?",
    answer:
      "The guarantee is an additional unique feature for the owners of the right method at The Pro English, and it's a guarantee that allows you throughout the year to repeat any level you didn't succeed in at our expense, besides you can review any level and attend it again for free as if you're taking it for the first time if you commit to attending all lectures, and this is an exceptional experience that we are the only place in Egypt that offers it for the benefit of all Pro students.",
  },
  {
    question: "9- Will the course give me an accredited certificate?",
    answer:
      "The only accredited certificates in language are IELTS and TOEFL, and these are international certificates that you must take and pass specific tests to obtain, and this is what we prepare you for in The Pro English courses, besides our help with an intensive preparatory course that lasts a month so you're ready before entering the accredited certificate exams.\n\nIn addition to this, we provide you with an attendance certificate after successfully passing each level, and a program completion certificate that you can add to your personal profile on LinkedIn to highlight your strong language skills in front of HR officials in large companies.",
  },
  {
    question: "10- Is course price installment available?",
    answer:
      "We care that you're comfortable! So we provide you with a course price installment service within 30 days, you can pay 50% at the beginning and the rest after a month, besides you can pay it in 3 installments within 60 days at a rate of 40% at the beginning and then 30% and 30% if you take advantage of the opportunity and get the (guarantee).",
  },
];

const FAQsSection = () => {
  return (
    <section id="faqs" className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Do you have many questions in your mind?!
          </h2>
          <p className="text-muted-foreground text-base">
            Get the answers the right way!
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-soft"
              >
                <AccordionTrigger className="text-left text-foreground font-medium py-4 hover:no-underline hover:text-primary text-sm md:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 whitespace-pre-line text-sm leading-relaxed">
                  {faq.answer}
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
