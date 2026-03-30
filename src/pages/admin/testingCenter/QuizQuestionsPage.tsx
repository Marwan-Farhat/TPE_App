import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import useLanguage from "@/hooks/useLanguage";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { quizService } from "@/services/quizService";
import { questionService } from "@/services/questionService";
import { Question, QuestionType, QuestionFormData } from "@/types/question";
import { Quiz } from "@/types/quiz";

interface QuestionFormState {
  id?: string;
  questionText: string;
  type: QuestionType;
  mediaUrl: string;
  mediaType: '' | 'image' | 'video' | 'audio';
  answers: { label: string; value: string }[];
  correctAnswer: string;
  order: number;
  points: number;
}

const getDefaultAnswers = (type: QuestionType) => {
  if (type === 'true_false') {
    return [
      { label: 'True', value: 'True' },
      { label: 'False', value: 'False' },
    ];
  }
  return [
    { label: 'Option A', value: '' },
    { label: 'Option B', value: '' },
    { label: 'Option C', value: '' },
    { label: 'Option D', value: '' },
  ];
};

const QuizQuestionsPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { id: quizId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuestionFormState[]>([]);

  const tq = (key: string) => t(`admin.testingCenter.questions.${key}`);

  useEffect(() => {
    if (!quizId) return;
    const q = quizService.getById(quizId);
    if (!q) {
      navigate("/admin/testing-center/quizzes");
      return;
    }
    setQuiz(q);

    const existing = questionService.getByQuizId(quizId);
    if (existing.length > 0) {
      setQuestions(existing.map((eq) => ({
        id: eq.id,
        questionText: eq.questionText,
        type: eq.type,
        mediaUrl: eq.mediaUrl,
        mediaType: eq.mediaType,
        answers: eq.answers,
        correctAnswer: eq.correctAnswer,
        order: eq.order,
        points: eq.points,
      })));
    } else {
      // Start with one empty question
      setQuestions([{
        questionText: '',
        type: 'single_choice',
        mediaUrl: '',
        mediaType: '',
        answers: getDefaultAnswers('single_choice'),
        correctAnswer: 'Option A',
        order: 1,
        points: 1,
      }]);
    }
  }, [quizId]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        type: 'single_choice',
        mediaUrl: '',
        mediaType: '',
        answers: getDefaultAnswers('single_choice'),
        correctAnswer: 'Option A',
        order: prev.length + 1,
        points: 1,
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<QuestionFormState>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  };

  const handleTypeChange = (index: number, type: QuestionType) => {
    const newAnswers = getDefaultAnswers(type);
    updateQuestion(index, {
      type,
      answers: newAnswers,
      correctAnswer: newAnswers[0].label,
    });
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newAnswers = [...q.answers];
      newAnswers[aIndex] = { ...newAnswers[aIndex], value };
      return { ...q, answers: newAnswers };
    }));
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 })));
  };

  const handleSaveQuestions = () => {
    if (!quizId) return;

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast({ title: `${tq("question")} ${i + 1}: ${tq("validation.questionRequired")}`, variant: "destructive" });
        return;
      }
      if (q.points <= 0) {
        toast({ title: `${tq("question")} ${i + 1}: ${tq("validation.pointsPositive")}`, variant: "destructive" });
        return;
      }
      if (q.type !== 'true_false') {
        const emptyAnswers = q.answers.some((a) => !a.value.trim());
        if (emptyAnswers) {
          toast({ title: `${tq("question")} ${i + 1}: ${tq("validation.answersRequired")}`, variant: "destructive" });
          return;
        }
      }
    }

    // Delete existing questions for this quiz
    const existing = questionService.getByQuizId(quizId);
    existing.forEach((eq) => questionService.remove(eq.id));

    // Create new questions
    questions.forEach((q) => {
      questionService.create({
        quizId,
        questionText: q.questionText,
        type: q.type,
        mediaUrl: q.mediaUrl,
        mediaType: q.mediaType,
        answers: q.answers,
        correctAnswer: q.correctAnswer,
        order: q.order,
        points: q.points,
      });
    });

    // Update quiz stats
    quizService.updateTotalQuestions(quizId, questions.length);
    quizService.updateQuestionsStatus(quizId, 'saved');

    toast({ title: tq("saveSuccess") });
    navigate("/admin/testing-center/quizzes");
  };

  if (!quiz) return null;

  return (
    <div className="min-h-screen admin-page-bg" dir={isRTL ? "rtl" : "ltr"}>
      <AdminSidebar />
      <main className={cn("transition-all duration-300 pt-6 pb-10", isRTL ? "mr-16 ml-4" : "ml-16 mr-4")}>
        <div className="max-w-6xl mx-auto px-4">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate("/admin/testing-center/quizzes")}
          >
            <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
            {t("admin.testingCenter.quizzes.backToQuizzes")}
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {tq("questionsFor")}: {quiz.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {tq("addQuestions")} {questions.length} {tq("questionsCount")} ({tq("allFieldsRequired")})
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="admin-section p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{tq("question")} {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeQuestion(qIndex)}>
                      {tq("removeQuestion")}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label>{tq("fields.questionText")} *</Label>
                    <Input
                      value={question.questionText}
                      onChange={(e) => updateQuestion(qIndex, { questionText: e.target.value })}
                      placeholder={tq("fields.questionText")}
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label>{tq("fields.type")} *</Label>
                    <Select value={question.type} onValueChange={(v) => handleTypeChange(qIndex, v as QuestionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="single_choice">{tq("questionTypes.singleChoice")}</SelectItem>
                        <SelectItem value="multi_choice">{tq("questionTypes.multiChoice")}</SelectItem>
                        <SelectItem value="true_false">{tq("questionTypes.trueFalse")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options / Answers */}
                  <div className="space-y-2">
                    <Label className="font-semibold">{tq("options")}</Label>
                    {question.type === 'true_false' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <Input value="True" disabled className="bg-muted/50" />
                        <Input value="False" disabled className="bg-muted/50" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {question.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{answer.label} *</Label>
                            <Input
                              value={answer.value}
                              onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                              placeholder={answer.label}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Correct Answer & Points row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tq("fields.correctAnswer")} *</Label>
                      <Select
                        value={question.correctAnswer}
                        onValueChange={(v) => updateQuestion(qIndex, { correctAnswer: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {question.answers.map((answer) => (
                            <SelectItem key={answer.label} value={answer.label}>
                              {answer.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{tq("fields.points")} *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, { points: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Media (optional) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tq("fields.mediaUrl")}</Label>
                      <Input
                        value={question.mediaUrl}
                        onChange={(e) => updateQuestion(qIndex, { mediaUrl: e.target.value })}
                        placeholder={tq("fields.mediaUrlPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tq("fields.mediaType")}</Label>
                      <Select
                        value={question.mediaType || "none"}
                        onValueChange={(v) => updateQuestion(qIndex, { mediaType: v === 'none' ? '' : v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="none">{tq("none")}</SelectItem>
                          <SelectItem value="image">{tq("mediaTypes.image")}</SelectItem>
                          <SelectItem value="video">{tq("mediaTypes.video")}</SelectItem>
                          <SelectItem value="audio">{tq("mediaTypes.audio")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question + Save buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={addQuestion}>
              + {tq("addAnotherQuestion")}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/admin/testing-center/quizzes")}>
                {tq("cancel")}
              </Button>
              <Button onClick={handleSaveQuestions} className="gradient-primary text-white gap-2">
                <Save className="h-4 w-4" />
                {tq("saveQuestions")}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizQuestionsPage;
