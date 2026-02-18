import { useTranslation } from "react-i18next";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types/question";
import { quizService } from "@/services/quizService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
}

const QuestionViewDialog = ({ open, onOpenChange, question }: Props) => {
  const { t } = useTranslation();
  const tq = (key: string) => t(`admin.testingCenter.questions.${key}`);

  const quiz = quizService.getById(question.quizId);

  const typeLabels: Record<string, string> = {
    single_choice: tq("questionTypes.singleChoice"),
    multi_choice: tq("questionTypes.multiChoice"),
    true_false: tq("questionTypes.trueFalse"),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{question.questionText}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{typeLabels[question.type]}</Badge>
            <Badge variant="outline">{tq("fields.points")}: {question.points}</Badge>
            <Badge variant="outline">{tq("fields.order")}: {question.order}</Badge>
          </div>

          {quiz && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tq("fields.quiz")}</p>
              <p className="text-sm mt-1">{quiz.title}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">{tq("options")}</p>
            <div className="mt-1 space-y-1">
              {question.answers.map((a, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-sm px-3 py-1.5 rounded",
                    a.label === question.correctAnswer
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-muted/50"
                  )}
                >
                  {a.label}: {a.value || a.label}
                  {a.label === question.correctAnswer && " ✓"}
                </div>
              ))}
            </div>
          </div>

          {question.mediaUrl && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tq("fields.mediaUrl")}</p>
              <p className="text-sm mt-1 break-all">{question.mediaUrl}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Need cn import
import { cn } from "@/lib/utils";

export default QuestionViewDialog;
