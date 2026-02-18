import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, X, Calendar, Info, Zap } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import useLanguage from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { timeSlotService } from '@/services/timeSlotService';
import {
  TimeSlot,
  TimeSlotFormData,
  SlotType,
  SlotVenue,
  DayOfWeek,
  DAYS_OF_WEEK,
  SLOT_COLORS,
  SlotDaySchedule,
} from '@/types/timeSlot';
import {
  validateTimeSlotForm,
  calculateDuration,
  calculateNumberOfTests,
  formatDuration,
} from '@/services/timeSlotValidation';

interface Props {
  editMode?: boolean;
}

const TimeSlotForm = ({ editMode = false }: Props) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Load existing slot if editing
  const existingSlot = editMode && id ? timeSlotService.getById(id) : null;

  const [formData, setFormData] = useState<TimeSlotFormData>(() => {
    if (existingSlot) {
      return {
        type: existingSlot.type,
        venue: existingSlot.venue,
        label: existingSlot.label,
        color: existingSlot.color,
        days: DAYS_OF_WEEK.map(day => {
          const existing = existingSlot.days.find(d => d.day === day);
          return existing || { day, startTime: '', endTime: '', duration: 0 };
        }),
        selectedDays: existingSlot.days.map(d => d.day),
        singleTestDuration: existingSlot.singleTestDuration || 30,
        placementDay: existingSlot.type === 'oralPlacementTests' && existingSlot.days.length > 0 ? existingSlot.days[0].day : '',
        placementStartTime: existingSlot.type === 'oralPlacementTests' && existingSlot.days.length > 0 ? existingSlot.days[0].startTime : '',
        placementEndTime: existingSlot.type === 'oralPlacementTests' && existingSlot.days.length > 0 ? existingSlot.days[0].endTime : '',
      };
    }
    return {
      type: '',
      venue: '',
      label: '',
      color: SLOT_COLORS[Math.floor(Math.random() * SLOT_COLORS.length)],
      days: DAYS_OF_WEEK.map(day => ({ day, startTime: '', endTime: '', duration: 0 })),
      selectedDays: [],
      singleTestDuration: 30,
      placementDay: '',
      placementStartTime: '',
      placementEndTime: '',
    };
  });

  const validation = useMemo(() => validateTimeSlotForm(formData), [formData]);

  const numberOfTests = useMemo(() => {
    if (formData.type !== 'oralPlacementTests') return 0;
    return calculateNumberOfTests(formData.placementStartTime, formData.placementEndTime, formData.singleTestDuration);
  }, [formData.placementStartTime, formData.placementEndTime, formData.singleTestDuration, formData.type]);

  const handleDayToggle = useCallback((day: DayOfWeek, checked: boolean) => {
    setFormData(prev => {
      const newSelectedDays = checked
        ? [...prev.selectedDays, day]
        : prev.selectedDays.filter(d => d !== day);

      // Copy first day's times to newly selected day (FR-9)
      const newDays = [...prev.days];
      if (checked && prev.selectedDays.length > 0) {
        const firstSelectedDay = prev.days.find(d => prev.selectedDays.includes(d.day) && d.startTime);
        if (firstSelectedDay) {
          const idx = newDays.findIndex(d => d.day === day);
          if (idx !== -1) {
            newDays[idx] = {
              ...newDays[idx],
              startTime: firstSelectedDay.startTime,
              endTime: firstSelectedDay.endTime,
              duration: firstSelectedDay.duration,
            };
          }
        }
      }

      return { ...prev, selectedDays: newSelectedDays, days: newDays };
    });
  }, []);

  const handleDayTimeChange = useCallback((day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => {
      const newDays = prev.days.map(d => {
        if (d.day !== day) return d;
        const updated = { ...d, [field]: value };
        updated.duration = calculateDuration(updated.startTime, updated.endTime);
        return updated;
      });
      return { ...prev, days: newDays };
    });
  }, []);

  const handleSave = () => {
    if (!validation.isValid) return;

    if (formData.type === 'lectures') {
      const selectedDaysData = formData.days
        .filter(d => formData.selectedDays.includes(d.day))
        .map(d => ({ ...d, duration: calculateDuration(d.startTime, d.endTime) }));

      const slotData = {
        type: formData.type as SlotType,
        venue: formData.venue as SlotVenue,
        label: formData.label,
        color: formData.color,
        status: 'active' as const,
        days: selectedDaysData,
      };

      if (editMode && id) {
        timeSlotService.update(id, slotData);
      } else {
        timeSlotService.create(slotData);
      }
    } else {
      const duration = calculateDuration(formData.placementStartTime, formData.placementEndTime);
      const slotData = {
        type: formData.type as SlotType,
        venue: formData.venue as SlotVenue,
        label: formData.label,
        color: formData.color,
        status: 'active' as const,
        days: [{
          day: formData.placementDay as DayOfWeek,
          startTime: formData.placementStartTime,
          endTime: formData.placementEndTime,
          duration,
        }],
        singleTestDuration: formData.singleTestDuration,
        numberOfTests,
      };

      if (editMode && id) {
        timeSlotService.update(id, slotData);
      } else {
        timeSlotService.create(slotData);
      }
    }

    toast({
      title: editMode
        ? t('admin.coordination.timeSlots.messages.updateSuccess')
        : t('admin.coordination.timeSlots.messages.createSuccess'),
    });
    navigate('/admin/coordination/time-slots');
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-admin-bg flex">
      <AdminSidebar />
      <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-admin-border-light shadow-[0_2px_8px_hsl(220_20%_20%/0.08)]">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/coordination/time-slots')}>
                <BackArrow className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">
                {editMode ? t('admin.coordination.timeSlots.editSlot') : t('admin.coordination.timeSlots.addSlot')}
              </h1>
            </div>
          </div>
        </header>

        <main className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left - Basic Info */}
              <Card className="admin-section">
                <CardContent className="p-6 space-y-6">
                  {/* Allocation Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      {t('admin.coordination.timeSlots.form.allocationType')} <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('admin.coordination.timeSlots.form.allocationTypeDesc')}</p>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as SlotType }))}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="lectures" id="type-lectures" />
                        <Label htmlFor="type-lectures">{t('admin.coordination.timeSlots.types.lectures')}</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="oralPlacementTests" id="type-oral" />
                        <Label htmlFor="type-oral">{t('admin.coordination.timeSlots.types.oralPlacementTests')}</Label>
                      </div>
                    </RadioGroup>
                    {validation.errors.type && (
                      <p className="text-xs text-destructive">{t('admin.coordination.timeSlots.validation.required')}</p>
                    )}
                  </div>

                  {/* Venue */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      {t('admin.coordination.timeSlots.form.venue')} <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('admin.coordination.timeSlots.form.venueDesc')}</p>
                    <RadioGroup
                      value={formData.venue}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, venue: v as SlotVenue }))}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="online" id="venue-online" />
                        <Label htmlFor="venue-online">{t('admin.coordination.timeSlots.venues.online')}</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="onsite" id="venue-onsite" />
                        <Label htmlFor="venue-onsite">{t('admin.coordination.timeSlots.venues.onsite')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Label */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      {t('admin.coordination.timeSlots.form.label')} <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('admin.coordination.timeSlots.form.labelDesc')}</p>
                    <Input
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      placeholder={t('admin.coordination.timeSlots.form.labelPlaceholder')}
                    />
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      {t('admin.coordination.timeSlots.form.color')} <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('admin.coordination.timeSlots.form.colorDesc')}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {SLOT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                            formData.color === color ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-primary' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {/* Custom color picker */}
                      <label className="relative h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/40 hover:border-primary cursor-pointer transition-all hover:scale-110 overflow-hidden flex items-center justify-center"
                        title={t('admin.coordination.timeSlots.colorPicker')}
                      >
                        <span className="text-xs text-muted-foreground">+</span>
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Instructor Auto-Assignment Notice */}
                  <div className="admin-section-nested p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">{t('admin.coordination.timeSlots.availableInstructors')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('admin.coordination.timeSlots.autoAssigned')} — {t('admin.coordination.timeSlots.form.instructorsDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right - Schedule */}
              <Card className="admin-section">
                <CardHeader className="pb-3 border-b border-admin-border-light">
                  <CardTitle className="text-primary flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5" />
                    {formData.type === 'oralPlacementTests'
                      ? t('admin.coordination.timeSlots.form.dayAndDuration')
                      : t('admin.coordination.timeSlots.form.lectureDaysAndTimes')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!formData.type ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Info className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">{t('admin.coordination.timeSlots.form.selectTypeFirst')}</p>
                    </div>
                  ) : formData.type === 'lectures' ? (
                    /* Lecture Schedule */
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-4">
                        {t('admin.coordination.timeSlots.form.lectureScheduleDesc')}
                      </p>
                      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-3 gap-y-1 items-center">
                        <div className="font-semibold text-xs text-muted-foreground">{t('admin.coordination.timeSlots.day')}</div>
                        <div className="font-semibold text-xs text-muted-foreground">{t('admin.coordination.timeSlots.startTime')}</div>
                        <div className="font-semibold text-xs text-muted-foreground">{t('admin.coordination.timeSlots.endTime')}</div>
                        <div className="font-semibold text-xs text-muted-foreground">{t('admin.coordination.timeSlots.duration')}</div>

                        {DAYS_OF_WEEK.map(day => {
                          const isSelected = formData.selectedDays.includes(day);
                          const dayData = formData.days.find(d => d.day === day);
                          return [
                            <div key={`${day}-check`} className="flex items-center gap-2 py-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleDayToggle(day, !!checked)}
                              />
                              <span className={`text-sm ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                {t(`admin.coordination.timeSlots.days.${day}`)}
                              </span>
                            </div>,
                            <Input
                              key={`${day}-start`}
                              type="time"
                              value={dayData?.startTime || ''}
                              onChange={(e) => handleDayTimeChange(day, 'startTime', e.target.value)}
                              disabled={!isSelected}
                              className="h-9 text-sm"
                            />,
                            <Input
                              key={`${day}-end`}
                              type="time"
                              value={dayData?.endTime || ''}
                              onChange={(e) => handleDayTimeChange(day, 'endTime', e.target.value)}
                              disabled={!isSelected}
                              className="h-9 text-sm"
                            />,
                            <span key={`${day}-dur`} className="text-sm text-muted-foreground text-center min-w-[50px]">
                              {isSelected && dayData && dayData.duration > 0
                                ? formatDuration(dayData.duration)
                                : '--:--'}
                            </span>,
                          ];
                        })}
                      </div>
                      {validation.errors.days && (
                        <p className="text-xs text-destructive mt-2">{t('admin.coordination.timeSlots.validation.atLeastOneDay')}</p>
                      )}
                    </div>
                  ) : (
                    /* Placement Test Schedule */
                    <div className="space-y-5">
                      <p className="text-xs text-muted-foreground">
                        {t('admin.coordination.timeSlots.form.placementScheduleDesc')}
                      </p>

                      {/* Day Selection */}
                      <div className="space-y-2">
                        <Label className="font-semibold">
                          {t('admin.coordination.timeSlots.day')} <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.placementDay}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, placementDay: v as DayOfWeek }))}
                          className="grid grid-cols-2 gap-2"
                        >
                          {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="flex items-center gap-2">
                              <RadioGroupItem value={day} id={`placement-${day}`} />
                              <Label htmlFor={`placement-${day}`} className="text-sm">
                                {t(`admin.coordination.timeSlots.days.${day}`)}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Times */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold">
                            {t('admin.coordination.timeSlots.startTime')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="time"
                            value={formData.placementStartTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, placementStartTime: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">
                            {t('admin.coordination.timeSlots.endTime')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="time"
                            value={formData.placementEndTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, placementEndTime: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Single Test Duration */}
                      <div className="space-y-2">
                        <Label className="font-semibold">
                          {t('admin.coordination.timeSlots.form.singleTestDuration')} <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min={1}
                            value={formData.singleTestDuration}
                            onChange={(e) => setFormData(prev => ({ ...prev, singleTestDuration: parseInt(e.target.value) || 0 }))}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">{t('admin.coordination.timeSlots.minutes')}</span>
                        </div>
                      </div>

                      {/* Calculated Tests Count */}
                      {numberOfTests > 0 && (
                        <div className="admin-section-nested p-3 rounded-lg flex items-center gap-2">
                          <Info className="h-4 w-4 text-info" />
                          <span className="text-sm">
                            {t('admin.coordination.timeSlots.form.willCoverTests', { count: numberOfTests })}
                          </span>
                        </div>
                      )}

                      {validation.errors.placementTime && (
                        <p className="text-xs text-destructive">{t('admin.coordination.timeSlots.validation.endAfterStart')}</p>
                      )}
                      {validation.errors.testFit && (
                        <p className="text-xs text-destructive">{t('admin.coordination.timeSlots.validation.doesNotFit')}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Save/Cancel */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate('/admin/coordination/time-slots')} className="gap-2">
                <X className="h-4 w-4" />
                {t('admin.coordination.timeSlots.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={!validation.isValid} className="gap-2">
                <Save className="h-4 w-4" />
                {t('admin.coordination.timeSlots.save')}
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default TimeSlotForm;
