import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logo from '@/assets/logo.png';
import useLanguage from '@/hooks/useLanguage';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading, error, clearError, user } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = authService.getInterfaceRoute(user.role);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Clear error when form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (error) clearError();
    });
    return () => subscription.unsubscribe();
  }, [form, error, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const credentials = {
        email: data.email,
        password: data.password,
      };
      const success = await login(credentials);
      if (success) {
        // Navigation handled by useEffect
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 relative">
      {/* Back to Home Link */}
      <motion.div
        className="absolute top-6 left-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          {isRTL ? (
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          ) : (
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          )}
          <span className="text-sm font-medium">
            {t('login.backToHome', 'Back to Home')}
          </span>
        </Link>
      </motion.div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <img 
            src={logo} 
            alt="The Pro English" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">
            {t('login.title', 'Welcome Back')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('login.subtitle', 'Sign in to your account')}
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-card border border-border rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email/Username Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      {t('login.email', 'Email or Username')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('login.emailPlaceholder', 'Enter your email or username')}
                          className={`${isRTL ? 'pr-10' : 'pl-10'} h-12`}
                          disabled={isSubmitting}
                          autoComplete="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      {t('login.password', 'Password')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                          className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} h-12`}
                          disabled={isSubmitting}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-white font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('login.signingIn', 'Signing in...')}
                  </>
                ) : (
                  t('login.signIn', 'Sign In')
                )}
              </Button>
            </form>
          </Form>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('login.needHelp', 'Need help? Contact your administrator.')}
          </p>
        </motion.div>

        {/* Dev Mode Credentials */}
        {import.meta.env.DEV && (
          <motion.div
            className="mt-6 p-4 bg-muted/50 rounded-xl border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              🔐 Dev Mode - Test Credentials:
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium">Admin:</span> superadmin@proenglish.com / 123456</p>
              <p><span className="font-medium">Teacher:</span> instructor@proenglish.com / 123456</p>
              <p><span className="font-medium">Client:</span> student@proenglish.com / 123456</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
