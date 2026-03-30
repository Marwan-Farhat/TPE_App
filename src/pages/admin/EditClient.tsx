import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLanguage from '@/hooks/useLanguage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import TagsSelector from '@/components/admin/clients/TagsSelector';
import { clientService, systemOptionsService, SystemOptions } from '@/services/clientService';
import { Client, Gender } from '@/types/client';

const editClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  email: z.string().email('Invalid email address').max(255),
  jobTitle: z.string().max(100).optional(),
  age: z.number().min(1).max(120).optional().nullable(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  guardianNumber: z.string().max(20).optional(),
  currentPath: z.string().optional(),
  currentProgram: z.string().optional(),
  programType: z.string().optional(),
  source: z.string().optional(),
  assignedCoordinator: z.string().optional(),
  underCompany: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type EditClientFormData = z.infer<typeof editClientSchema>;

const EditClient = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [systemOptions, setSystemOptions] = useState<SystemOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloadOptions, setReloadOptions] = useState(0);

  const form = useForm<EditClientFormData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (clientId: string) => {
    setLoading(true);
    try {
      const [clientData, options] = await Promise.all([
        clientService.getById(clientId),
        systemOptionsService.getAll(),
      ]);
      
      if (clientData) {
        setClient(clientData);
        setSystemOptions(options);
        
        form.reset({
          name: clientData.name,
          phoneNumber: clientData.phoneNumber,
          email: clientData.email,
          jobTitle: clientData.jobTitle || '',
          age: clientData.age || null,
          gender: clientData.gender as Gender,
          city: clientData.city || '',
          country: clientData.country || '',
          guardianNumber: clientData.guardianNumber || '',
          currentPath: clientData.currentPath || '',
          currentProgram: clientData.currentProgram || '',
          programType: clientData.programType || '',
          source: clientData.source || '',
          assignedCoordinator: clientData.assignedCoordinator || '',
          underCompany: clientData.underCompany || '',
          tags: clientData.tags || [],
        });
      }
    } catch (error) {
      console.error('Error loading client:', error);
      toast({
        title: t('admin.clients.deleteError'),
        description: t('admin.clients.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditClientFormData) => {
    if (!id) return;
    
    setSaving(true);
    try {
      const updated = await clientService.update(id, {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        email: data.email.trim().toLowerCase(),
        jobTitle: data.jobTitle,
        age: data.age || undefined,
        gender: data.gender as Gender,
        city: data.city,
        country: data.country,
        guardianNumber: data.guardianNumber,
        currentPath: data.currentPath,
        currentProgram: data.currentProgram,
        programType: data.programType,
        source: data.source,
        assignedCoordinator: data.assignedCoordinator,
        underCompany: data.underCompany,
        tags: data.tags || [],
      });

      if (updated) {
        toast({
          title: t('admin.clients.deleteSuccess'),
        });
        navigate(`/admin/clients/${id}`);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: t('admin.clients.deleteError'),
        description: t('admin.clients.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle tag selection
  const handleTagChange = (tagId: string) => {
    const current = form.getValues('tags') || [];
    if (current.includes(tagId)) {
      form.setValue('tags', current.filter(t => t !== tagId));
    } else {
      form.setValue('tags', [...current, tagId]);
    }
  };

  const loadSystemOptions = async () => {
    try {
      const options = await systemOptionsService.getAll();
      setSystemOptions(options);
      setReloadOptions(prev => prev + 1);
    } catch (error) {
      console.error('Error loading system options:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'} p-6`}>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'} p-6`}>
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <h2 className="text-xl font-semibold">{t('admin.clientProfile.clientNotFound')}</h2>
            <Button onClick={() => navigate('/admin/clients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('admin.clientProfile.back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'}`}>
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/admin/clients/${id}`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-medium">{t('admin.clientForm.editTitle')}: {client.name}</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-card border border-border rounded-xl p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                  <h2 className="text-lg font-semibold mb-6">{t('admin.clientForm.personalInfo')}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.nameRequired')}</FormLabel>
                          <FormControl>
                            <Input {...field} dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.phoneRequired')}</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="+20 xxx xxx xxxx" dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.emailRequired')}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="client@example.com" dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.jobTitle')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Software Engineer" dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.age')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={120}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              placeholder="Age"
                              dir={isRTL ? 'rtl' : 'ltr'}
                              className={isRTL ? 'text-right' : ''}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.gender')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('admin.clientForm.fields.selectGender')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">{t('admin.clientForm.fields.maleOption')}</SelectItem>
                              <SelectItem value="Female">{t('admin.clientForm.fields.femaleOption')}</SelectItem>
                              <SelectItem value="Other">{t('admin.clientForm.fields.otherOption')}</SelectItem>
                              <SelectItem value="Prefer not to say">{t('admin.clientForm.fields.preferNotOption')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.city')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City" dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.country')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Country" dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guardianNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.guardianNumber')}</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="Guardian phone number" dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-card border border-border rounded-xl p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                  <h2 className="text-lg font-semibold mb-6">{t('admin.clientForm.productInfo')}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="currentPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.currentPath')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('admin.clientForm.fields.selectPath')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('admin.clientForm.fields.noneOption')}</SelectItem>
                              {systemOptions?.trainingPaths.map(path => (
                                <SelectItem key={path.id} value={path.name}>
                                  {path.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentProgram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.currentProgram')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Current program" dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="programType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.programType')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('admin.clientForm.fields.selectType')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('admin.clientForm.fields.noneOption')}</SelectItem>
                              <SelectItem value="One-on-One">{t('admin.clientForm.fields.oneOnOne')}</SelectItem>
                              <SelectItem value="Group">{t('admin.clientForm.fields.groupOption')}</SelectItem>
                              <SelectItem value="Hybrid">{t('admin.clientForm.fields.hybridOption')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.source')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('admin.clientForm.fields.selectSource')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('admin.clientForm.fields.noneOption')}</SelectItem>
                              <SelectItem value="Website">{t('admin.clientForm.fields.website')}</SelectItem>
                              <SelectItem value="Referral">{t('admin.clientForm.fields.referral')}</SelectItem>
                              <SelectItem value="Social Media">{t('admin.clientForm.fields.socialMedia')}</SelectItem>
                              <SelectItem value="Walk-in">{t('admin.clientForm.fields.walkIn')}</SelectItem>
                              <SelectItem value="Corporate">{t('admin.clientForm.fields.corporate')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignedCoordinator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.assignedCoordinator')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('admin.clientForm.fields.selectCoordinator')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('admin.clientForm.fields.noneOption')}</SelectItem>
                              {systemOptions?.coordinators.map(coord => (
                                <SelectItem key={coord.id} value={coord.id}>
                                  {coord.name} ({coord.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="underCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.underCompany')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                                <SelectValue placeholder={t('admin.clientForm.fields.selectCompany')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('admin.clientForm.fields.noneOption')}</SelectItem>
                              {systemOptions?.companies.map(company => (
                                <SelectItem key={company.id} value={company.name}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags Section */}
                  <div className="mt-6 border-t border-border pt-6">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t('admin.clientForm.fields.tags')}
                    </label>
                    <TagsSelector
                      tags={systemOptions?.tags || []}
                      selectedTagIds={form.watch('tags') || []}
                      onTagChange={handleTagChange}
                      onTagsUpdated={loadSystemOptions}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/admin/clients/${id}`)}
                  >
                    {t('admin.clientForm.fields.cancel')}
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? t('admin.clientForm.fields.saving') : t('admin.clientForm.fields.saveChanges')}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default EditClient;
