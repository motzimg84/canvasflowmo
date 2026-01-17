// PROJECT: CanvasFlow Pro
// MODULE: Auth Page

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Layers } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot' | 'update-password';

const Auth = () => {
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle deep-link for password update
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'update-password') {
      setMode('update-password');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(t.loginSuccess);
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(t.signupSuccess);
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(t.resetEmailSent);
          setMode('login');
        }
      } else if (mode === 'update-password') {
        if (password !== confirmPassword) {
          toast.error(t.passwordMismatch);
          setLoading(false);
          return;
        }
        const { error } = await updatePassword(password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(t.passwordUpdated);
          setSearchParams({});
          setMode('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup':
        return t.signup;
      case 'forgot':
        return t.resetPassword;
      case 'update-password':
        return t.updatePassword;
      default:
        return t.login;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Layers className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field – not shown on update-password */}
            {mode !== 'update-password' && (
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            )}

            {/* Password field – shown on login, signup, update-password */}
            {(mode === 'login' || mode === 'signup' || mode === 'update-password') && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={mode === 'update-password' ? t.newPassword : t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'update-password' ? 'new-password' : 'current-password'}
                />
              </div>
            )}

            {/* Confirm Password field – only on update-password */}
            {mode === 'update-password' && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t.confirmNewPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loading : getTitle()}
            </Button>
          </form>

          {/* Forgot password link – only on login mode */}
          {mode === 'login' && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                {t.forgotPassword}
              </button>
            </div>
          )}

          {/* Toggle between login and signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? t.signup : t.login}
              </button>
            </div>
          )}

          {/* Back to login link – on forgot and update-password */}
          {(mode === 'forgot' || mode === 'update-password') && (
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setSearchParams({});
                  setMode('login');
                }}
                className="text-primary hover:underline font-medium"
              >
                {t.backToLogin}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
