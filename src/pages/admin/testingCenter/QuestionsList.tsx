import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Eye, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import useLanguage from "@/hooks/useLanguage";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/types/question";
import { questionService } from "@/services/questionService";
import { quizService } from "@/services/quizService";
import QuestionDialog from "@/components/admin/testingCenter/QuestionDialog";
import QuestionViewDialog from "@/components/admin/testingCenter/QuestionViewDialog";

const QuestionsList = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tq = (key: string) => t(`admin.testingCenter.questions.${key}`);

  const loadQuestions = () => {
    setQuestions(questionService.getAll());
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleDelete = () => {
    if (!deleteId) return;
    const question = questionService.getById(deleteId);
    const success = questionService.remove(deleteId);
    if (success && question) {
      // Update quiz total
      const count = questionService.countByQuizId(question.quizId);
      quizService.updateTotalQuestions(question.quizId, count);
      loadQuestions();
      toast({ title: tq("deleteSuccess") });
    }
    setDeleteId(null);
  };

  const handleSave = () => {
    loadQuestions();
    setIsAddOpen(false);
    setEditingQuestion(null);
  };

  const getQuizName = (quizId: string) => {
    const quiz = quizService.getById(quizId);
    return quiz?.title || "-";
  };

  const typeLabels: Record<string, string> = {
    single_choice: tq("questionTypes.singleChoice"),
    multi_choice: tq("questionTypes.multiChoice"),
    true_false: tq("questionTypes.trueFalse"),
  };

  return (
    <div className="min-h-screen admin-page-bg" dir={isRTL ? "rtl" : "ltr"}>
      <AdminSidebar />
      <main className={cn("transition-all duration-300 pt-6 pb-10", isRTL ? "mr-16 ml-4" : "ml-16 mr-4")}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{tq("title")}</h1>
              <p className="text-muted-foreground mt-1">{tq("subtitle")}</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="gradient-primary text-white gap-2">
              <Plus className="h-4 w-4" />
              {tq("addQuestion")}
            </Button>
          </div>

          {/* Table */}
          <div className="admin-section p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>{tq("fields.questionText")}</TableHead>
                  <TableHead>{tq("fields.type")}</TableHead>
                  <TableHead>{tq("fields.quiz")}</TableHead>
                  <TableHead className="text-center">{tq("fields.order")}</TableHead>
                  <TableHead className="text-center">{tq("fields.points")}</TableHead>
                  <TableHead className="text-center">{tq("fields.correctAnswer")}</TableHead>
                  <TableHead className="text-center">{tq("fields.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {tq("noQuestions")}
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium max-w-[200px] truncate">{question.questionText}</TableCell>
                      <TableCell className="text-muted-foreground">{typeLabels[question.type]}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[180px] truncate">{getQuizName(question.quizId)}</TableCell>
                      <TableCell className="text-center">{question.order}</TableCell>
                      <TableCell className="text-center">{question.points}</TableCell>
                      <TableCell className="text-center">{question.correctAnswer}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingQuestion(question)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingQuestion(question)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-popover">
                              <DropdownMenuItem onClick={() => setDeleteId(question.id)} className="text-destructive cursor-pointer">
                                <Trash2 className="h-4 w-4 me-2" />
                                {tq("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <QuestionDialog open={isAddOpen} onOpenChange={setIsAddOpen} onSave={handleSave} />
      {editingQuestion && (
        <QuestionDialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)} question={editingQuestion} onSave={handleSave} />
      )}
      {viewingQuestion && (
        <QuestionViewDialog open={!!viewingQuestion} onOpenChange={(open) => !open && setViewingQuestion(null)} question={viewingQuestion} />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tq("deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{tq("deleteMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tq("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {tq("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuestionsList;
