import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, Calendar, CheckCircle, Clock, Eye, FileText,
  Star, User, XCircle, Send, MessageSquare, Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { sessionService } from "@/services/sessionService";
import { courseService } from "@/services/courseService";
import { levelService } from "@/services/levelService";
import TeacherLayout from "@/components/teacher/TeacherLayout";
import useLanguage from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";

const TeacherSessionDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isRTL, currentLanguage } = useLanguage();

  const session = sessionService.getSessionById(id ?? "");
  const existingEval = session ? sessionService.getEvaluationBySessionId(session.id) : null;
  const courses = courseService.getAll().filter(c => c.isActive);
  const levels = levelService.getAll().filter(l => l.isActive).sort((a, b) => a.order - b.order);

  // Written test dialog
  const [showWrittenTest, setShowWrittenTest] = useState(false);
  // Cancel request dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Evaluation form
  const [courseId, setCourseId] = useState(existingEval?.courseId ?? "");
  const [levelId, setLevelId] = useState(existingEval?.levelId ?? "");
  const [summary, setSummary] = useState(existingEval?.studentFeedback.summary ?? "");
  const [strengthsInput, setStrengthsInput] = useState("");
  const [strengths, setStrengths] = useState<string[]>(existingEval?.studentFeedback.strengths ?? []);
  const [improvementsInput, setImprovementsInput] = useState("");
  const [improvements, setImprovements] = useState<string[]>(existingEval?.studentFeedback.improvementAreas ?? []);
  const [ratings, setRatings] = useState(existingEval?.internalFeedback.ratings ?? {
    grammar: 0, speaking: 0, listening: 0, pronunciation: 0, confidence: 0,
  });
  const [internalNotes, setInternalNotes] = useState(existingEval?.internalFeedback.notes ?? "");

  if (!session) {
    return (
      <TeacherLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">{t("teacher.sessions.notFound")}</p>
          <Button className="mt-4" onClick={() => navigate("/teacher/sessions")}>{t("teacher.sessions.goBack")}</Button>
        </div>
      </TeacherLayout>
    );
  }

  const canEvaluate = !existingEval && session.status !== "cancelled";
  const isEvalValid = courseId && levelId;

  const handleAddTag = (input: string, setter: (v: string) => void, tags: string[], setTags: (v: string[]) => void) => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setter("");
  };

  const handleRemoveTag = (tag: string, tags: string[], setTags: (v: string[]) => void) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSaveEvaluation = () => {
    if (!isEvalValid) return;
    sessionService.createEvaluation({
      sessionId: session.id,
      courseId,
      levelId,
      studentFeedback: { summary, strengths, improvementAreas: improvements },
      internalFeedback: { ratings, notes: internalNotes },
      evaluatedBy: user?.id ?? "",
      evaluatedAt: new Date().toISOString(),
    });
    toast({ title: t("teacher.evaluation.saveSuccess") });
    navigate("/teacher/sessions");
  };

  const handleCancelRequest = () => {
    if (!cancelReason.trim()) return;
    sessionService.createCancelRequest({
      sessionId: session.id,
      teacherId: user?.id ?? "",
      teacherName: user?.fullName ?? "",
      studentId: session.studentId,
      studentName: session.studentName,
      reason: cancelReason,
    });
    toast({ title: t("teacher.sessions.cancelRequestSent") });
    setShowCancelDialog(false);
    navigate("/teacher/sessions");
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => !existingEval && onChange(star)}
            className={`transition-colors ${existingEval ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          >
            <Star
              className={`h-5 w-5 ${star <= value ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/teacher/sessions")}>
            {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("teacher.sessions.sessionDetail")}</h1>
            <p className="text-sm text-muted-foreground">{session.oralTestTypeName}</p>
          </div>
        </div>

        {/* Session Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("teacher.sessions.student")}</p>
                <p className="font-semibold">{session.studentName}</p>
                <p className="text-xs text-muted-foreground">{session.studentEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("teacher.sessions.dateTime")}</p>
                <p className="font-semibold">{format(parseISO(session.date), "MMM dd, yyyy")}</p>
                <p className="text-xs text-muted-foreground">{session.startTime} - {session.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("teacher.sessions.writtenTest")}</p>
                {session.writtenTestResult ? (
                  <>
                    <p className="font-semibold">{session.writtenTestResult.totalScore}/{session.writtenTestResult.maxScore}</p>
                    <Button variant="link" className="h-auto p-0 text-xs text-primary" onClick={() => setShowWrittenTest(true)}>
                      <Eye className="h-3 w-3 mr-1" /> {t("teacher.sessions.viewWrittenTest")}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("teacher.sessions.noWrittenTest")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {session.status === "scheduled" && !session.cancelRequestId && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                {t("teacher.sessions.cancelRequest")}
              </Button>
            </div>
          )}
          {session.cancelRequestId && (
            <div className="mt-4 pt-4 border-t border-border">
              <Badge className="bg-amber-100 text-amber-700">
                {t("teacher.sessions.cancelRequestPending")}
              </Badge>
            </div>
          )}
        </div>

        {/* Evaluation Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            {t("teacher.evaluation.title")}
            {existingEval && (
              <Badge className="bg-emerald-100 text-emerald-700 ml-2">{t("teacher.evaluation.completed")}</Badge>
            )}
          </h2>

          {/* Course & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("teacher.evaluation.course")} *
              </label>
              <Select value={courseId} onValueChange={setCourseId} disabled={!!existingEval}>
                <SelectTrigger><SelectValue placeholder={t("teacher.evaluation.selectCourse")} /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {currentLanguage === "ar" ? c.nameAr : c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("teacher.evaluation.level")} *
              </label>
              <Select value={levelId} onValueChange={setLevelId} disabled={!!existingEval}>
                <SelectTrigger><SelectValue placeholder={t("teacher.evaluation.selectLevel")} /></SelectTrigger>
                <SelectContent>
                  {levels.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {currentLanguage === "ar" ? l.nameAr : l.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT - Student Feedback */}
            <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/10 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-emerald-100/60 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800/40">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{t("teacher.evaluation.studentFeedback")}</h3>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">{t("teacher.evaluation.studentFeedbackDesc")}</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("teacher.evaluation.summary")}</label>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    disabled={!!existingEval}
                    rows={4}
                    placeholder={t("teacher.evaluation.summaryPlaceholder")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("teacher.evaluation.strengths")}</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={strengthsInput}
                      onChange={e => setStrengthsInput(e.target.value)}
                      disabled={!!existingEval}
                      placeholder={t("teacher.evaluation.addTag")}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddTag(strengthsInput, setStrengthsInput, strengths, setStrengths))}
                    />
                    {!existingEval && (
                      <Button size="sm" variant="outline" onClick={() => handleAddTag(strengthsInput, setStrengthsInput, strengths, setStrengths)}>+</Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {strengths.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-pointer"
                        onClick={() => !existingEval && handleRemoveTag(tag, strengths, setStrengths)}
                      >
                        {tag} {!existingEval && "×"}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("teacher.evaluation.improvementAreas")}</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={improvementsInput}
                      onChange={e => setImprovementsInput(e.target.value)}
                      disabled={!!existingEval}
                      placeholder={t("teacher.evaluation.addTag")}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddTag(improvementsInput, setImprovementsInput, improvements, setImprovements))}
                    />
                    {!existingEval && (
                      <Button size="sm" variant="outline" onClick={() => handleAddTag(improvementsInput, setImprovementsInput, improvements, setImprovements)}>+</Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {improvements.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 cursor-pointer"
                        onClick={() => !existingEval && handleRemoveTag(tag, improvements, setImprovements)}
                      >
                        {tag} {!existingEval && "×"}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - Internal Feedback */}
            <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/10 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-amber-100/60 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/40">
                <div className="h-9 w-9 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{t("teacher.evaluation.internalFeedback")}</h3>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/70">{t("teacher.evaluation.internalFeedbackDesc")}</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="space-y-3 bg-card/60 dark:bg-card/30 rounded-lg p-4 border border-border/50">
                  <StarRating label={t("teacher.evaluation.grammar")} value={ratings.grammar} onChange={v => setRatings(r => ({ ...r, grammar: v }))} />
                  <StarRating label={t("teacher.evaluation.speaking")} value={ratings.speaking} onChange={v => setRatings(r => ({ ...r, speaking: v }))} />
                  <StarRating label={t("teacher.evaluation.listening")} value={ratings.listening} onChange={v => setRatings(r => ({ ...r, listening: v }))} />
                  <StarRating label={t("teacher.evaluation.pronunciation")} value={ratings.pronunciation} onChange={v => setRatings(r => ({ ...r, pronunciation: v }))} />
                  <StarRating label={t("teacher.evaluation.confidence")} value={ratings.confidence} onChange={v => setRatings(r => ({ ...r, confidence: v }))} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("teacher.evaluation.internalNotes")}</label>
                  <Textarea
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    disabled={!!existingEval}
                    rows={4}
                    placeholder={t("teacher.evaluation.internalNotesPlaceholder")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {canEvaluate && (
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <Button
                onClick={handleSaveEvaluation}
                disabled={!isEvalValid}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {t("teacher.evaluation.save")}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Written Test Dialog */}
      <Dialog open={showWrittenTest} onOpenChange={setShowWrittenTest}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("teacher.sessions.writtenTestResults")}</DialogTitle>
          </DialogHeader>
          {session.writtenTestResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="font-medium">{session.writtenTestResult.quizTitle}</span>
                <Badge>{session.writtenTestResult.totalScore}/{session.writtenTestResult.maxScore}</Badge>
              </div>
              {session.writtenTestResult.questions.map((q, i) => (
                <div key={i} className={`p-4 rounded-lg border ${q.isCorrect ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20" : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"}`}>
                  <p className="font-medium text-sm mb-2">{i + 1}. {q.questionText}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("teacher.sessions.studentAnswer")}:</span>
                      <span className={`ml-1 font-medium ${q.isCorrect ? "text-emerald-600" : "text-red-600"}`}>{q.studentAnswer}</span>
                    </div>
                    {!q.isCorrect && (
                      <div>
                        <span className="text-muted-foreground">{t("teacher.sessions.correctAnswer")}:</span>
                        <span className="ml-1 font-medium text-emerald-600">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Request Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("teacher.sessions.cancelRequestTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("teacher.sessions.cancelRequestDesc")}</p>
            <Textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder={t("teacher.sessions.cancelReasonPlaceholder")}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>{t("teacher.sessions.cancel")}</Button>
            <Button onClick={handleCancelRequest} disabled={!cancelReason.trim()} className="bg-red-600 hover:bg-red-700 text-white">
              {t("teacher.sessions.submitCancelRequest")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
};

export default TeacherSessionDetail;
