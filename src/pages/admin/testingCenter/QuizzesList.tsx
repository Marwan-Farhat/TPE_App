import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Eye, Trash2, MoreVertical, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import useLanguage from "@/hooks/useLanguage";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Quiz } from "@/types/quiz";
import { quizService } from "@/services/quizService";
import { questionService } from "@/services/questionService";
import { testTemplateService } from "@/services/testTemplateService";
import QuizDialog from "@/components/admin/testingCenter/QuizDialog";
import QuizViewDialog from "@/components/admin/testingCenter/QuizViewDialog";
import { useNavigate } from "react-router-dom";

const QuizzesList = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tq = (key: string) => t(`admin.testingCenter.quizzes.${key}`);

  const loadQuizzes = () => {
    const all = quizService.getAll();
    // Sync totalQuestions
    all.forEach((q) => {
      const count = questionService.countByQuizId(q.id);
      if (q.totalQuestions !== count) {
        quizService.updateTotalQuestions(q.id, count);
        q.totalQuestions = count;
      }
    });
    setQuizzes(all);
  };

  useEffect(() => { loadQuizzes(); }, []);

  const handleToggleActive = (id: string) => {
    const quiz = quizzes.find((q) => q.id === id);
    if (quiz?.isActive && quiz?.isCurrent) {
      toast({ title: tq("cannotDeactivateCurrent"), variant: "destructive" });
      return;
    }
    const result = quizService.toggleActive(id);
    if (result) loadQuizzes();
  };

  const handleToggleCurrent = (id: string) => {
    const quiz = quizzes.find((q) => q.id === id);
    if (quiz?.isCurrent) {
      toast({ title: tq("cannotUnsetCurrent"), variant: "destructive" });
      return;
    }
    if (!quiz?.isActive) {
      toast({ title: tq("mustBeActive"), variant: "destructive" });
      return;
    }
    const result = quizService.toggleCurrent(id);
    if (result) {
      loadQuizzes();
      toast({ title: tq("currentUpdated") });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const quiz = quizzes.find((q) => q.id === deleteId);
    if (quiz?.isCurrent) {
      toast({ title: tq("cannotDeleteCurrent"), variant: "destructive" });
      setDeleteId(null);
      return;
    }
    // Check if questions exist
    const qCount = questionService.countByQuizId(deleteId);
    if (qCount > 0) {
      toast({ title: tq("cannotDeleteWithQuestions"), variant: "destructive" });
      setDeleteId(null);
      return;
    }
    const success = quizService.remove(deleteId);
    if (success) {
      loadQuizzes();
      toast({ title: tq("deleteSuccess") });
    }
    setDeleteId(null);
  };

  const handleSave = () => {
    loadQuizzes();
    setIsAddOpen(false);
    setEditingQuiz(null);
  };

  const getTemplateName = (templateId: string | null) => {
    if (!templateId) return "-";
    const tmpl = testTemplateService.getById(templateId);
    return tmpl?.title || "-";
  };

  const getTestTypeLabel = (testType: string) => {
    switch (testType) {
      case "placement_test": return tq("testTypes.placementTest");
      case "practice_exam": return tq("testTypes.practiceExam");
      case "final_exam": return tq("testTypes.finalExam");
      default: return testType;
    }
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
              {tq("addQuiz")}
            </Button>
          </div>

          {/* Table */}
          <div className="admin-section p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>{tq("fields.title")}</TableHead>
                  <TableHead>{tq("fields.testType")}</TableHead>
                  <TableHead>{tq("fields.instructions")}</TableHead>
                  <TableHead className="text-center">{tq("fields.totalQuestions")}</TableHead>
                  <TableHead className="text-center">{tq("fields.timeLimit")}</TableHead>
                  <TableHead className="text-center">{tq("fields.active")}</TableHead>
                  <TableHead className="text-center">{tq("fields.current")}</TableHead>
                  <TableHead className="text-center">{tq("fields.questionsStatus")}</TableHead>
                  <TableHead className="text-center">{tq("fields.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      {tq("noQuizzes")}
                    </TableCell>
                  </TableRow>
                ) : (
                  quizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium max-w-[180px] truncate">{quiz.title}</TableCell>
                      <TableCell className="text-muted-foreground">{getTestTypeLabel(quiz.testType)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{quiz.instructions}</TableCell>
                      <TableCell className="text-center font-medium">{quiz.totalQuestions}</TableCell>
                      <TableCell className="text-center font-medium">{quiz.timeLimit}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch checked={quiz.isActive} onCheckedChange={() => handleToggleActive(quiz.id)} />
                          <span className="text-xs text-muted-foreground">
                            {quiz.isActive ? tq("yes") : tq("no")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch checked={quiz.isCurrent} onCheckedChange={() => handleToggleCurrent(quiz.id)} />
                          <span className="text-xs text-muted-foreground">
                            {quiz.isCurrent ? tq("yes") : tq("no")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={quiz.questionsStatus === "saved" ? "default" : "secondary"}
                          className={quiz.questionsStatus === "saved" ? "bg-green-600 text-white" : ""}
                        >
                          {tq(`questionsStatusLabels.${quiz.questionsStatus}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingQuiz(quiz)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/admin/testing-center/quizzes/${quiz.id}/questions`)}
                            title={tq("manageQuestions")}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingQuiz(quiz)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-popover">
                              <DropdownMenuItem onClick={() => setDeleteId(quiz.id)} className="text-destructive cursor-pointer">
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

      {/* Add Dialog */}
      <QuizDialog open={isAddOpen} onOpenChange={setIsAddOpen} onSave={handleSave} />

      {/* Edit Dialog */}
      {editingQuiz && (
        <QuizDialog open={!!editingQuiz} onOpenChange={(open) => !open && setEditingQuiz(null)} quiz={editingQuiz} onSave={handleSave} />
      )}

      {/* View Dialog */}
      {viewingQuiz && (
        <QuizViewDialog open={!!viewingQuiz} onOpenChange={(open) => !open && setViewingQuiz(null)} quiz={viewingQuiz} />
      )}

      {/* Delete Confirmation */}
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

export default QuizzesList;
