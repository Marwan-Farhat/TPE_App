import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays, startOfWeek, endOfWeek, isToday, isBefore, startOfDay, parse } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, Briefcase, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { examSlotService } from "@/services/examSlotService";
import { oralTestTypeService } from "@/services/oralTestTypeService";
import { ExamSlot } from "@/types/examSlot";
import useLanguage from "@/hooks/useLanguage";
import mockUsersData from "@/data/mockUsers.json";

type ViewMode = "day" | "week";

const formatTimeTo12h = (time24: string): string => {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const DEFAULT_START_HOUR = 12;
const DEFAULT_END_HOUR = 24; // 12 AM next day

const OralExamScheduler = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const locale = currentLanguage === "ar" ? ar : enUS;
  const tKey = (key: string) => t(`admin.dashboard.scheduler.${key}`);

  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterTestType, setFilterTestType] = useState("all");
  const [slots, setSlots] = useState<ExamSlot[]>([]);

  const teachers = useMemo(
    () => mockUsersData.staff.filter((u) => u.role === "PlacementTester" && u.isActive),
    []
  );
  const testTypes = useMemo(() => oralTestTypeService.getActive(), []);

  const loadSlots = useCallback(() => {
    setSlots(examSlotService.getAll());
  }, []);

  useEffect(() => {
    loadSlots();
    const interval = setInterval(loadSlots, 3000);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "proenglish_exam_slots") loadSlots();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadSlots]);

  // Date range for current view
  const dateRange = useMemo(() => {
    // If custom date range is set, use it
    if (dateRangeStart && dateRangeEnd) {
      const days: Date[] = [];
      let current = new Date(dateRangeStart);
      while (current <= dateRangeEnd) {
        days.push(new Date(current));
        current = addDays(current, 1);
      }
      return days;
    }
    if (viewMode === "day") return [selectedDate];
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [viewMode, selectedDate, dateRangeStart, dateRangeEnd]);

  const dateStrings = useMemo(() => dateRange.map((d) => format(d, "yyyy-MM-dd")), [dateRange]);

  // Filter slots for date range
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (!dateStrings.includes(slot.date)) return false;
      if (filterTeacher !== "all" && slot.teacherId !== filterTeacher) return false;
      if (filterTestType !== "all" && slot.oralTestTypeId !== filterTestType) return false;
      return true;
    });
  }, [slots, dateStrings, filterTeacher, filterTestType]);

  // Get unique teachers with slots in the range
  const activeTeachers = useMemo(() => {
    const teacherIds = new Set(filteredSlots.map((s) => s.teacherId));
    return teachers.filter((t) => teacherIds.has(t.id));
  }, [filteredSlots, teachers]);

  // Compute break slots from bulk time ranges
  const breakSlots = useMemo(() => {
    const breaks: { teacherId: string; date: string; startTime: string; endTime: string }[] = [];
    const seen = new Set<string>();
    for (const slot of filteredSlots) {
      if (slot.creationType !== "bulk" || !slot.bulkTimeRanges) continue;
      const key = `${slot.teacherId}-${slot.date}-${slot.groupId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      for (const range of slot.bulkTimeRanges) {
        if (range.slotType === "break") {
          breaks.push({
            teacherId: slot.teacherId,
            date: slot.date,
            startTime: range.startTime,
            endTime: range.endTime,
          });
        }
      }
    }
    return breaks;
  }, [filteredSlots]);

  // Dynamic time range based on slots
  const timeRange = useMemo(() => {
    let minHour = DEFAULT_START_HOUR;
    let maxHour = DEFAULT_END_HOUR;
    for (const slot of filteredSlots) {
      const sh = parseInt(slot.startTime.split(":")[0]);
      const eh = parseInt(slot.endTime.split(":")[0]);
      if (sh < minHour) minHour = sh;
      if (eh >= maxHour) maxHour = eh + 1;
    }
    for (const brk of breakSlots) {
      const sh = parseInt(brk.startTime.split(":")[0]);
      const eh = parseInt(brk.endTime.split(":")[0]);
      if (sh < minHour) minHour = sh;
      if (eh >= maxHour) maxHour = eh + 1;
    }
    maxHour = Math.min(maxHour, 25); // cap at 1 AM next day
    const hours = Array.from({ length: maxHour - minHour }, (_, i) => i + minHour);
    return { minHour, maxHour, hours };
  }, [filteredSlots, breakSlots]);

  // Summary stats
  const stats = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todaySlots = slots.filter((s) => s.date === todayStr);
    const totalActive = filteredSlots.length;
    const totalHours = filteredSlots.reduce((acc, s) => {
      const start = parse(s.startTime, "HH:mm", new Date()).getTime();
      const end = parse(s.endTime, "HH:mm", new Date()).getTime();
      return acc + (end - start) / (1000 * 60 * 60);
    }, 0);
    const totalBreakHours = breakSlots.reduce((acc, b) => {
      const start = parse(b.startTime, "HH:mm", new Date()).getTime();
      const end = parse(b.endTime, "HH:mm", new Date()).getTime();
      return acc + (end - start) / (1000 * 60 * 60);
    }, 0);
    const teachersToday = new Set(todaySlots.map((s) => s.teacherId)).size;
    return { totalActive, totalHours: totalHours.toFixed(1), totalBreakHours: totalBreakHours.toFixed(1), teachersToday };
  }, [filteredSlots, slots, breakSlots]);

  const navigateDate = (dir: number) => {
    setDateRangeStart(undefined);
    setDateRangeEnd(undefined);
    const days = viewMode === "week" ? 7 : 1;
    setSelectedDate(addDays(selectedDate, dir * days));
  };

  const HOUR_COL_WIDTH = 120; // px per hour column

  const getSlotPosition = (startTime: string, endTime: string) => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMin = (sh - timeRange.minHour) * 60 + sm;
    const endMin = (eh - timeRange.minHour) * 60 + em;
    const pxPerMin = HOUR_COL_WIDTH / 60;
    const left = startMin * pxPerMin;
    const width = Math.max((endMin - startMin) * pxPerMin, 2);
    return { left: `${left}px`, width: `${width}px` };
  };

  const isPastSlot = (date: string, endTime: string) => {
    const slotDate = new Date(`${date}T00:00:00`);
    if (isBefore(slotDate, startOfDay(new Date())) && !isToday(slotDate)) return true;
    if (!isToday(slotDate)) return false;
    const now = new Date();
    const [h, m] = endTime.split(":").map(Number);
    const slotEnd = new Date();
    slotEnd.setHours(h, m, 0, 0);
    return isBefore(slotEnd, now);
  };

  const dateLabel = useMemo(() => {
    if (dateRangeStart && dateRangeEnd) {
      return `${format(dateRangeStart, "MMM d", { locale })} - ${format(dateRangeEnd, "MMM d, yyyy", { locale })}`;
    }
    if (viewMode === "day") {
      return format(selectedDate, "EEEE, MMMM d, yyyy", { locale });
    }
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return `${format(start, "MMM d", { locale })} - ${format(end, "MMM d, yyyy", { locale })}`;
  }, [viewMode, selectedDate, locale, dateRangeStart, dateRangeEnd]);

  // Date range picker state
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [rangePickerStep, setRangePickerStep] = useState<"start" | "end">("start");
  const [tempRangeStart, setTempRangeStart] = useState<Date | undefined>(undefined);

  const handleRangeSelect = (d: Date | undefined) => {
    if (!d) return;
    if (rangePickerStep === "start") {
      setTempRangeStart(d);
      setRangePickerStep("end");
    } else {
      const start = tempRangeStart!;
      const end = d;
      if (isBefore(end, start)) {
        setDateRangeStart(end);
        setDateRangeEnd(start);
      } else {
        setDateRangeStart(start);
        setDateRangeEnd(end);
      }
      setRangePickerStep("start");
      setTempRangeStart(undefined);
      setDateRangePickerOpen(false);
    }
  };

  // Build rows for the timeline
  const timelineRows = useMemo(() => {
    if (viewMode === "day") {
      return activeTeachers.map((teacher, idx) => ({
        key: teacher.id,
        label: teacher.fullName,
        index: idx + 1,
        dateLabel: undefined as string | undefined,
        workSlots: filteredSlots.filter((s) => s.teacherId === teacher.id && s.date === dateStrings[0]),
        breakSlots: breakSlots.filter((b) => b.teacherId === teacher.id && b.date === dateStrings[0]),
        dateStr: dateStrings[0],
      }));
    }
    // Week/range view: grouped by date then teacher
    const rows: {
      key: string; label: string; index: number; dateLabel?: string;
      workSlots: ExamSlot[]; breakSlots: typeof breakSlots; dateStr: string;
    }[] = [];
    let rowIndex = 1;
    for (const date of dateRange) {
      const dateStr = format(date, "yyyy-MM-dd");
      const daySlots = filteredSlots.filter((s) => s.date === dateStr);
      const dayBreaks = breakSlots.filter((b) => b.date === dateStr);
      const dayTeacherIds = [...new Set(daySlots.map((s) => s.teacherId))];
      const dayTeachers = teachers.filter((t) => dayTeacherIds.includes(t.id));
      if (dayTeachers.length === 0) continue;
      for (let tIdx = 0; tIdx < dayTeachers.length; tIdx++) {
        const teacher = dayTeachers[tIdx];
        rows.push({
          key: `${dateStr}-${teacher.id}`,
          label: teacher.fullName,
          index: rowIndex++,
          dateLabel: tIdx === 0 ? format(date, "EEE, MMM d", { locale }) : undefined,
          workSlots: daySlots.filter((s) => s.teacherId === teacher.id),
          breakSlots: dayBreaks.filter((b) => b.teacherId === teacher.id),
          dateStr,
        });
      }
    }
    return rows;
  }, [viewMode, activeTeachers, filteredSlots, breakSlots, dateStrings, dateRange, teachers, locale]);

  return (
    <Card className="overflow-hidden max-w-full">
      <CardHeader className="bg-admin-section-alt border-b border-admin-border-light pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {tKey("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 overflow-hidden">
        {/* Summary Cards Row */}
        <div className="flex flex-wrap gap-3">
          <SummaryCard icon={<Briefcase className="h-4 w-4" />} label={tKey("totalActiveSlots")} value={stats.totalActive} colorClass="bg-primary/10 text-primary" />
          <SummaryCard icon={<Clock className="h-4 w-4" />} label={tKey("totalHours")} value={stats.totalHours} colorClass="bg-success/10 text-success" />
          <SummaryCard icon={<Coffee className="h-4 w-4" />} label={tKey("totalBreakHours")} value={stats.totalBreakHours} colorClass="bg-warning/10 text-warning" />
          <SummaryCard icon={<Users className="h-4 w-4" />} label={tKey("teachersScheduledToday")} value={stats.teachersToday} colorClass="bg-info/10 text-info" />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-3 border border-border rounded-xl p-3 bg-admin-section-alt">
          {/* View Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => { setViewMode("day"); setDateRangeStart(undefined); setDateRangeEnd(undefined); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "day" && !dateRangeStart ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {tKey("dayView")}
            </button>
            <button
              onClick={() => { setViewMode("week"); setDateRangeStart(undefined); setDateRangeEnd(undefined); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "week" && !dateRangeStart ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {tKey("weekView")}
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-success" />
              {tKey("workSlot")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-warning" />
              {tKey("breakSlot")}
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 ms-auto flex-wrap">
            <span className="text-xs text-muted-foreground">{tKey("teacher")}:</span>
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[100]">
                <SelectItem value="all">{tKey("allTeachers")}</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground">{tKey("oralTestType")}:</span>
            <Select value={filterTestType} onValueChange={setFilterTestType}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[100]">
                <SelectItem value="all">{tKey("allTestTypes")}</SelectItem>
                {testTypes.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id}>{tt.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <Popover open={dateRangePickerOpen} onOpenChange={setDateRangePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setRangePickerStep("start"); setTempRangeStart(undefined); }}>
                  <CalendarIcon className="h-3.5 w-3.5 me-1.5" />
                  {dateRangeStart && dateRangeEnd
                    ? `${format(dateRangeStart, "MMM d")} - ${format(dateRangeEnd, "MMM d, yyyy")}`
                    : tKey("dateRange")
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 bg-popover z-[100]" align="end">
                <p className="text-xs text-muted-foreground mb-2">
                  {rangePickerStep === "start" ? tKey("selectStartDate") : tKey("selectEndDate")}
                </p>
                <Calendar
                  mode="single"
                  selected={rangePickerStep === "start" ? dateRangeStart : dateRangeEnd}
                  onSelect={handleRangeSelect}
                />
                {dateRangeStart && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => {
                    setDateRangeStart(undefined);
                    setDateRangeEnd(undefined);
                    setDateRangePickerOpen(false);
                  }}>
                    {tKey("clearRange")}
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigateDate(isRTL ? 1 : -1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-sm font-medium">
                  <CalendarIcon className="h-4 w-4 me-2" />
                  {dateLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-[100]" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => { if (d) { setSelectedDate(d); setDateRangeStart(undefined); setDateRangeEnd(undefined); } }}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={() => { setSelectedDate(new Date()); setDateRangeStart(undefined); setDateRangeEnd(undefined); }}>
              {tKey("today")}
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateDate(isRTL ? -1 : 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {viewMode === "week" || (dateRangeStart && dateRangeEnd) ? tKey("weeklyView") : tKey("dailyView")}
          </h3>
          <span className="text-xs text-muted-foreground">{isRTL ? "يمين←يسار" : "Dist/b"}</span>
        </div>

        {/* Timeline Grid */}
        <div className="border border-border rounded-xl overflow-x-auto">
          {/* Time Header */}
          <div className="flex border-b border-border bg-admin-section-alt" style={{ minWidth: `${260 + timeRange.hours.length * 120}px` }}>
            <div className="w-[120px] min-w-[120px] border-e border-border p-2 text-[10px] font-semibold text-muted-foreground text-center">
              {tKey("date") || "Date"}
            </div>
            <div className="w-[140px] min-w-[140px] border-e border-border p-2 text-[10px] font-semibold text-muted-foreground text-center">
              {tKey("teacher")}
            </div>
            <div style={{ width: `${timeRange.hours.length * HOUR_COL_WIDTH}px`, minWidth: `${timeRange.hours.length * HOUR_COL_WIDTH}px` }}>
              <div className="flex">
                {timeRange.hours.map((hour) => (
                  <div
                    key={hour}
                    className="text-center text-[10px] text-muted-foreground py-2 border-e border-border last:border-e-0"
                    style={{ width: 120, minWidth: 120 }}
                  >
                    {hour >= 24 ? `${hour - 24 === 0 ? 12 : hour - 24}:00 AM` : formatTimeTo12h(`${hour.toString().padStart(2, "0")}:00`)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {timelineRows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm" style={{ minWidth: `${260 + timeRange.hours.length * 120}px` }}>
              {tKey("noSlots")}
            </div>
          ) : (
            timelineRows.map((row, idx) => (
              <div
                key={row.key}
                className={`flex border-b border-border last:border-b-0 ${
                  idx % 2 === 0 ? "bg-card" : "bg-admin-section-alt/50"
                }`}
                style={{ minWidth: `${260 + timeRange.hours.length * 120}px` }}
              >
                {/* Date column */}
                <div className="w-[120px] min-w-[120px] border-e border-border p-2 flex items-center justify-center">
                  <span className="text-[11px] font-medium text-muted-foreground text-center">
                    {viewMode === "day"
                      ? format(selectedDate, "EEE, MMM d", { locale })
                      : row.dateLabel || ""}
                  </span>
                </div>
                {/* Teacher column */}
                <div className="w-[140px] min-w-[140px] border-e border-border p-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{row.index}</span>
                  <span className="text-xs font-semibold text-foreground truncate">{row.label}</span>
                </div>
                {/* Timeline area */}
                <div className="relative h-14" style={{ width: `${timeRange.hours.length * HOUR_COL_WIDTH}px`, minWidth: `${timeRange.hours.length * HOUR_COL_WIDTH}px` }}>
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {timeRange.hours.map((h) => (
                      <div key={h} className="border-e border-border/20 last:border-e-0" style={{ width: 120, minWidth: 120 }} />
                    ))}
                  </div>

                  <TooltipProvider delayDuration={200}>
                    {/* Break slots (yellow) */}
                    {row.breakSlots.map((brk, bIdx) => {
                      const pos = getSlotPosition(brk.startTime, brk.endTime);
                      const past = isPastSlot(row.dateStr, brk.endTime);
                      return (
                        <Tooltip key={`break-${bIdx}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute top-1.5 bottom-1.5 rounded-md px-1.5 flex items-center cursor-default text-[10px] font-semibold border border-warning/40 bg-warning/20 text-warning ${
                                past ? "opacity-40" : "opacity-100"
                              }`}
                              style={{ left: pos.left, width: pos.width, zIndex: 5 }}
                            >
                              <span className="truncate">{tKey("breakSlot")}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            <p className="font-semibold">{tKey("breakSlot")}</p>
                            <p>{formatTimeTo12h(brk.startTime)} – {formatTimeTo12h(brk.endTime)}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}

                    {/* Work slots (green) */}
                    {row.workSlots.map((slot) => {
                      const pos = getSlotPosition(slot.startTime, slot.endTime);
                      const past = isPastSlot(slot.date, slot.endTime);
                      return (
                        <Tooltip key={slot.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute top-1.5 bottom-1.5 rounded-md px-1.5 flex flex-col justify-center cursor-pointer transition-all text-[10px] leading-tight overflow-hidden border border-success/40 bg-success/20 text-success hover:bg-success/30 ${
                                past ? "opacity-40" : "opacity-100"
                              }`}
                              style={{ left: pos.left, width: pos.width, zIndex: 10 }}
                            >
                              <span className="font-semibold truncate">{slot.oralTestTypeName}</span>
                              <span className="truncate">{formatTimeTo12h(slot.startTime)} – {formatTimeTo12h(slot.endTime)}</span>
                              {past && (
                                <Badge variant="secondary" className="absolute top-0.5 end-0.5 text-[7px] px-1 py-0">{tKey("past")}</Badge>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs max-w-[240px] space-y-1">
                            <p className="font-bold text-sm">{slot.oralTestTypeName}</p>
                            <p>{formatTimeTo12h(slot.startTime)} – {formatTimeTo12h(slot.endTime)}</p>
                            <div className="border-t border-border pt-1 mt-1 space-y-0.5">
                              <p>{tKey("teacher")}: {slot.teacherName}</p>
                              <p>{tKey("oralTestType")}: {slot.oralTestTypeName}</p>
                              <p>{tKey("duration")}: {slot.duration} {tKey("minutes")}</p>
                              <p>{tKey("creationType")}: {slot.creationType === "bulk" ? tKey("bulkGenerated") : tKey("singleCreated")}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Summary card sub-component
const SummaryCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: string | number; colorClass: string }) => (
  <div className="flex-1 min-w-[140px] admin-section-nested p-3 rounded-xl flex items-center gap-3 border border-admin-border-light">
    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  </div>
);

export default OralExamScheduler;
