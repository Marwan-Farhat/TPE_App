import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Question, QuestionFormData, QuestionType } from "@/types/question";
import { questionService } from "@/services/questionService";
import { quizService } from "@/services/quizService";
import { Quiz } from "@/types/quiz";
import { useToast } from "@/hooks/use-toast";

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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question;
  onSave: () => void;
}

const QuestionDialog = ({ open, onOpenChange, question, onSave }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isEdit = !!question;

  const tq = (key: string) => t(`admin.testingCenter.questions.${key}`);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [form, setForm] = useState<QuestionFormData>({
    quizId: '',
    questionText: '',
    type: 'single_choice',
    mediaUrl: '',
    mediaType: '',
    answers: getDefaultAnswers('single_choice'),
    correctAnswer: 'Option A',
    order: 0,
    points: 1,
  });

  useEffect(() => {
    setQuizzes(quizService.getAll());
  }, [open]);

  useEffect(() => {
    if (question) {
      setForm({
        quizId: question.quizId,
        questionText: question.questionText,
        type: question.type,
        mediaUrl: question.mediaUrl,
        mediaType: question.mediaType,
        answers: question.answers,
        correctAnswer: question.correctAnswer,
        order: question.order,
        points: question.points,
      });
    } else {
      setForm({
        quizId: '',
        questionText: '',
        type: 'single_choice',
        mediaUrl: '',
        mediaType: '',
        answers: getDefaultAnswers('single_choice'),
        correctAnswer: 'Option A',
        order: 0,
        points: 1,
      });
    }
  }, [question, open]);

  const handleTypeChange = (type: QuestionType) => {
    const newAnswers = getDefaultAnswers(type);
    setForm((p) => ({
      ...p,
      type,
      answers: newAnswers,
      correctAnswer: newAnswers[0].label,
    }));
  };

  const handleAnswerChange = (aIndex: number, value: string) => {
    setForm((p) => {
      const newAnswers = [...p.answers];
      newAnswers[aIndex] = { ...newAnswers[aIndex], value };
      return { ...p, answers: newAnswers };
    });
  };

  const handleSubmit = () => {
    if (!form.quizId || !form.questionText.trim() || form.points <= 0) {
      toast({ title: tq("validation.fillRequired"), variant: "destructive" });
      return;
    }
    if (form.type !== 'true_false' && form.answers.some((a) => !a.value.trim())) {
      toast({ title: tq("validation.answersRequired"), variant: "destructive" });
      return;
    }

    if (isEdit && question) {
      questionService.update(question.id, form);
      toast({ title: tq("updateSuccess") });
    } else {
      // Auto-set order
      const existing = questionService.getByQuizId(form.quizId);
      form.order = existing.length + 1;
      questionService.create(form);
      toast({ title: tq("createSuccess") });
    }

    // Update quiz total
    const count = questionService.countByQuizId(form.quizId);
    quizService.updateTotalQuestions(form.quizId, count);

    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? tq("editQuestion") : tq("addNewQuestion")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quiz */}
          <div className="space-y-2">
            <Label>{tq("fields.quiz")} *</Label>
            <Select value={form.quizId} onValueChange={(v) => setForm((p) => ({ ...p, quizId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={tq("fields.selectQuiz")} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {quizzes.map((q) => (
                  <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label>{tq("fields.questionText")} *</Label>
            <Input
              value={form.questionText}
              onChange={(e) => setForm((p) => ({ ...p, questionText: e.target.value }))}
              placeholder={tq("fields.questionText")}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>{tq("fields.type")} *</Label>
            <Select value={form.type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
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

          {/* Media URL & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tq("fields.mediaUrl")}</Label>
              <Input
                value={form.mediaUrl}
                onChange={(e) => setForm((p) => ({ ...p, mediaUrl: e.target.value }))}
                placeholder={tq("fields.mediaUrlPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{tq("fields.mediaType")}</Label>
              <Select value={form.mediaType || "none"} onValueChange={(v) => setForm((p) => ({ ...p, mediaType: v === 'none' ? '' : v as any }))}>
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

          {/* Answers */}
          <div className="space-y-2">
            <Label className="font-semibold">{tq("options")}</Label>
            {form.type === 'true_false' ? (
              <div className="grid grid-cols-2 gap-4">
                <Input value="True" disabled className="bg-muted/50" />
                <Input value="False" disabled className="bg-muted/50" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {form.answers.map((answer, i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{answer.label} *</Label>
                    <Input
                      value={answer.value}
                      onChange={(e) => handleAnswerChange(i, e.target.value)}
                      placeholder={answer.label}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Correct Answer & Order & Points */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{tq("fields.correctAnswer")} *</Label>
              <Select value={form.correctAnswer} onValueChange={(v) => setForm((p) => ({ ...p, correctAnswer: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {form.answers.map((a) => (
                    <SelectItem key={a.label} value={a.label}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tq("fields.order")} *</Label>
              <Input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{tq("fields.points")} *</Label>
              <Input
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm((p) => ({ ...p, points: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tq("cancel")}</Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            {isEdit ? tq("save") : tq("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDialog;
