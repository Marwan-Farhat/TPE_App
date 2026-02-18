import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Edit, Power, Archive, Trash2, Calendar, Zap, RefreshCw } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import useLanguage from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { timeSlotService } from '@/services/timeSlotService';
import { formatDuration, calculateWeeklyDuration, formatTimeTo12h } from '@/services/timeSlotValidation';
import { useState } from 'react';

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

const TimeSlotDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [slot, setSlot] = useState(() => id ? timeSlotService.getById(id) : undefined);

  if (!slot) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <p className="text-muted-foreground">{t('admin.coordination.timeSlots.notFound')}</p>
      </div>
    );
  }

  const weeklyDuration = calculateWeeklyDuration(slot.days);
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleStatusChange = (status: 'active' | 'deactivated' | 'archived' | 'deleted') => {
    if (status === 'deleted') {
      timeSlotService.remove(slot.id);
      toast({ title: t('admin.coordination.timeSlots.messages.deleteSuccess') });
      navigate('/admin/coordination/time-slots');
      return;
    }
    const updated = timeSlotService.updateStatus(slot.id, status);
    if (updated) {
      setSlot(updated);
      toast({ title: t('admin.coordination.timeSlots.messages.statusUpdated') });
    }
  };

  const daysTimesSummary = slot.days
    .map(d => {
      const dayLabel = t(`admin.coordination.timeSlots.days.${d.day}`).substring(0, 3);
      return `${dayLabel} ${formatTimeTo12h(d.startTime)} - ${formatTimeTo12h(d.endTime)}`;
    })
    .join(' + ');

  const role = slot.type === 'lectures' ? 'Instructor' : 'PlacementTester';
  const availableInstructors = MOCK_INSTRUCTORS_BY_ROLE[role] || [];

  return (
    <div className="min-h-screen bg-admin-bg flex">
      <AdminSidebar />
      <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'}`}>
        {/* Breadcrumb Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-admin-border-light shadow-[0_2px_8px_hsl(220_20%_20%/0.08)]">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <button onClick={() => navigate('/admin/coordination/time-slots')} className="text-primary hover:underline font-medium">
                {t('admin.coordination.title')}
              </button>
              <span>/</span>
              <button onClick={() => navigate('/admin/coordination/time-slots')} className="hover:underline">
                {t('admin.coordination.timeSlots.title')}
              </button>
              <span>/</span>
              <span className="text-foreground font-medium">{slot.label}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/coordination/time-slots')} className="gap-2">
              <BackArrow className="h-4 w-4" />
              {t('admin.coordination.timeSlots.back')}
            </Button>
          </div>
        </header>

        <main className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            {/* Slot Header */}
            <Card className="admin-section mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-5 w-5 rounded-full" style={{ backgroundColor: slot.color }} />
                  <h1 className="text-xl font-bold">{slot.label}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="admin-info-row">
                    <span className="admin-info-label">{t('admin.coordination.timeSlots.form.allocationType')}</span>
                    <span className="admin-info-value">{t(`admin.coordination.timeSlots.types.${slot.type}`)}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">{t('admin.coordination.timeSlots.form.daysAndTimes')}</span>
                    <span className="admin-info-value">{daysTimesSummary}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">{t('admin.coordination.timeSlots.isActive')}</span>
                    <span className="admin-info-value">
                      {slot.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {t('admin.coordination.timeSlots.statusLabels.active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{t(`admin.coordination.timeSlots.statusLabels.${slot.status}`)}</Badge>
                      )}
                    </span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">{t('admin.coordination.timeSlots.form.venue')}</span>
                    <span className="admin-info-value">{t(`admin.coordination.timeSlots.venues.${slot.venue}`)}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">{t('admin.coordination.timeSlots.weeklyDuration')}</span>
                    <span className="admin-info-value">{formatDuration(weeklyDuration)}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">{t('admin.coordination.timeSlots.createdAt')}</span>
                    <span className="admin-info-value">{new Date(slot.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">{t('admin.coordination.timeSlots.availableInstructors')}</span>
                    <span className="admin-info-value flex items-center gap-2 flex-wrap">
                      {availableInstructors.map((inst) => (
                        <span key={inst.name} className="flex items-center gap-1.5">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{inst.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{inst.name}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  {slot.type === 'oralPlacementTests' && slot.numberOfTests && (
                    <div className="admin-info-row">
                      <span className="admin-info-label">{t('admin.coordination.timeSlots.numberOfTests')}</span>
                      <span className="admin-info-value">{slot.numberOfTests}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Table */}
            <Card className="admin-section mb-6">
              <CardContent className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-admin-border-light">
                      <th className="text-start py-3 px-4 text-sm font-semibold text-muted-foreground">{t('admin.coordination.timeSlots.day')}</th>
                      <th className="text-start py-3 px-4 text-sm font-semibold text-muted-foreground">{t('admin.coordination.timeSlots.startTime')}</th>
                      <th className="text-start py-3 px-4 text-sm font-semibold text-muted-foreground">{t('admin.coordination.timeSlots.endTime')}</th>
                      <th className="text-start py-3 px-4 text-sm font-semibold text-muted-foreground">{t('admin.coordination.timeSlots.duration')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slot.days.map(d => (
                      <tr key={d.day} className="border-b border-admin-border-light last:border-b-0">
                        <td className="py-3 px-4 font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {t(`admin.coordination.timeSlots.days.${d.day}`)}
                        </td>
                        <td className="py-3 px-4">{formatTimeTo12h(d.startTime)}</td>
                        <td className="py-3 px-4">{formatTimeTo12h(d.endTime)}</td>
                        <td className="py-3 px-4 text-primary font-medium">{formatDuration(d.duration)}</td>
                      </tr>
                    ))}
                    <tr className="bg-admin-section-alt">
                      <td colSpan={3} className="py-3 px-4 text-end font-semibold text-muted-foreground">
                        {t('admin.coordination.timeSlots.totalWeekly')}
                      </td>
                      <td className="py-3 px-4 font-bold text-primary">{formatDuration(weeklyDuration)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/admin/coordination/time-slots/${slot.id}/edit`)} className="gap-2">
                <Edit className="h-4 w-4" />
                {t('admin.coordination.timeSlots.edit')}
              </Button>
              {slot.status === 'active' ? (
                <Button variant="outline" className="gap-2 text-warning border-warning/30" onClick={() => handleStatusChange('deactivated')}>
                  <Power className="h-4 w-4" />
                  {t('admin.coordination.timeSlots.deactivate')}
                </Button>
              ) : (
                <Button variant="outline" className="gap-2 text-green-600 border-green-600/30" onClick={() => handleStatusChange('active')}>
                  <Power className="h-4 w-4" />
                  {t('admin.coordination.timeSlots.activate')}
                </Button>
              )}
              <span className="border-r border-admin-border-light" />
              <Button variant="outline" className="gap-2 text-orange-500 border-orange-500/30" onClick={() => handleStatusChange('archived')}>
                <Archive className="h-4 w-4" />
                {t('admin.coordination.timeSlots.archive')}
              </Button>
              <Button variant="destructive" className="gap-2" onClick={() => handleStatusChange('deleted')}>
                <Trash2 className="h-4 w-4" />
                {t('admin.coordination.timeSlots.deleteSlot')}
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default TimeSlotDetail;
