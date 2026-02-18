import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AddSingleSlotDialog from "@/components/admin/oralExams/AddSingleSlotDialog";
import BulkAddSlotsDialog from "@/components/admin/oralExams/BulkAddSlotsDialog";
import { ExamSlot } from "@/types/examSlot";
import { examSlotService } from "@/services/examSlotService";
import { useToast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";
import { formatTimeTo12h } from "@/services/timeSlotValidation";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ar } from "date-fns/locale";

const ExamSlotsList = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [datesWithSlots, setDatesWithSlots] = useState<string[]>([]);
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [deleteTeacherInfo, setDeleteTeacherInfo] = useState<{ teacherId: string; date: string } | null>(null);

  const tKey = (key: string) => t(`admin.oralExams.examSlots.${key}`);
  const locale = i18n.language === "ar" ? ar : undefined;

  const reload = () => {
    setDatesWithSlots(examSlotService.getDatesWithSlots());
    if (selectedDate) {
      setSlots(examSlotService.getByDate(format(selectedDate, "yyyy-MM-dd")));
    }
  };

  useEffect(() => reload(), [selectedDate]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    const days = [
      t("admin.coordination.timeSlots.days.sunday"),
      t("admin.coordination.timeSlots.days.monday"),
      t("admin.coordination.timeSlots.days.tuesday"),
      t("admin.coordination.timeSlots.days.wednesday"),
      t("admin.coordination.timeSlots.days.thursday"),
      t("admin.coordination.timeSlots.days.friday"),
      t("admin.coordination.timeSlots.days.saturday"),
    ];
    return days;
  }, [t]);

  // Group slots by teacher
  const slotsByTeacher = useMemo(() => {
    const grouped: Record<string, { teacherName: string; teacherId: string; slots: ExamSlot[] }> = {};
    for (const slot of slots) {
      if (!grouped[slot.teacherId]) {
        grouped[slot.teacherId] = { teacherName: slot.teacherName, teacherId: slot.teacherId, slots: [] };
      }
      grouped[slot.teacherId].slots.push(slot);
    }
    // Sort slots within each teacher by start time
    Object.values(grouped).forEach((g) => g.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return Object.values(grouped);
  }, [slots]);

  const toggleTeacher = (teacherId: string) => {
    setExpandedTeachers((prev) => {
      const next = new Set(prev);
      if (next.has(teacherId)) next.delete(teacherId);
      else next.add(teacherId);
      return next;
    });
  };

  const handleDeleteSlot = () => {
    if (!deleteSlotId) return;
    examSlotService.remove(deleteSlotId);
    toast({ title: tKey("deleteSuccess") });
    setDeleteSlotId(null);
    reload();
  };

  const handleDeleteAllForTeacher = () => {
    if (!deleteTeacherInfo) return;
    const count = examSlotService.removeByTeacherAndDate(deleteTeacherInfo.teacherId, deleteTeacherInfo.date);
    toast({ title: `${tKey("deleteAllSuccess")} (${count})` });
    setDeleteTeacherInfo(null);
    reload();
  };

  const hasSlots = (date: Date) => datesWithSlots.includes(format(date, "yyyy-MM-dd"));

  return (
    <div className="flex min-h-screen bg-admin-bg" dir={isRTL ? "rtl" : "ltr"}>
      <AdminSidebar />
      <main className={cn("flex-1 p-6", isRTL ? "mr-16" : "ml-16")}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{tKey("title")}</h1>
              <p className="text-muted-foreground">{tKey("subtitle")}</p>
            </div>
            <Button onClick={() => setShowBulkAdd(true)} className="gradient-primary text-white gap-2">
              <Layers className="h-4 w-4" />
              {tKey("bulkAddSlots")}
            </Button>
          </div>

          {/* Banner */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{tKey("bannerTitle")}</h2>
              <p className="text-sm opacity-90">{tKey("bannerSubtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
              <span className="font-semibold min-w-[180px] text-center">
                {format(currentMonth, "MMMM yyyy", { locale })}
              </span>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-background rounded-lg border shadow-sm p-6">
              {/* Week day headers */}
              <div className="grid grid-cols-7 mb-3 border-b pb-3">
                {weekDays.map((day, i) => (
                  <div key={i} className="text-center text-sm font-semibold text-muted-foreground">
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const dayHasSlots = hasSlots(day);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-xl transition-all text-sm relative p-2",
                        !isCurrentMonth && "text-muted-foreground/30",
                        isCurrentMonth && !isSelected && !dayHasSlots && "hover:bg-muted",
                        isSelected && !dayHasSlots && "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold text-primary",
                        isSelected && dayHasSlots && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 font-bold text-primary",
                        !isSelected && dayHasSlots && isCurrentMonth && "bg-emerald-50 dark:bg-emerald-950/30 border border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 font-semibold",
                        !isSelected && isTodayDate && !dayHasSlots && "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold text-primary"
                      )}
                    >
                      <span className="text-sm">{format(day, "d")}</span>
                      {dayHasSlots && isCurrentMonth && (
                        <span className={cn(
                          "absolute bottom-1.5 h-2 w-2 rounded-full",
                          isSelected ? "bg-primary" : "bg-emerald-500"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-md ring-2 ring-primary ring-offset-1 ring-offset-background" />
                  <span className="text-xs text-muted-foreground">{tKey("legend.today")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-md bg-emerald-50 border border-dashed border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700" />
                  <span className="text-xs text-muted-foreground">{tKey("legend.hasSlots")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-md ring-2 ring-primary ring-offset-1 ring-offset-background bg-emerald-50 border border-emerald-300" />
                  <span className="text-xs text-muted-foreground">{tKey("legend.selected")}</span>
                </div>
              </div>
            </div>

            {/* Day Detail Panel */}
            <div className="bg-background rounded-lg border shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">
                    {format(selectedDate, "EEEE, MMMM d", { locale })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {slots.length} {tKey("examSlotsCount")}
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowAddSingle(true)} className="gradient-primary text-white gap-1">
                  <Plus className="h-4 w-4" />
                  {tKey("addSlot")}
                </Button>
              </div>

              {slotsByTeacher.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {tKey("noSlotsForDay")}
                </div>
              ) : (
                <div className="space-y-3">
                  {slotsByTeacher.map((group) => {
                    const isExpanded = expandedTeachers.has(group.teacherId);
                    return (
                      <div key={group.teacherId} className="border rounded-lg overflow-hidden">
                        {/* Teacher header */}
                        <div className="flex items-center justify-between p-3 bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {group.teacherName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{group.teacherName}</p>
                              <p className="text-xs text-muted-foreground">
                                {group.slots.length} {tKey("slotsCount")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive text-xs gap-1 h-7"
                              onClick={() => setDeleteTeacherInfo({ teacherId: group.teacherId, date: format(selectedDate, "yyyy-MM-dd") })}
                            >
                              <Trash2 className="h-3 w-3" />
                              {tKey("deleteAll")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleTeacher(group.teacherId)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Slots */}
                        {isExpanded && (
                          <div className="p-2 space-y-2">
                            {group.slots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                              >
                                <div className="space-y-1">
                                  <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                                    {formatTimeTo12h(slot.startTime)} - {formatTimeTo12h(slot.endTime)}
                                    <span className="ms-2 text-xs font-normal text-muted-foreground">
                                      {slot.duration}{t("admin.testingCenter.quizzes.minutes")}
                                    </span>
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                      {slot.oralTestTypeName}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700">
                                      {tKey(`status.${slot.status}`)}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteSlotId(slot.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <AddSingleSlotDialog
          open={showAddSingle}
          onOpenChange={setShowAddSingle}
          selectedDate={selectedDate}
          onSave={reload}
        />
        <BulkAddSlotsDialog
          open={showBulkAdd}
          onOpenChange={setShowBulkAdd}
          onSave={reload}
        />

        {/* Delete single slot */}
        <AlertDialog open={!!deleteSlotId} onOpenChange={() => setDeleteSlotId(null)}>
          <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
            <AlertDialogHeader>
              <AlertDialogTitle>{tKey("deleteSlotConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>{tKey("deleteSlotMessage")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tKey("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSlot} className="bg-destructive text-destructive-foreground">
                {tKey("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete all for teacher */}
        <AlertDialog open={!!deleteTeacherInfo} onOpenChange={() => setDeleteTeacherInfo(null)}>
          <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
            <AlertDialogHeader>
              <AlertDialogTitle>{tKey("deleteAllConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>{tKey("deleteAllMessage")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tKey("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAllForTeacher} className="bg-destructive text-destructive-foreground">
                {tKey("deleteAll")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default ExamSlotsList;
