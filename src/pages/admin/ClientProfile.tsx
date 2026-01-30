import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  PhoneCall,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Building,
  Users,
  CreditCard,
  Edit2,
  Key,
  Shield,
  Trash2,
  LogOut,
  RefreshCw,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { clientService, extraFieldService, systemOptionsService, SystemOptions } from '@/services/clientService';
import { Client, ClientStatus } from '@/types/client';
import { ExtraField } from '@/types/extraField';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<ClientStatus, string> = {
  'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Booked a placement test': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Waiting': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'In training': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Completed training': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [systemOptions, setSystemOptions] = useState<SystemOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [forceLogoutDialog, setForceLogoutDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      loadClientData(id);
    }
  }, [id]);

  const loadClientData = async (clientId: string) => {
    setLoading(true);
    try {
      const [clientData, fields, options] = await Promise.all([
        clientService.getById(clientId),
        extraFieldService.getAll(),
        systemOptionsService.getAll(),
      ]);
      setClient(clientData);
      setExtraFields(fields);
      setSystemOptions(options);
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoordinatorName = (coordinatorId?: string) => {
    if (!coordinatorId || !systemOptions) return '-';
    const coord = systemOptions.coordinators.find(c => c.id === coordinatorId);
    return coord ? coord.name : coordinatorId;
  };

  const getTagNames = (tagIds?: string[]) => {
    if (!tagIds || !tagIds.length || !systemOptions) return [];
    return tagIds.map(id => {
      // Try to match by ID first, then by name for backward compatibility
      const tag = systemOptions.tags.find(t => t.id === id || t.name === id);
      return tag ? tag : { id, name: id, color: '#888' };
    });
  };

  const handleDeleteClient = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const success = await clientService.delete(id);
      if (success) {
        toast({
          title: 'Client deleted successfully',
        });
        navigate('/admin/clients');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Error deleting client',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceLogout = async () => {
    if (!id) return;

    setIsProcessing(true);
    try {
      // Simulate force logout API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Client logged out successfully',
        description: 'The client has been logged out from all devices.',
      });
      setForceLogoutDialog(false);
    } catch (error) {
      toast({
        title: 'Error logging out client',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!id || !client) return;

    setIsProcessing(true);
    try {
      // Simulate password reset API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPassword = Math.random().toString(36).slice(-8);
      
      // Update the client data with new password
      const updated = await clientService.update(id, { password: newPassword });
      
      if (updated) {
        setClient({ ...client, password: newPassword });
        toast({
          title: 'Password reset successfully',
          description: `New temporary password: ${newPassword}`,
        });
        setResetPasswordDialog(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: 'Error resetting password',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!id || !client) return;

    setIsProcessing(true);
    try {
      const newStatus = !client.isActive;
      const updated = await clientService.update(id, { isActive: newStatus });
      
      if (updated) {
        setClient({ ...client, isActive: newStatus });
        toast({
          title: newStatus ? 'Account activated' : 'Account deactivated',
          description: newStatus 
            ? 'The client account has been activated successfully.' 
            : 'The client account has been deactivated successfully.',
        });
        setDeactivateDialog(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: 'Error updating account status',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className={`flex-1 ${isRTL ? 'mr-16' : 'ml-16'} p-6`}>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 col-span-2" />
              <Skeleton className="h-64" />
            </div>
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
            <User className="h-16 w-16 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold">Client not found</h2>
            <p className="text-muted-foreground">The client you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/admin/clients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
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
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/admin/clients')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span 
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => navigate('/admin/clients')}
                >
                  Clients
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">{client.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate(`/admin/clients/${id}/edit`)}
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Client</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong>{client.name}</strong>? 
                      This action cannot be undone and will permanently remove all client data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteClient}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Client'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Client Header */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{client.name}</h1>
                    <Badge className={statusColors[client.status as ClientStatus]}>
                      {client.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {client.phoneNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300"
                        onClick={() => window.open(`tel:${client.phoneNumber}`, '_self')}
                        aria-label="Call client"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                        onClick={() => window.open(`https://wa.me/${client.phoneNumber.replace(/\D/g, '')}`, '_blank')}
                        aria-label="WhatsApp client"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12.04 2a9.94 9.94 0 0 0-8.64 14.88L2 22l5.36-1.4A9.94 9.94 0 1 0 12.04 2Zm0 1.86a8.08 8.08 0 0 1 0 16.16 8.06 8.06 0 0 1-4.08-1.1l-.3-.18-3.17.83.85-3.08-.2-.32a8.05 8.05 0 0 1-1.2-4.2 8.09 8.09 0 0 1 8.1-8.11Zm4.65 10.72c-.25-.12-1.46-.72-1.69-.8-.23-.08-.4-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.24-.74-.65-1.24-1.45-1.39-1.7-.14-.25-.02-.38.1-.5.11-.11.25-.29.38-.43.12-.14.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.05-.64.25-.22.25-.84.82-.84 2.01s.86 2.34.98 2.5c.12.16 1.7 2.6 4.11 3.64.57.24 1.03.39 1.38.5.57.18 1.09.15 1.5.09.46-.07 1.48-.61 1.69-1.2.21-.58.21-1.08.15-1.2-.06-.12-.22-.18-.47-.3Z" />
                        </svg>
                      </Button>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      ID: {client.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Personal & Product Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow icon={User} label="Name" value={client.name} />
                      <InfoRow icon={Phone} label="Phone" value={client.phoneNumber} />
                      <InfoRow icon={Mail} label="Email" value={client.email} />
                      <InfoRow icon={Briefcase} label="Job Title" value={client.jobTitle} />
                      <InfoRow label="Age" value={client.age?.toString()} />
                      <InfoRow label="Gender" value={client.gender} />
                      <InfoRow icon={MapPin} label="City" value={client.city} />
                      <InfoRow label="Country" value={client.country} />
                      <InfoRow icon={Phone} label="Guardian Number" value={client.guardianNumber} />
                    </div>
                  </CardContent>
                </Card>

                {/* Product Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Product Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow label="Current Path" value={client.currentPath} />
                      <InfoRow label="Current Program" value={client.currentProgram} />
                      <InfoRow label="Program Type" value={client.programType} />
                      <InfoRow label="Source" value={client.source} />
                      <InfoRow icon={CreditCard} label="Path Cost" value={client.pathCost ? `$${client.pathCost}` : undefined} />
                      <InfoRow label="Paid for Path" value={client.paidForPath ? `$${client.paidForPath}` : undefined} />
                      <InfoRow label="Remaining" value={client.remainingForPath ? `$${client.remainingForPath}` : undefined} />
                      <InfoRow label="Total Paid Ever" value={client.totalPaidEver ? `$${client.totalPaidEver}` : undefined} />
                      <InfoRow icon={Users} label="Coordinator" value={getCoordinatorName(client.assignedCoordinator)} />
                      <InfoRow icon={Building} label="Company" value={client.underCompany} />
                    </div>

                    {/* Tags */}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getTagNames(client.tags).length > 0 ? (
                          getTagNames(client.tags).map((tag) => (
                            <Badge 
                              key={tag.id}
                              style={{ backgroundColor: tag.color }}
                              className="text-white"
                            >
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No tags</span>
                        )}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Selected Time Slots
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {client.selectedTimeSlots && client.selectedTimeSlots.length > 0 ? (
                          client.selectedTimeSlots.map((slot) => (
                            <Badge key={slot} variant="secondary">
                              {slot}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No time slots selected</span>
                        )}
                      </div>
                    </div>

                    {/* Training Days */}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preferred Training Days</label>
                      <div className="flex flex-wrap gap-2">
                        {client.preferredTrainingDays && client.preferredTrainingDays.length > 0 ? (
                          client.preferredTrainingDays.map((day) => (
                            <Badge key={day} variant="outline">
                              {day}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No days selected</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Extra Fields */}
                {extraFields.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Extra Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {extraFields.map((field) => (
                          <InfoRow 
                            key={field.id}
                            label={field.title}
                            value={(client as any).extraFields?.[field.id]?.toString() || field.defaultValue?.toString()}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - System Account & Status History */}
              <div className="space-y-6">
                {/* System Account */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Account
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <Badge variant={client.isActive ? 'default' : 'secondary'}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Separator />
                    <InfoRow icon={User} label="Username" value={client.username} />
                    <InfoRow icon={Key} label="Initial Password" value={client.password || undefined} />
                    <InfoRow icon={Calendar} label="Created At" value={format(new Date(client.createdAt), 'MMM d, yyyy HH:mm')} />
                    <InfoRow label="Created By" value={client.addedBy?.userId} />
                    <InfoRow label="Last Login" value="-" />
                    <InfoRow label="Last Activity" value="-" />
                    
                    <Separator />
                    <div className="space-y-3 pt-3">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Account Actions</p>
                      <div className="grid grid-cols-2 gap-2 max-w-[320px] mx-auto justify-items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-center h-10 text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 dark:from-blue-950/40 dark:to-blue-900/20 dark:hover:from-blue-900/50 dark:hover:to-blue-800/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm hover:shadow transition-all duration-200 truncate"
                          onClick={() => setForceLogoutDialog(true)}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Force Logout
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-center h-10 text-sm font-medium bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 dark:from-purple-950/40 dark:to-purple-900/20 dark:hover:from-purple-900/50 dark:hover:to-purple-800/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-sm hover:shadow transition-all duration-200 truncate"
                          onClick={() => setResetPasswordDialog(true)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`col-span-2 w-full justify-center h-10 text-sm font-medium shadow-sm hover:shadow transition-all duration-200 truncate ${
                            client.isActive 
                              ? 'bg-gradient-to-r from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 dark:from-red-950/40 dark:to-red-900/20 dark:hover:from-red-900/50 dark:hover:to-red-800/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' 
                              : 'bg-gradient-to-r from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 dark:from-green-950/40 dark:to-green-900/20 dark:hover:from-green-900/50 dark:hover:to-green-800/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                          }`}
                          onClick={() => setDeactivateDialog(true)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {client.isActive ? 'Deactivate Account' : 'Activate Account'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {client.statusHistory && client.statusHistory.length > 0 ? (
                        client.statusHistory.slice().reverse().map((history, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{history.status}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(history.changedAt), 'MMM d, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No status history</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Force Logout Dialog */}
        <AlertDialog open={forceLogoutDialog} onOpenChange={setForceLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Force Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to force logout <strong>{client.name}</strong>? 
                This will log them out from all devices immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleForceLogout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Logging out...' : 'Force Logout'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reset Password Dialog */}
        <AlertDialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reset the password for <strong>{client.name}</strong>? 
                A new temporary password will be generated and displayed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetPassword}
                disabled={isProcessing}
              >
                {isProcessing ? 'Resetting...' : 'Reset Password'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Deactivate/Activate Account Dialog */}
        <AlertDialog open={deactivateDialog} onOpenChange={setDeactivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {client.isActive ? 'Deactivate Account' : 'Activate Account'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {client.isActive ? (
                  <>
                    Are you sure you want to deactivate the account for <strong>{client.name}</strong>? 
                    They will not be able to log in until the account is reactivated.
                  </>
                ) : (
                  <>
                    Are you sure you want to activate the account for <strong>{client.name}</strong>? 
                    They will be able to log in again.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateAccount}
                disabled={isProcessing}
                className={client.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
              >
                {isProcessing ? 'Processing...' : (client.isActive ? 'Deactivate' : 'Activate')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

// Helper component for info rows
const InfoRow = ({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon?: React.ComponentType<{ className?: string }>;
  label: string; 
  value?: string | null;
}) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </label>
    <p className="text-sm font-medium">{value || '-'}</p>
  </div>
);

export default ClientProfile;
