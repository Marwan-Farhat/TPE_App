import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { oralTestTypeService } from "@/services/oralTestTypeService";
import { examSlotService } from "@/services/examSlotService";
import { TimeRange } from "@/types/examSlot";
import { useToast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";
import { format } from "date-fns";
import mockUsersData from "@/data/mockUsers.json";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  initialValues?: {
    groupId: string;
    teacherId: string;
    oralTestTypeId: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    timeRanges: TimeRange[];
  } | null;
}

const DAYS_OF_WEEK = [
  { value: 0, labelKey: "sunday" },
  { value: 1, labelKey: "monday" },
  { value: 2, labelKey: "tuesday" },
  { value: 3, labelKey: "wednesday" },
  { value: 4, labelKey: "thursday" },
  { value: 5, labelKey: "friday" },
  { value: 6, labelKey: "saturday" },
];

const BulkAddSlotsDialog = ({ open, onOpenChange, onSave, initialValues = null }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  const [teacherId, setTeacherId] = useState("");
  const [oralTestTypeId, setOralTestTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([
    { id: crypto.randomUUID(), startTime: "", endTime: "", slotType: "work" },
  ]);

  const tKey = (key: string) => t(`admin.oralExams.examSlots.${key}`);
  const isEditMode = !!initialValues;

  const teachers = mockUsersData.staff.filter(
    (u) => u.role === "PlacementTester" && u.isActive
  );
  const testTypes = oralTestTypeService.getActive();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (open) {
      setTeacherId(initialValues?.teacherId ?? "");
      setOralTestTypeId(initialValues?.oralTestTypeId ?? "");
      setStartDate(initialValues?.startDate ?? "");
      setEndDate(initialValues?.endDate ?? "");
      setDaysOfWeek(initialValues?.daysOfWeek ?? []);
      setTimeRanges(
        initialValues?.timeRanges?.length
          ? initialValues.timeRanges
          : [{ id: crypto.randomUUID(), startTime: "", endTime: "", slotType: "work" }],
      );
    }
  }, [open, initialValues]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const updateTimeRange = (id: string, field: keyof TimeRange, value: string) => {
    setTimeRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addTimeRange = () => {
    setTimeRanges((prev) => [
      ...prev,
      { id: crypto.randomUUID(), startTime: "", endTime: "", slotType: "work" },
    ]);
  };

  const removeTimeRange = (id: string) => {
    setTimeRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = () => {
    if (!teacherId || !oralTestTypeId || !startDate || !endDate || daysOfWeek.length === 0) {
      toast({ title: tKey("validation.fillRequired"), variant: "destructive" });
      return;
    }

    if (startDate < today) {
      toast({ title: tKey("validation.pastDate"), variant: "destructive" });
      return;
    }

    if (endDate < startDate) {
      toast({ title: tKey("validation.endBeforeStart"), variant: "destructive" });
      return;
    }

    // Validate time ranges
    const selectedTestType = oralTestTypeService.getById(oralTestTypeId);
    if (!selectedTestType) return;

    for (const range of timeRanges) {
      if (!range.startTime || !range.endTime) {
        toast({ title: tKey("validation.fillRequired"), variant: "destructive" });
        return;
      }
      if (range.slotType === "work") {
        const validation = examSlotService.validateTimeRange(
          range.startTime,
          range.endTime,
          selectedTestType.duration
        );
        if (!validation.valid) {
          toast({ title: tKey("validation.durationMismatch"), variant: "destructive" });
          return;
        }
      }
    }

    const teacher = teachers.find((t) => t.id === teacherId);
    const payload = { teacherId, oralTestTypeId, startDate, endDate, daysOfWeek, timeRanges };
    const result = isEditMode && initialValues
      ? examSlotService.updateBulkGroup(initialValues.groupId, payload, teacher?.fullName || "")
      : examSlotService.createBulk(payload, teacher?.fullName || "");

    if (result.success) {
      toast({ title: isEditMode ? tKey("updateSuccess") : `${tKey("bulkSuccess")} (${result.created})` });
      onSave();
      onOpenChange(false);
    } else {
      const errorKey = result.errors[0] || "fillRequired";
      toast({ title: tKey(`validation.${errorKey}`), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? tKey("editBulkSlots") : tKey("bulkAddSlots")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Teacher */}
          <div className="space-y-2">
            <Label>{tKey("fields.teacher")} *</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={tKey("fields.teacher")} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[100]">
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Oral Test Type */}
          <div className="space-y-2">
            <Label>{tKey("fields.oralTestType")} *</Label>
            <Select value={oralTestTypeId} onValueChange={setOralTestTypeId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={tKey("fields.oralTestType")} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[100]">
                {testTypes.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id}>
                    {tt.title} ({tt.duration} {t("admin.coordination.timeSlots.minutes")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tKey("fields.startDate")} *</Label>
              <Input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{tKey("fields.endDate")} *</Label>
              <Input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Days of Week */}
          <div className="space-y-2">
            <Label>{tKey("fields.daysOfWeek")} *</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label
                  key={day.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    daysOfWeek.includes(day.value)
                      ? "bg-primary/10 border-primary text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    checked={daysOfWeek.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <span className="text-sm">
                    {t(`admin.coordination.timeSlots.days.${day.labelKey}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{tKey("fields.timeSlots")}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTimeRange} className="gap-1">
                <Plus className="h-3 w-3" />
                {tKey("addTimeSlot")}
              </Button>
            </div>

            {timeRanges.map((range, idx) => (
              <div key={range.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {tKey("timeSlotLabel")} {idx + 1}
                  </span>
                  {timeRanges.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeTimeRange(range.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{tKey("fields.startTime")} *</Label>
                    <Input
                      type="time"
                      value={range.startTime}
                      onChange={(e) => updateTimeRange(range.id, "startTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{tKey("fields.endTime")} *</Label>
                    <Input
                      type="time"
                      value={range.endTime}
                      onChange={(e) => updateTimeRange(range.id, "endTime", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{tKey("fields.slotType")} *</Label>
                  <Select
                    value={range.slotType}
                    onValueChange={(val) => updateTimeRange(range.id, "slotType", val)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[100]">
                      <SelectItem value="work">{tKey("slotTypes.work")}</SelectItem>
                      <SelectItem value="break">{tKey("slotTypes.break")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tKey("cancel")}
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            {isEditMode ? tKey("save") : tKey("bulkAdd")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddSlotsDialog;
