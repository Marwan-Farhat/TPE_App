import { useTranslation } from 'react-i18next';
import { TimeSlot } from '@/types/timeSlot';
import { formatDuration, calculateWeeklyDuration, formatTimeTo12h } from '@/services/timeSlotValidation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Info, Power, Archive, Trash2, X, CheckCircle, Zap, Users } from 'lucide-react';

// Mock instructors for display purposes
const MOCK_INSTRUCTORS_BY_ROLE: Record<string, { name: string; initials: string }[]> = {
  Instructor: [
    { name: 'Maram Emam', initials: 'ME' },
    { name: 'Kareem Hamdy', initials: 'KH' },
    { name: 'Sarah Ahmed', initials: 'SA' },
  ],
  PlacementTester: [
    { name: 'Nour Hassan', initials: 'NH' },
    { name: 'Omar Farid', initials: 'OF' },
  ],
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: TimeSlot;
  onEdit: () => void;
  onMoreInfo: () => void;
  onStatusChange: (id: string, status: 'active' | 'deactivated' | 'archived' | 'deleted') => void;
}

const TimeSlotInfoDialog = ({ open, onOpenChange, slot, onEdit, onMoreInfo, onStatusChange }: Props) => {
  const { t } = useTranslation();
  const weeklyDuration = calculateWeeklyDuration(slot.days);

  const daysTimesSummary = slot.days
    .map(d => {
      const dayLabel = t(`admin.coordination.timeSlots.days.${d.day}`).substring(0, 3);
      return `${dayLabel} ${formatTimeTo12h(d.startTime)} - ${formatTimeTo12h(d.endTime)}`;
    })
    .join(' + ');

  const role = slot.type === 'lectures' ? 'Instructor' : 'PlacementTester';
  const availableInstructors = MOCK_INSTRUCTORS_BY_ROLE[role] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('admin.coordination.timeSlots.slotInfo')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.form.label')}</span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: slot.color }} />
              <span className="font-semibold">{slot.label}</span>
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.form.allocationType')}</span>
            <span>{t(`admin.coordination.timeSlots.types.${slot.type}`)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.form.daysAndTimes')}</span>
            <span className="text-end max-w-[240px]">{daysTimesSummary}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.isActive')}</span>
            <span className="flex items-center gap-1.5">
              {slot.status === 'active' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">{t('admin.coordination.timeSlots.statusLabels.active')}</span>
                </>
              ) : (
                <Badge variant="secondary">{t(`admin.coordination.timeSlots.statusLabels.${slot.status}`)}</Badge>
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.form.venue')}</span>
            <span>{t(`admin.coordination.timeSlots.venues.${slot.venue}`)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.weeklyDuration')}</span>
            <span>{formatDuration(weeklyDuration)}</span>
          </div>

          {/* Available Instructors */}
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.availableInstructors')}</span>
            <div className="flex items-center gap-2 flex-wrap justify-end max-w-[280px]">
              {availableInstructors.map((inst) => (
                <div key={inst.name} className="flex items-center gap-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{inst.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{inst.name}</span>
                </div>
              ))}
            </div>
          </div>

          {slot.type === 'oralPlacementTests' && slot.numberOfTests && (
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">{t('admin.coordination.timeSlots.numberOfTests')}</span>
              <span>{slot.numberOfTests}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-admin-border-light">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onMoreInfo}>
            <Info className="h-3.5 w-3.5" />
            {t('admin.coordination.timeSlots.moreInfo')}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
            {t('admin.coordination.timeSlots.edit')}
          </Button>
          <span className="border-r border-admin-border-light mx-1" />
          {slot.status === 'active' ? (
            <Button size="sm" variant="outline" className="gap-1.5 text-warning border-warning/30" onClick={() => onStatusChange(slot.id, 'deactivated')}>
              <Power className="h-3.5 w-3.5" />
              {t('admin.coordination.timeSlots.deactivate')}
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-600/30" onClick={() => onStatusChange(slot.id, 'active')}>
              <Power className="h-3.5 w-3.5" />
              {t('admin.coordination.timeSlots.activate')}
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5 text-orange-500 border-orange-500/30" onClick={() => onStatusChange(slot.id, 'archived')}>
            <Archive className="h-3.5 w-3.5" />
            {t('admin.coordination.timeSlots.archive')}
          </Button>
          <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => onStatusChange(slot.id, 'deleted')}>
            <Trash2 className="h-3.5 w-3.5" />
            {t('admin.coordination.timeSlots.deleteSlot')}
          </Button>
        </div>

        <div className="flex justify-end mt-2">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => onOpenChange(false)}>
            <X className="h-3.5 w-3.5" />
            {t('admin.coordination.timeSlots.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotInfoDialog;
