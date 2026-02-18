import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Info, X } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import useLanguage from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { timeSlotService } from '@/services/timeSlotService';
import { TimeSlot, SlotType, DAYS_OF_WEEK, DayOfWeek } from '@/types/timeSlot';
import { formatDuration, calculateWeeklyDuration, formatTimeTo12h } from '@/services/timeSlotValidation';
import TimeSlotInfoDialog from '@/components/admin/coordination/TimeSlotInfoDialog';

const TimeSlotsList = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<TimeSlot[]>(() => timeSlotService.getAll().filter(s => s.status !== 'deleted'));
  const [activeTab, setActiveTab] = useState<string>('lectures');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const refreshSlots = () => {
    setSlots(timeSlotService.getAll().filter(s => s.status !== 'deleted'));
  };

  const filteredSlots = useMemo(() => {
    if (activeTab === 'all') return slots;
    return slots.filter(s => s.type === activeTab);
  }, [slots, activeTab]);

  // Group slots by day for calendar view
  const slotsByDay = useMemo(() => {
    const map: Record<DayOfWeek, { lectures: TimeSlot[]; oralPlacementTests: TimeSlot[] }> = {} as any;
    DAYS_OF_WEEK.forEach(day => {
      map[day] = { lectures: [], oralPlacementTests: [] };
    });
    filteredSlots.forEach(slot => {
      slot.days.forEach(ds => {
        if (map[ds.day]) {
          map[ds.day][slot.type].push(slot);
        }
      });
    });
    return map;
  }, [filteredSlots]);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowInfo(true);
  };

  const handleStatusChange = (id: string, status: 'active' | 'deactivated' | 'archived' | 'deleted') => {
    timeSlotService.updateStatus(id, status);
    if (status === 'deleted') {
      timeSlotService.remove(id);
    }
    refreshSlots();
    setShowInfo(false);
    setSelectedSlot(null);
  };

  const getDayScheduleForSlot = (slot: TimeSlot, day: DayOfWeek) => {
    return slot.days.find(d => d.day === day);
  };

  return (
    <div className="min-h-screen bg-admin-bg flex">
      <AdminSidebar />
      <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-admin-border-light shadow-[0_2px_8px_hsl(220_20%_20%/0.08)]">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">{t('admin.coordination.title')}</span>
              <span>/</span>
              <span>{t('admin.coordination.timeSlots.title')}</span>
            </div>
            <Button onClick={() => navigate('/admin/coordination/time-slots/add')} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.coordination.timeSlots.addSlot')}
            </Button>
          </div>
        </header>

        <main className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Info Banner */}
            {showBanner && (
              <Card className="mb-6 border-info/30 bg-info/5">
                <CardContent className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground flex-1">
                      {t('admin.coordination.timeSlots.infoBanner')}
                    </p>
                    <button onClick={() => setShowBanner(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="lectures" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('admin.coordination.timeSlots.types.lectures')}
                </TabsTrigger>
                <TabsTrigger value="oralPlacementTests" className="gap-2">
                  <Clock className="h-4 w-4" />
                  {t('admin.coordination.timeSlots.types.oralPlacementTests')}
                </TabsTrigger>
                <TabsTrigger value="all">
                  {t('admin.coordination.timeSlots.types.allSlots')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Calendar View */}
            <Card className="admin-section">
              <CardContent className="p-0">
                {filteredSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Calendar className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">{t('admin.coordination.timeSlots.noSlots')}</p>
                    <p className="text-sm mt-1">{t('admin.coordination.timeSlots.noSlotsDesc')}</p>
                    <Button onClick={() => navigate('/admin/coordination/time-slots/add')} className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      {t('admin.coordination.timeSlots.addSlot')}
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-admin-border-light bg-admin-section-alt">
                          <th className="text-start p-4 font-semibold text-sm text-muted-foreground w-32">
                            {t('admin.coordination.timeSlots.day')}
                          </th>
                          {activeTab === 'all' && (
                            <th className="text-start p-4 font-semibold text-sm text-muted-foreground w-40">
                              {t('admin.coordination.timeSlots.type')}
                            </th>
                          )}
                          <th className="text-start p-4 font-semibold text-sm text-muted-foreground">
                            {t('admin.coordination.timeSlots.slotsLabel')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS_OF_WEEK.map(day => {
                          const dayData = slotsByDay[day];
                          const hasLectures = dayData.lectures.length > 0;
                          const hasTests = dayData.oralPlacementTests.length > 0;
                          const hasAny = hasLectures || hasTests;

                          if (!hasAny) return null;

                          if (activeTab === 'all') {
                            const rows = [];
                            if (hasLectures) {
                              rows.push(
                                <tr key={`${day}-lectures`} className="border-b border-admin-border-light">
                                  {rows.length === 0 && (
                                    <td className="p-4 font-semibold text-foreground align-top" rowSpan={hasTests ? 2 : 1}>
                                      {t(`admin.coordination.timeSlots.days.${day}`)}
                                    </td>
                                  )}
                                  <td className="p-4 text-sm text-muted-foreground align-top">
                                    {t('admin.coordination.timeSlots.types.lectures')}
                                  </td>
                                  <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                      {dayData.lectures.map(slot => {
                                        const ds = getDayScheduleForSlot(slot, day);
                                        const isDeactivated = slot.status === 'deactivated';
                                        return (
                                          <button
                                            key={slot.id}
                                            onClick={() => handleSlotClick(slot)}
                                            className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-105 cursor-pointer ${isDeactivated ? 'opacity-50 grayscale' : ''}`}
                                            style={{ backgroundColor: slot.color }}
                                          >
                                            <div className="font-semibold">{slot.label}</div>
                                            {ds && (
                                              <div className="text-xs opacity-90">{formatTimeTo12h(ds.startTime)} - {formatTimeTo12h(ds.endTime)}</div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                            if (hasTests) {
                              rows.push(
                                <tr key={`${day}-tests`} className="border-b border-admin-border-light">
                                  {!hasLectures && (
                                    <td className="p-4 font-semibold text-foreground align-top">
                                      {t(`admin.coordination.timeSlots.days.${day}`)}
                                    </td>
                                  )}
                                  <td className="p-4 text-sm text-muted-foreground align-top">
                                    {t('admin.coordination.timeSlots.types.oralPlacementTests')}
                                  </td>
                                  <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                      {dayData.oralPlacementTests.map(slot => {
                                        const ds = getDayScheduleForSlot(slot, day);
                                        const isDeactivated = slot.status === 'deactivated';
                                        return (
                                          <button
                                            key={slot.id}
                                            onClick={() => handleSlotClick(slot)}
                                            className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-105 cursor-pointer ${isDeactivated ? 'opacity-50 grayscale' : ''}`}
                                            style={{ backgroundColor: slot.color }}
                                          >
                                            <div className="font-semibold">{slot.label}</div>
                                            {ds && (
                                              <div className="text-xs opacity-90">{formatTimeTo12h(ds.startTime)} - {formatTimeTo12h(ds.endTime)}</div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                            return rows;
                          }

                          // Single type tab
                          const slotsForDay = activeTab === 'lectures' ? dayData.lectures : dayData.oralPlacementTests;
                          if (slotsForDay.length === 0) return null;

                          return (
                            <tr key={day} className="border-b border-admin-border-light">
                              <td className="p-4 font-semibold text-foreground align-top">
                                {t(`admin.coordination.timeSlots.days.${day}`)}
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-2">
                                  {slotsForDay.map(slot => {
                                    const ds = getDayScheduleForSlot(slot, day);
                                    const isDeactivated = slot.status === 'deactivated';
                                    return (
                                      <button
                                        key={slot.id}
                                        onClick={() => handleSlotClick(slot)}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-105 cursor-pointer ${isDeactivated ? 'opacity-50 grayscale' : ''}`}
                                        style={{ backgroundColor: slot.color }}
                                      >
                                        <div className="font-semibold">{slot.label}</div>
                                        {ds && (
                                          <div className="text-xs opacity-90">{formatTimeTo12h(ds.startTime)} - {formatTimeTo12h(ds.endTime)}</div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Slot Info Dialog */}
      {selectedSlot && (
        <TimeSlotInfoDialog
          open={showInfo}
          onOpenChange={setShowInfo}
          slot={selectedSlot}
          onEdit={() => navigate(`/admin/coordination/time-slots/${selectedSlot.id}/edit`)}
          onMoreInfo={() => navigate(`/admin/coordination/time-slots/${selectedSlot.id}`)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default TimeSlotsList;
