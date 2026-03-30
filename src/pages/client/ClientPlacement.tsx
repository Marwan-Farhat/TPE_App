import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FileCheck, BookOpen, Star, CheckCircle, XCircle, Award, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { sessionService } from "@/services/sessionService";
import { courseService } from "@/services/courseService";
import { levelService } from "@/services/levelService";
import { Session } from "@/types/session";
import { Evaluation, Course, Level } from "@/types/evaluation";

const ClientPlacement: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Get student sessions & evaluations
  const studentId = user?.role === "Client" ? "client-001" : "";
  // Match by mock user email
  const allSessions = sessionService.getAllSessions();
  const sessions = allSessions.filter(
    (s) => s.studentEmail === user?.email || s.studentId === studentId
  );

  const courses = courseService.getAll();
  const levels = levelService.getAll();

  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.nameEn || id;
  const getLevelName = (id: string) => levels.find((l) => l.id === id)?.nameEn || id;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            {t("client.placement.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("client.placement.subtitle")}</p>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">{t("client.placement.noSessions")}</p>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </motion.div>
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
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {session.oralTestTypeName}
          </CardTitle>
          <Badge
            variant={session.status === "completed" ? "default" : session.status === "cancelled" ? "destructive" : "secondary"}
          >
            {t(`client.placement.status.${session.status}`)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {session.date} • {session.startTime} - {session.endTime}
        </p>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Written Test */}
        {session.writtenTestResult && (
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
              {t("client.placement.writtenTest")}
            </h3>
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{session.writtenTestResult.quizTitle}</span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {session.writtenTestResult.totalScore}/{session.writtenTestResult.maxScore}
                </span>
              </div>
              <Progress
                value={(session.writtenTestResult.totalScore / session.writtenTestResult.maxScore) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round((session.writtenTestResult.totalScore / session.writtenTestResult.maxScore) * 100)}% {t("client.placement.score")}
              </p>
            </div>
          </div>
        )}

        {/* Evaluation / Oral Feedback - only student-visible parts */}
        {evaluation && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                {t("client.placement.oralFeedback")}
              </h3>

              {/* Course & Level badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="gap-1.5 text-sm py-1 px-3">
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("client.placement.course")}: {getCourseName(evaluation.courseId)}
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-sm py-1 px-3">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t("client.placement.level")}: {getLevelName(evaluation.levelId)}
                </Badge>
              </div>

              {/* Summary */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-4">
                <p className="text-sm leading-relaxed">{evaluation.studentFeedback.summary}</p>

                {/* Strengths */}
                {evaluation.studentFeedback.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t("client.placement.strengths")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.studentFeedback.strengths.map((s) => (
                        <Badge key={s} variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Areas */}
                {evaluation.studentFeedback.improvementAreas.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t("client.placement.improvementAreas")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.studentFeedback.improvementAreas.map((a) => (
                        <Badge key={a} variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* If session completed but no evaluation yet */}
        {session.status === "completed" && !evaluation && (
          <>
            <Separator />
            <div className="text-center py-4 text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
              {t("client.placement.evaluationPending")}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientPlacement;
