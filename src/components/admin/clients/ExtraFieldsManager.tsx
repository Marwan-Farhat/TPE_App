import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, X, Info, Search } from 'lucide-react';
import { format } from 'date-fns';

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
  const { toast } = useToast();
  const [fields, setFields] = useState<ExtraField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<ExtraField | null>(null);
  const [deleteField, setDeleteField] = useState<ExtraField | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateExtraFieldPayload>({
    title: '',
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
    if (!formData.title.trim()) {
      toast({ title: 'Field name is required', variant: 'destructive' });
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

    const payload: CreateExtraFieldPayload = {
      ...formData,
      code: formData.code || formData.title.toLowerCase().replace(/\s+/g, '_'),
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
    loadFields();
  };

  const handleMoveDown = async (index: number) => {
    if (index === fields.length - 1) return;
    await extraFieldService.reorder(index, index + 1);
    loadFields();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Extra information manager: <span className="text-primary underline">Clients</span>
            </DialogTitle>
          </DialogHeader>

          {/* Info Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Here you can manage and add to the "Clients" extra information. "Extra information" can help you extend the amount of data you can add to this type of content.
            </p>
          </div>

          {/* Add New Field Button */}
          <div className="flex justify-end">
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add new field
            </Button>
          </div>

          {/* Fields Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">#</th>
                  <th className="text-left p-3 text-sm font-medium">Field</th>
                  <th className="text-left p-3 text-sm font-medium">Information type</th>
                  <th className="text-left p-3 text-sm font-medium">Default value</th>
                  <th className="text-left p-3 text-sm font-medium">Created at</th>
                  <th className="p-3 text-sm font-medium w-20"></th>
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
                            {field.title}
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
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Field Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit field' : 'New information field'}
            </DialogTitle>
            <DialogDescription>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
                Here you can add a new extra information field. Pick a name for the field, a type, and a default value (optional).
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Field Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Field *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Field name"
              />
            </div>

            {/* Default Value */}
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default value</Label>
              <Input
                id="defaultValue"
                value={formData.defaultValue?.toString() || ''}
                onChange={e => setFormData({ ...formData, defaultValue: e.target.value })}
                placeholder="Default value"
              />
              <p className="text-xs text-muted-foreground">
                The default value for this new information field
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Field description"
                rows={2}
              />
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="Unique code"
              />
              <p className="text-xs text-muted-foreground">
                The unique code for this field
              </p>
            </div>

            {/* Information Type */}
            <div className="space-y-2 col-span-2">
              <Label>Information type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ExtraFieldType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
                <Label>Options (one per line)</Label>
                <Textarea
                  value={optionsText}
                  onChange={e => setOptionsText(e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={4}
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
                    Allow owner to edit this information
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
                    Field is searchable
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
                    Mandatory field
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
              {editingField ? 'Update' : '✓ Add'}
            </Button>
            <Button variant="destructive" onClick={() => setIsAddDialogOpen(false)}>
              ✕ Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteField} onOpenChange={() => setDeleteField(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteField?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExtraFieldsManager;