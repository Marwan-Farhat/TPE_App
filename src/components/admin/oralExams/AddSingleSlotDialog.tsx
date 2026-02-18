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
import { oralTestTypeService } from "@/services/oralTestTypeService";
import { examSlotService } from "@/services/examSlotService";
import { useToast } from "@/hooks/use-toast";
import useLanguage from "@/hooks/useLanguage";
import { format } from "date-fns";
import mockUsersData from "@/data/mockUsers.json";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onSave: () => void;
  initialValues?: {
    groupId: string;
    teacherId: string;
    oralTestTypeId: string;
    date: string;
    startTime: string;
  } | null;
}

const AddSingleSlotDialog = ({ open, onOpenChange, selectedDate, onSave, initialValues = null }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  const [teacherId, setTeacherId] = useState("");
  const [oralTestTypeId, setOralTestTypeId] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const tKey = (key: string) => t(`admin.oralExams.examSlots.${key}`);

  const teachers = mockUsersData.staff.filter(
    (u) => u.role === "PlacementTester" && u.isActive
  );

  const testTypes = oralTestTypeService.getActive();
  const dateStr = initialValues?.date ?? format(selectedDate, "yyyy-MM-dd");
  const dateLabel = slotDate
    ? format(new Date(`${slotDate}T00:00:00`), "EEEE, MMMM d")
    : format(new Date(`${dateStr}T00:00:00`), "EEEE, MMMM d");
  const isEditMode = !!initialValues;

  useEffect(() => {
    if (open) {
      setTeacherId(initialValues?.teacherId ?? "");
      setOralTestTypeId(initialValues?.oralTestTypeId ?? "");
      setSlotDate(initialValues?.date ?? dateStr);
      setStartTime(initialValues?.startTime ?? "");
    }
  }, [open, initialValues, dateStr]);

  const handleSubmit = () => {
    if (!teacherId || !oralTestTypeId || !startTime || !slotDate) {
      toast({ title: tKey("validation.fillRequired"), variant: "destructive" });
      return;
    }

    const teacher = teachers.find((t) => t.id === teacherId);
    const selectedSlotDate = slotDate || dateStr;

    const result = isEditMode && initialValues
      ? examSlotService.updateSingleGroup(
          initialValues.groupId,
          { teacherId, oralTestTypeId, startTime },
          selectedSlotDate,
          teacher?.fullName || "",
        )
      : examSlotService.createSingle(
          { teacherId, oralTestTypeId, startTime },
          selectedSlotDate,
          teacher?.fullName || "",
        );

    if (!result.success) {
      if (result.error === "overlap") {
        toast({ title: tKey("validation.teacherOverlap"), variant: "destructive" });
      } else if (result.error === "past_date") {
        toast({ title: tKey("validation.pastDate"), variant: "destructive" });
      } else {
        toast({ title: tKey("validation.fillRequired"), variant: "destructive" });
      }
      return;
    }

    toast({ title: isEditMode ? tKey("updateSuccess") : tKey("createSuccess") });
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? tKey("editSingleSlot") : tKey("addSlotFor")} {dateLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{tKey("fields.startDate")} *</Label>
            <Input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            />
          </div>

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

          {/* Start Time */}
          <div className="space-y-2">
            <Label>{tKey("fields.time")} *</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tKey("cancel")}
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            {isEditMode ? tKey("save") : tKey("assign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSingleSlotDialog;
