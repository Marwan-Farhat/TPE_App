import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, X, Info, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ExtraField, ExtraFieldType, CreateExtraFieldPayload, ExtraFieldOption } from '@/types/extraField';
import { extraFieldService } from '@/services/clientService';
import { useToast } from '@/hooks/use-toast';
import useLanguage from '@/hooks/useLanguage';

interface ExtraFieldsManagerProps {
  open: boolean;
  onClose: () => void;
  onFieldsChange?: () => void;
}

const fieldTypeOptions: { value: ExtraFieldType; label: string }[] = [
  { value: 'text', label: 'Text/number' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes / No' },
  { value: 'options', label: 'Options' },
  { value: 'longText', label: 'Long Text' },
  { value: 'phoneNumber', label: 'Phone number' },
  { value: 'email', label: 'Email Address' },
  { value: 'dateTime', label: 'Date & Time' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
];

const ExtraFieldsManager = ({ open, onClose, onFieldsChange }: ExtraFieldsManagerProps) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [fields, setFields] = useState<ExtraField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<ExtraField | null>(null);
  const [deleteField, setDeleteField] = useState<ExtraField | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateExtraFieldPayload>({
    title: '',
    titleEn: '',
    titleAr: '',
    description: '',
    type: 'text',
    code: '',
    defaultValue: '',
    options: [],
    isMandatory: false,
    isSearchable: false,
    allowOwnerEdit: false,
  });
  const [optionsText, setOptionsText] = useState('');

  useEffect(() => {
    if (open) {
      loadFields();
    }
  }, [open]);

  const loadFields = async () => {
    setLoading(true);
    try {
      const data = await extraFieldService.getAll();
      setFields(data);
    } catch (error) {
      toast({ title: 'Error loading fields', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      titleAr: '',
      description: '',
      type: 'text',
      code: '',
      defaultValue: '',
      options: [],
      isMandatory: false,
      isSearchable: false,
      allowOwnerEdit: false,
    });
    setOptionsText('');
    setEditingField(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (field: ExtraField) => {
    setEditingField(field);
    setFormData({
      title: field.title,
      titleEn: field.titleEn || field.title || '',
      titleAr: field.titleAr || '',
      description: field.description || '',
      type: field.type,
      code: field.code,
      defaultValue: field.defaultValue,
      options: field.options || [],
      isMandatory: field.isMandatory,
      isSearchable: field.isSearchable,
      allowOwnerEdit: field.allowOwnerEdit,
    });
    setOptionsText(field.options?.map(o => o.label).join('\n') || '');
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.titleEn?.trim()) {
      toast({ title: t('admin.extraFieldsManager.fieldNameEnRequired'), variant: 'destructive' });
      return;
    }
    if (!formData.titleAr?.trim()) {
      toast({ title: t('admin.extraFieldsManager.fieldNameArRequired'), variant: 'destructive' });
      return;
    }

    // Parse options if type is 'options'
    let parsedOptions: ExtraFieldOption[] = [];
    if (formData.type === 'options' && optionsText.trim()) {
      parsedOptions = optionsText
        .split('\n')
        .filter(line => line.trim())
        .map(line => ({
          value: line.trim().toLowerCase().replace(/\s+/g, '_'),
          label: line.trim(),
        }));
    }

    const baseTitle = formData.titleEn || formData.titleAr || formData.title || '';
    const payload: CreateExtraFieldPayload = {
      ...formData,
      title: baseTitle,
      code: formData.code || baseTitle.toLowerCase().replace(/\s+/g, '_'),
      options: parsedOptions.length > 0 ? parsedOptions : undefined,
    };

    try {
      if (editingField) {
        await extraFieldService.update(editingField.id, payload);
        toast({ title: 'Field updated successfully' });
      } else {
        const isDuplicate = await extraFieldService.checkDuplicateCode(payload.code);
        if (isDuplicate) {
          toast({ title: 'A field with this code already exists', variant: 'destructive' });
          return;
        }
        await extraFieldService.create(payload);
        toast({ title: 'Field created successfully' });
      }

      loadFields();
      onFieldsChange?.();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Error saving field', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteField) return;

    try {
      await extraFieldService.delete(deleteField.id);
      toast({ title: 'Field deleted successfully' });
      loadFields();
      onFieldsChange?.();
      setDeleteField(null);
    } catch (error) {
      toast({ title: 'Error deleting field', variant: 'destructive' });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    await extraFieldService.reorder(index, index - 1);
    await loadFields();
    onFieldsChange?.();
  };

  const handleMoveDown = async (index: number) => {
    if (index === fields.length - 1) return;
    await extraFieldService.reorder(index, index + 1);
    await loadFields();
    onFieldsChange?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`max-w-4xl max-h-[85vh] overflow-hidden flex flex-col ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t('admin.extraFieldsManager.title')}: <span className="text-primary underline">{t('admin.extraFieldsManager.subtitle')}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Info Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              {t('admin.extraFieldsManager.description')}
            </p>
          </div>

          {/* Add New Field Button */}
          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.extraFieldsManager.addNewField')}
            </Button>
          </div>

          {/* Fields Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-sm font-medium border-b bg-slate-100 dark:bg-slate-900`}>#</th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-sm font-medium border-b bg-slate-100 dark:bg-slate-900`}>{t('admin.extraFieldsManager.field')}</th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-sm font-medium border-b bg-slate-100 dark:bg-slate-900`}>{t('admin.extraFieldsManager.informationType')}</th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-sm font-medium border-b bg-slate-100 dark:bg-slate-900`}>{t('admin.extraFieldsManager.defaultValue')}</th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} p-3 text-sm font-medium border-b bg-slate-100 dark:bg-slate-900`}>{t('admin.extraFieldsManager.createdAt')}</th>
                  <th className="p-3 text-sm font-medium w-20 border-b bg-slate-100 dark:bg-slate-900"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : fields.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No extra fields defined yet
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => (
                    <tr key={field.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span>{index + 1}</span>
                          {field.isSearchable && (
                            <Search className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {isRTL ? field.titleAr || field.titleEn || field.title : field.titleEn || field.title || field.titleAr}
                            {field.allowOwnerEdit && (
                              <Edit2 className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div>
                          <span className="capitalize">
                            {fieldTypeOptions.find(t => t.value === field.type)?.label || field.type}
                          </span>
                          {field.type === 'options' && field.options && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {field.options.map(o => (
                                <span key={o.value} className="mr-2">⊙ {o.label}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {field.defaultValue?.toString() || '--'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {format(new Date(field.createdAt), 'MM/dd, hh:mm a')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === fields.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditDialog(field)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteField(field)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              {t('admin.extraFieldsManager.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Field Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className={`max-w-xl max-h-[90vh] overflow-y-auto ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {editingField ? t('admin.extraFieldsManager.editField') : t('admin.extraFieldsManager.newField')}
            </DialogTitle>
            <DialogDescription>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
                {t('admin.extraFieldsManager.newFieldDescription')}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Field Title (EN) */}
            <div className="space-y-2">
              <Label htmlFor="titleEn">{t('admin.extraFieldsManager.fieldNameEn')} *</Label>
              <Input
                id="titleEn"
                value={formData.titleEn || ''}
                onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder={t('admin.extraFieldsManager.fieldNameEn')}
                className={isRTL ? 'text-right' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Field Title (AR) */}
            <div className="space-y-2">
              <Label htmlFor="titleAr">{t('admin.extraFieldsManager.fieldNameAr')} *</Label>
              <Input
                id="titleAr"
                value={formData.titleAr || ''}
                onChange={e => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder={t('admin.extraFieldsManager.fieldNameAr')}
                className={isRTL ? 'text-right' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Default Value */}
            <div className="space-y-2">
              <Label htmlFor="defaultValue">{t('admin.extraFieldsManager.defaultValueLabel')}</Label>
              <Input
                id="defaultValue"
                value={formData.defaultValue?.toString() || ''}
                onChange={e => setFormData({ ...formData, defaultValue: e.target.value })}
                placeholder={t('admin.extraFieldsManager.defaultValue')}
                className={isRTL ? 'text-right' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.extraFieldsManager.defaultValueHelper')}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('admin.extraFieldsManager.fieldDescription')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('admin.extraFieldsManager.fieldDescriptionPlaceholder')}
                rows={2}
                className={isRTL ? 'text-right' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">{t('admin.extraFieldsManager.code')}</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('admin.extraFieldsManager.code')}
                className={isRTL ? 'text-right' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.extraFieldsManager.codeHelper')}
              </p>
            </div>

            {/* Information Type */}
            <div className="space-y-2 col-span-2">
              <Label>{t('admin.extraFieldsManager.fieldType')} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ExtraFieldType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : ''}>
                  <SelectValue placeholder={t('admin.clientForm.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                  {fieldTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(`admin.extraFieldsManager.fieldTypes.${option.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The type of this new information, the nature of the content the user should provide
              </p>
            </div>

            {/* Options textarea (only for 'options' type) */}
            {formData.type === 'options' && (
              <div className="space-y-2 col-span-2">
                <Label>{t('admin.extraFieldsManager.fieldTypes.options')} (one per line)</Label>
                <Textarea
                  value={optionsText}
                  onChange={e => setOptionsText(e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={4}
                  className={isRTL ? 'text-right' : ''}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            )}

            {/* Checkboxes */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="allowOwnerEdit"
                  checked={formData.allowOwnerEdit}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, allowOwnerEdit: checked as boolean })
                  }
                />
                <div>
                  <Label htmlFor="allowOwnerEdit" className="cursor-pointer font-medium">
                    {t('admin.extraFieldsManager.allowOwnerEdit')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    The owner (client or instructor) can modify and update this field value from his account anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="isSearchable"
                  checked={formData.isSearchable}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isSearchable: checked as boolean })
                  }
                />
                <div>
                  <Label htmlFor="isSearchable" className="cursor-pointer font-medium">
                    {t('admin.extraFieldsManager.isSearchable')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show this field in filtering/search options
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="isMandatory"
                  checked={formData.isMandatory}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isMandatory: checked as boolean })
                  }
                />
                <div>
                  <Label htmlFor="isMandatory" className="cursor-pointer font-medium">
                    {t('admin.extraFieldsManager.isMandatory')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This field must be filled when creating a client
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="default" onClick={handleSave}>
              {editingField ? t('admin.extraFieldsManager.save') : '✓ ' + t('admin.extraFieldsManager.add')}
            </Button>
            <Button variant="destructive" onClick={() => setIsAddDialogOpen(false)}>
              {t('admin.extraFieldsManager.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteField} onOpenChange={() => setDeleteField(null)}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.extraFieldsManager.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.extraFieldsManager.deleteMessage').replace('{field}', deleteField?.title || '')} {deleteField?.title}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.extraFieldsManager.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('admin.extraFieldsManager.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExtraFieldsManager;