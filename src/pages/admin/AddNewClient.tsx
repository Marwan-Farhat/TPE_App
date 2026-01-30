import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  UserPlus, 
  Info, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import useLanguage from '@/hooks/useLanguage';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ExtraFieldsManager from '@/components/admin/clients/ExtraFieldsManager';
import TagsSelector from '@/components/admin/clients/TagsSelector';
import { 
  clientService, 
  extraFieldService, 
  systemOptionsService,
  SystemOptions 
} from '@/services/clientService';
import { ExtraField, ExtraFieldValue } from '@/types/extraField';
import { Gender, ClientStatus } from '@/types/client';

// Form validation schema
const clientFormSchema = z.object({
  // Personal Information (Required)
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, 'Name can only contain Arabic or English letters'),
  phoneNumber: z.string()
    .min(8, 'Phone number must be at least 8 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  // Personal Information (Optional)
  jobTitle: z.string().max(100).optional(),
  age: z.number().min(1).max(120).optional().nullable(),
  gender: z.enum(['Male', 'Female']).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  guardianNumber: z.string().max(20).optional(),
  
  // Product Information
  trainingPathType: z.enum(['pre-designed', 'custom']).optional(),
  currentPath: z.string().optional(),
  selectedTimeSlots: z.array(z.string()).optional(),
  preferredTimeSlot: z.string().optional(),
  tags: z.array(z.string()).optional(),
  assignedCoordinator: z.string().optional(),
  underCompany: z.string().optional(),
  
  // Account Creation
  createAccount: z.boolean().default(false),
  
  // Notes
  notes: z.string().max(1000).optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

const AddNewClient = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemOptions, setSystemOptions] = useState<SystemOptions | null>(null);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [extraFieldValues, setExtraFieldValues] = useState<Record<string, string | number | boolean>>({});
  const [isExtraInfoOpen, setIsExtraInfoOpen] = useState(true);
  const [isEnrollmentDetailsOpen, setIsEnrollmentDetailsOpen] = useState(true);
  const [isExtraFieldsManagerOpen, setIsExtraFieldsManagerOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      jobTitle: '',
      age: null,
      gender: undefined,
      city: '',
      country: '',
      guardianNumber: '',
      trainingPathType: undefined,
      currentPath: '',
      selectedTimeSlots: [],
      preferredTimeSlot: '',
      tags: [],
      assignedCoordinator: '',
      underCompany: '',
      createAccount: false,
      notes: '',
    },
  });

  // Load data
  useEffect(() => {
    loadSystemOptions();
    loadExtraFields();
  }, []);

  const loadSystemOptions = async () => {
    try {
      const options = await systemOptionsService.getAll();
      setSystemOptions(options);
    } catch (error) {
      console.error('Error loading system options:', error);
    }
  };

  const loadExtraFields = async () => {
    try {
      const fields = await extraFieldService.getAll();
      setExtraFields(fields);
      
      // Set default values for extra fields
      const defaults: Record<string, string | number | boolean> = {};
      fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      });
      setExtraFieldValues(defaults);
    } catch (error) {
      console.error('Error loading extra fields:', error);
    }
  };

  // Real-time validation for duplicate check
  const checkDuplicates = async (email: string, phone: string) => {
    const errors: Record<string, string> = {};
    
    if (email) {
      const emailDuplicate = await clientService.checkDuplicateEmail(email);
      if (emailDuplicate) {
        errors.email = 'This email is already registered';
      }
    }
    
    if (phone) {
      const phoneDuplicate = await clientService.checkDuplicatePhone(phone);
      if (phoneDuplicate) {
        errors.phoneNumber = 'This phone number is already registered';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const onSubmit = async (data: ClientFormData, saveAndAddAnother: boolean = false) => {
    setIsSubmitting(true);
    
    try {
      // Check duplicates
      const noDuplicates = await checkDuplicates(data.email, data.phoneNumber);
      if (!noDuplicates) {
        setIsSubmitting(false);
        return;
      }

      // Validate extra mandatory fields
      const missingMandatory = extraFields.filter(
        f => f.isMandatory && !extraFieldValues[f.id]
      );
      if (missingMandatory.length > 0) {
        toast({
          title: t('admin.clientForm.missingRequired'),
          description: `${t('admin.clientForm.pleaseFill')}: ${missingMandatory.map(f => f.title).join(', ')}`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Create client
      const newClient = await clientService.create(
        {
          name: data.name.trim(),
          phoneNumber: data.phoneNumber.trim(),
          email: data.email.trim().toLowerCase(),
          password: '', // Will be generated if createAccount is true
          jobTitle: data.jobTitle,
          age: data.age || undefined,
          gender: data.gender as Gender,
          city: data.city,
          country: data.country,
          guardianNumber: data.guardianNumber,
          currentPath: data.currentPath,
          selectedTimeSlots: data.selectedTimeSlots,
          tags: data.tags,
          assignedCoordinator: data.assignedCoordinator,
          underCompany: data.underCompany,
          // Map extra field values to product data
          currentProgram: extraFieldValues['ef-001']?.toString(),
          programType: extraFieldValues['ef-002']?.toString(),
          source: extraFieldValues['ef-003']?.toString(),
        },
        {
          userId: user?.id || 'unknown',
          role: user?.role || 'Admin',
          interface: 'Admin',
        },
        data.createAccount
      );

      toast({
        title: t('admin.clientForm.success'),
        description: `Client ID: ${newClient.id}${data.createAccount ? ' - Account credentials generated' : ''}`,
      });

      if (saveAndAddAnother) {
        form.reset();
        setExtraFieldValues({});
        loadExtraFields();
      } else {
        navigate('/admin');
      }
    } catch (error) {
      toast({
        title: t('admin.clientForm.error'),
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle time slot selection (max 3)
  const handleTimeSlotChange = (slotValue: string, checked: boolean) => {
    const current = form.getValues('selectedTimeSlots') || [];
    
    if (checked) {
      if (current.length >= 3) {
        toast({
          title: t('admin.clientForm.maxTimeSlots'),
          variant: 'destructive',
        });
        return;
      }
      form.setValue('selectedTimeSlots', [...current, slotValue]);
    } else {
      form.setValue('selectedTimeSlots', current.filter(s => s !== slotValue));
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

  // Render extra field input
  const renderExtraFieldInput = (field: ExtraField) => {
    const value = extraFieldValues[field.id] ?? field.defaultValue ?? '';

    switch (field.type) {
      case 'options':
        return (
          <Select
            value={value.toString()}
            onValueChange={(v) => setExtraFieldValues({ ...extraFieldValues, [field.id]: v })}
          >
            <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''}>
              <SelectValue placeholder={`${t('admin.clientForm.selectPlaceholder')} ${field.title.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={Boolean(value)}
              onCheckedChange={(checked) => 
                setExtraFieldValues({ ...extraFieldValues, [field.id]: checked as boolean })
              }
            />
            <Label htmlFor={field.id}>{value ? t('admin.clientForm.yes') : t('admin.clientForm.no')}</Label>
          </div>
        );
      case 'longText':
        return (
          <Textarea
            value={value.toString()}
            onChange={(e) => setExtraFieldValues({ ...extraFieldValues, [field.id]: e.target.value })}
            placeholder={field.description || `${t('admin.clientForm.enterPlaceholder')} ${field.title.toLowerCase()}`}
            rows={3}
            className={isRTL ? 'text-right' : ''}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value.toString()}
            onChange={(e) => setExtraFieldValues({ ...extraFieldValues, [field.id]: Number(e.target.value) })}
            placeholder={field.description || `${t('admin.clientForm.enterPlaceholder')} ${field.title.toLowerCase()}`}
            className={isRTL ? 'text-right' : ''}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        );
      default:
        return (
          <Input
            type={field.type === 'email' ? 'email' : field.type === 'phoneNumber' ? 'tel' : 'text'}
            value={value.toString()}
            onChange={(e) => setExtraFieldValues({ ...extraFieldValues, [field.id]: e.target.value })}
            placeholder={field.description || `${t('admin.clientForm.enterPlaceholder')} ${field.title.toLowerCase()}`}
            className={isRTL ? 'text-right' : ''}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        );
    }
  };

  const isFormValid = form.formState.isValid && Object.keys(validationErrors).length === 0;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-2 text-sm">
              <Button 
                variant="link" 
                className="text-primary p-0 h-auto"
                onClick={() => navigate('/admin')}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {t('admin.sidebar.clients')}
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">{t('admin.clientForm.title')}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))}>
                
                {/* Personal Information Section */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-6">{t('admin.clientForm.personalInfo')}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.name')} *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={t('admin.clientForm.placeholders.name')}
                              className={validationErrors.name ? 'border-destructive' : isRTL ? 'text-right' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.phone')} *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={t('admin.clientForm.placeholders.phone')}
                              type="tel"
                              className={`${validationErrors.phoneNumber ? 'border-destructive' : ''} ${isRTL ? 'text-right' : ''}`}
                              onBlur={async () => {
                                await checkDuplicates(form.getValues('email'), field.value);
                              }}
                            />
                          </FormControl>
                          {validationErrors.phoneNumber && (
                            <p className="text-sm text-destructive">{validationErrors.phoneNumber}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.email')} *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder={t('admin.clientForm.placeholders.email')}
                              className={`${validationErrors.email ? 'border-destructive' : ''} ${isRTL ? 'text-right' : ''}`}
                              onBlur={async () => {
                                await checkDuplicates(field.value, form.getValues('phoneNumber'));
                              }}
                            />
                          </FormControl>
                          {validationErrors.email && (
                            <p className="text-sm text-destructive">{validationErrors.email}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Job Title */}
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.jobTitle')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('admin.clientForm.placeholders.jobTitle')} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Age */}
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
                              placeholder={t('admin.clientForm.placeholders.age')}
                              className={isRTL ? 'text-right' : ''}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.gender')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''}>
                                <SelectValue placeholder={t('admin.clientForm.selectGender')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                              <SelectItem value="Male">{t('admin.clientForm.male')}</SelectItem>
                              <SelectItem value="Female">{t('admin.clientForm.female')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* City */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.city')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('admin.clientForm.placeholders.city')} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.clientForm.fields.country')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('admin.clientForm.placeholders.country')} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Guardian Number */}
                    <FormField
                      control={form.control}
                      name="guardianNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t('admin.clientForm.fields.guardianNumber')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('admin.clientForm.guardianTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder={t('admin.clientForm.placeholders.guardianNumber')} className={isRTL ? 'text-right' : ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Product Information Section */}
                <Collapsible open={isEnrollmentDetailsOpen} onOpenChange={setIsEnrollmentDetailsOpen}>
                  <div className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
                        <h2 className="text-lg font-semibold">{t('admin.clientForm.productInfo')}</h2>
                        {isEnrollmentDetailsOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-6">
                        {/* Training Path */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="flex items-center gap-1">
                              {t('admin.clientForm.trainingPath')}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('admin.clientForm.trainingPathTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="pre-designed"
                                  name="trainingPathType"
                                  value="pre-designed"
                                  checked={form.watch('trainingPathType') === 'pre-designed'}
                                  onChange={() => form.setValue('trainingPathType', 'pre-designed')}
                                  className="h-4 w-4"
                                />
                                <Label htmlFor="pre-designed" className="font-normal">
                                  {t('admin.clientForm.preDesignedPath')}
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="custom"
                                  name="trainingPathType"
                                  value="custom"
                                  checked={form.watch('trainingPathType') === 'custom'}
                                  onChange={() => form.setValue('trainingPathType', 'custom')}
                                  className="h-4 w-4"
                                />
                                <Label htmlFor="custom" className="font-normal">
                                  {t('admin.clientForm.customPath')}
                                </Label>
                              </div>
                            </div>

                            {form.watch('trainingPathType') === 'pre-designed' && systemOptions && (
                              <Select
                                value={form.watch('currentPath')}
                                onValueChange={(v) => form.setValue('currentPath', v)}
                              >
                                <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''}>
                                  <SelectValue placeholder={t('admin.clientForm.selectTrainingPath')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {systemOptions.trainingPaths
                                    .filter(p => p.type === 'pre-designed')
                                    .map(path => (
                                      <SelectItem key={path.id} value={path.name}>
                                        {path.name}
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                            )}
                          </div>

                          {/* Time Slots */}
                          <div className="space-y-3">
                            <Label className="flex items-center gap-1">
                              {t('admin.clientForm.timeSlots')}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('admin.clientForm.timeSlotsTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <Select>
                              <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''}>
                                <SelectValue placeholder={t('admin.clientForm.selectTimeSlots')} />
                              </SelectTrigger>
                              <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                                {systemOptions?.timeSlots.map(slot => (
                                  <div
                                    key={slot.id}
                                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                                    onClick={() => {
                                      const selected = form.getValues('selectedTimeSlots') || [];
                                      handleTimeSlotChange(slot.value, !selected.includes(slot.value));
                                    }}
                                  >
                                    <Checkbox
                                      checked={(form.watch('selectedTimeSlots') || []).includes(slot.value)}
                                      onCheckedChange={(checked) => handleTimeSlotChange(slot.value, checked as boolean)}
                                    />
                                    <span className="text-sm">{slot.label}</span>
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            {(form.watch('selectedTimeSlots') || []).length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {form.watch('selectedTimeSlots')?.map(slot => (
                                  <Badge key={slot} variant="secondary" className="gap-1">
                                    {slot}
                                    <button
                                      type="button"
                                      onClick={() => handleTimeSlotChange(slot, false)}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tags, Coordinator, Company */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Tags */}
                          <div className="space-y-3">
                            <Label className="flex items-center gap-1">
                              {t('admin.clientForm.tags')}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('admin.clientForm.tagsTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <TagsSelector
                              tags={systemOptions?.tags || []}
                              selectedTagIds={form.watch('tags') || []}
                              onTagChange={handleTagChange}
                              onTagsUpdated={loadSystemOptions}
                            />
                          </div>

                          {/* Coordinator */}
                          <FormField
                            control={form.control}
                            name="assignedCoordinator"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  {t('admin.clientForm.coordinator')}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{t('admin.clientForm.coordinatorTooltip')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''}>
                                      <SelectValue placeholder={t('admin.clientForm.noCoordinator')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">{t('admin.clientForm.noBody')}</SelectItem>
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

                          {/* Company */}
                          <FormField
                            control={form.control}
                            name="underCompany"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  {t('admin.clientForm.company')}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{t('admin.clientForm.companyTooltip')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''}>
                                      <SelectValue placeholder={t('admin.clientForm.companyPlaceholder')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">{t('admin.clientForm.none')}</SelectItem>
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
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Extra Information Section */}
                <Collapsible open={isExtraInfoOpen} onOpenChange={setIsExtraInfoOpen}>
                  <div className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold">{t('admin.clientForm.extraInfo')}</h2>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('admin.clientForm.extraInfoTooltip')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsExtraFieldsManagerOpen(true);
                            }}
                            className="gap-1"
                          >
                            <Settings className="h-4 w-4" />
                            {t('admin.clientForm.manageFields')}
                          </Button>
                          {isExtraInfoOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-6 pb-6">
                        {extraFields.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            {t('admin.clientForm.noExtraFields')}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {extraFields.map(field => {
                              const fieldLabel = isRTL
                                ? field.titleAr || field.titleEn || field.title
                                : field.titleEn || field.title || field.titleAr;
                              return (
                              <div key={field.id} className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  {fieldLabel}
                                  {field.isMandatory && <span className="text-destructive">*</span>}
                                  {field.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{field.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </Label>
                                {renderExtraFieldInput(field)}
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Notes */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.clientForm.notes')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('admin.clientForm.placeholders.notes')}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Create Account Checkbox */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <FormField
                    control={form.control}
                    name="createAccount"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="flex items-center gap-2 cursor-pointer">
                            {t('admin.clientForm.createAccount')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{t('admin.clientForm.createAccountTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {t('admin.clientForm.createAccountDescription')}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t('admin.clientForm.addClient')}
                  </Button>
                  <span className="text-muted-foreground">{t('admin.clientForm.or')}</span>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSubmitting || !isFormValid}
                    onClick={form.handleSubmit((data) => onSubmit(data, true))}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('admin.clientForm.saveAndAddAnother')}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </main>
      </div>

      {/* Extra Fields Manager Dialog */}
      <ExtraFieldsManager
        open={isExtraFieldsManagerOpen}
        onClose={() => setIsExtraFieldsManagerOpen(false)}
        onFieldsChange={loadExtraFields}
      />
    </div>
  );
};

export default AddNewClient;