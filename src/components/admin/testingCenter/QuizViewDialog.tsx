import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/types/quiz";
import { testTemplateService } from "@/services/testTemplateService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
}

const QuizViewDialog = ({ open, onOpenChange, quiz }: Props) => {
  const { t } = useTranslation();
  const tq = (key: string) => t(`admin.testingCenter.quizzes.${key}`);

  const template = quiz.templateId ? testTemplateService.getById(quiz.templateId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant={quiz.isActive ? "default" : "secondary"}>
              {quiz.isActive ? tq("yes") : tq("no")} - {tq("fields.active")}
            </Badge>
            {quiz.isCurrent && (
              <Badge className="bg-green-600 text-white">{tq("fields.current")}</Badge>
            )}
            <Badge variant="outline">
              {tq(`testTypes.${quiz.testType === 'placement_test' ? 'placementTest' : quiz.testType === 'practice_exam' ? 'practiceExam' : 'finalExam'}`)}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">{tq("fields.instructions")}</p>
            <p className="text-sm mt-1">{quiz.instructions}</p>
          </div>

          {template && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tq("fields.testTemplate")}</p>
              <p className="text-sm mt-1">{template.title}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tq("fields.totalQuestions")}</p>
              <p className="text-sm mt-1">{quiz.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tq("fields.timeLimit")}</p>
              <p className="text-sm mt-1">{quiz.timeLimit} {tq("minutes")}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">{tq("fields.questionsStatus")}</p>
            <Badge variant={quiz.questionsStatus === 'saved' ? 'default' : 'secondary'} className={quiz.questionsStatus === 'saved' ? 'bg-green-600 text-white' : ''}>
              {tq(`questionsStatusLabels.${quiz.questionsStatus}`)}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">{tq("createdAt")}</p>
            <p className="text-sm mt-1">{new Date(quiz.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizViewDialog;
