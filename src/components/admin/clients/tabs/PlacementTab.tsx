import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileCheck, BookOpen, MessageSquare, Lock, Star, CheckCircle,
  AlertTriangle, TrendingUp, Award, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { sessionService } from "@/services/sessionService";
import { courseService } from "@/services/courseService";
import { levelService } from "@/services/levelService";
import { Session } from "@/types/session";
import { Evaluation } from "@/types/evaluation";

interface PlacementTabProps {
  clientId: string;
}

const PlacementTab: React.FC<PlacementTabProps> = ({ clientId }) => {
  const { t } = useTranslation();
  const sessions = sessionService.getSessionsByStudent(clientId);
  const courses = courseService.getAll();
  const levels = levelService.getAll();

  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.nameEn || id;
  const getLevelName = (id: string) => levels.find((l) => l.id === id)?.nameEn || id;

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">{t("admin.clientProfile.placement.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("admin.clientProfile.placement.noSessions")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => {
        const evaluation = session.evaluationId
          ? sessionService.getEvaluationBySessionId(session.id)
          : undefined;

        return (
          <SessionCard
            key={session.id}
            session={session}
            evaluation={evaluation}
            getCourseName={getCourseName}
            getLevelName={getLevelName}
            t={t}
          />
        );
      })}
    </div>
  );
};

interface SessionCardProps {
  session: Session;
  evaluation?: Evaluation;
  getCourseName: (id: string) => string;
  getLevelName: (id: string) => string;
  t: (key: string) => string;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, evaluation, getCourseName, getLevelName, t }) => {
  const [writtenOpen, setWrittenOpen] = useState(false);
  const [oralOpen, setOralOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {session.oralTestTypeName}
          </CardTitle>
          <Badge variant={session.status === "completed" ? "default" : session.status === "cancelled" ? "destructive" : "secondary"}>
            {session.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {session.date}</span>
          <span>{session.startTime} - {session.endTime}</span>
          <span>{t("admin.clientProfile.placement.teacher")}: {session.teacherName}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {/* Written Test - Collapsible */}
        {session.writtenTestResult && (
          <Collapsible open={writtenOpen} onOpenChange={setWrittenOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold">{t("admin.clientProfile.placement.writtenTest")}</span>
                  <span className="text-xs text-muted-foreground">{session.writtenTestResult.quizTitle}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                    {session.writtenTestResult.totalScore}/{session.writtenTestResult.maxScore}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((session.writtenTestResult.totalScore / session.writtenTestResult.maxScore) * 100)}%
                  </Badge>
                  {writtenOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-950/10 space-y-3">
                <Progress
                  value={(session.writtenTestResult.totalScore / session.writtenTestResult.maxScore) * 100}
                  className="h-2"
                />
                <div className="space-y-2">
                  {session.writtenTestResult.questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {q.isCorrect ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-foreground">{q.questionText}</p>
                        <p className="text-muted-foreground">
                          {t("admin.clientProfile.placement.answer")}: {q.studentAnswer}
                          {!q.isCorrect && (
                            <span className="text-emerald-600 ml-2">
                              ({t("admin.clientProfile.placement.correct")}: {q.correctAnswer})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Oral Evaluation - Collapsible */}
        {evaluation && (
          <Collapsible open={oralOpen} onOpenChange={setOralOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{t("admin.clientProfile.placement.oralEvaluation")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs gap-1">
                    <BookOpen className="h-3 w-3" />
                    {getCourseName(evaluation.courseId)}
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {getLevelName(evaluation.levelId)}
                  </Badge>
                  {oralOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Student Feedback (ratings + notes - what student sees) */}
                  <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-100/60 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        {t("admin.clientProfile.placement.studentFeedback")}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        {(["grammar", "speaking", "listening", "pronunciation", "confidence"] as const).map((skill) => (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-xs font-medium capitalize">{t(`admin.clientProfile.placement.ratings.${skill}`)}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    star <= evaluation.internalFeedback.ratings[skill]
                                      ? "text-emerald-500 fill-emerald-500"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {evaluation.internalFeedback.notes && (
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{t("admin.clientProfile.placement.studentNotes")}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{evaluation.internalFeedback.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Internal Feedback (summary + strengths + improvements - staff only) */}
                  <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-100/60 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        {t("admin.clientProfile.placement.internalFeedback")}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm leading-relaxed">{evaluation.studentFeedback.summary}</p>
                      {evaluation.studentFeedback.strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">{t("admin.clientProfile.placement.strengths")}</p>
                          <div className="flex flex-wrap gap-1">
                            {evaluation.studentFeedback.strengths.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {evaluation.studentFeedback.improvementAreas.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">{t("admin.clientProfile.placement.improvementAreas")}</p>
                          <div className="flex flex-wrap gap-1">
                            {evaluation.studentFeedback.improvementAreas.map((a) => (
                              <Badge key={a} variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">{a}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* No evaluation yet */}
        {session.status !== "cancelled" && !evaluation && (
          <div className="text-center py-3 text-muted-foreground text-sm">
            <MessageSquare className="h-6 w-6 mx-auto mb-1 opacity-40" />
            {t("admin.clientProfile.placement.evaluationPending")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlacementTab;
