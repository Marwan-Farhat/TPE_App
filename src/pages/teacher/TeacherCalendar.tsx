import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Coffee } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { examSlotService } from "@/services/examSlotService";
import TeacherLayout from "@/components/teacher/TeacherLayout";

const TeacherCalendar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const allSlots = examSlotService.getAll();
  const mySlots = allSlots.filter(s => s.teacherId === user?.id);

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const slotsForDate = selectedDate
    ? mySlots.filter(s => isSameDay(parseISO(s.date), selectedDate))
    : [];

  const datesWithSlots = new Set(mySlots.map(s => s.date));

  const firstDayOffset = startOfMonth(currentMonth).getDay();

  return (
    <TeacherLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-emerald-600" />
          {t("teacher.calendar.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                ←
              </Button>
              <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
              <Button variant="ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                →
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="py-2 font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {monthDays.map(day => {
                const dateStr = format(day, "yyyy-MM-dd");
                const hasSlots = datesWithSlots.has(dateStr);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2 rounded-lg text-sm transition-all relative ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : today
                        ? "bg-primary/10 text-primary font-bold"
                        : hasSlots
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-foreground border border-dashed border-emerald-300 dark:border-emerald-700"
                        : "hover:bg-secondary/50 text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                    {hasSlots && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate ? format(selectedDate, "EEEE, MMM dd, yyyy") : t("teacher.calendar.selectDay")}
            </h3>

            {slotsForDate.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("teacher.calendar.noSlots")}
              </p>
            ) : (
              <div className="space-y-2">
                {slotsForDate
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(slot => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-lg border ${
                        slot.status === "reserved"
                          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                          : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{slot.oralTestTypeName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                        slot.status === "reserved"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}>
                        {slot.status === "reserved" ? t("teacher.calendar.reserved") : t("teacher.calendar.available")}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </TeacherLayout>
  );
};

export default TeacherCalendar;
