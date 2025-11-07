import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Mail, Lock, ArrowLeft, KeyRound, Eye, EyeOff, } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useForgetPassword, useValidateOTP, useVerifyMail } from '@/hooks/queries/useUsers';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/dto/apiResponse';

const ForgotPassword = () => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  const { toast } = useToast();
  const navigate = useNavigate();

  const verifyMailMutation = useVerifyMail();
  const validateOTPMutation = useValidateOTP();
  const forgetPasswordMutation = useForgetPassword();

  const isLoading = verifyMailMutation.isPending || validateOTPMutation.isPending;

  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOTP = async () => {
    if (!isValidEmail(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    if (timer > 0) 
      return;

    verifyMailMutation.mutate(
      { mail: email, name: 'User' },
      {
        onSuccess: () => {
          toast({
            title: 'OTP Sent!',
            description: 'Check your email for the OTP code.',
          });
          setTimer(60);
        },
        onError: () =>
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to send OTP. Please try again.',
          }),
      }
    );
  };

  const handleValidateOTP = async () => {
    if (!otp) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your OTP.',
      });
      return;
    }

    validateOTPMutation.mutate(
      { email, otp },
      {
        onSuccess: (data) => {
          if (data) {
            setEmailVerified(true);
            toast({
              variant: "default",
              title: 'Email Verified!',
              description: 'You can now reset your password.',
            });
            setOtp('');
          } else {
            toast({
              variant: 'destructive',
              title: 'Invalid OTP',
              description: 'Please check your OTP and try again.',
            });
          }
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to verify OTP.',
          });
        },
      }
    );
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your password and confirm password.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
      });
      return;
    }

    forgetPasswordMutation.mutate(
      { password: newPassword, email: email },
      {
        onSuccess: (data) => {
          if (data) {
            toast({
              title: 'Password Reset Successful',
              description: 'You can now log in with your new password.',
            });
            navigate('/login');
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to reset password.',
            });
          }
        },
        onError(error: AxiosError<ApiResponse<null>>) {
          const message = error.response?.data?.message || "Unexpected error occured. Please try again";
          toast({
            variant: "destructive",
            title: "Error",
            description: message,
          });
        },
      }
    );
  };

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleBackToEmail = () => {
    setEmailVerified(false);
    setEmail("");
    setTimer(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4 relative overflow-hidden">
      <Card className="w-full max-w-md shadow-2xl backdrop-blur-xl bg-card/95 border-2 relative z-10 animate-scale-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-t-lg" />

        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center mt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
              <UtensilsCrossed className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Forgot Password
          </CardTitle>
          <CardDescription>
            {emailVerified ? 'Enter your new password below.' : 'Verify your email to reset your password.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!emailVerified && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail
                    className={cn(
                      'absolute left-3 top-3 h-4 w-4',
                      focusedField === 'email'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>OTP Code</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={timer > 0 || isLoading}
                    className="min-w-[110px]"
                  >
                    {timer > 0 ? `Resend (${timer}s)` : 'Send OTP'}
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleValidateOTP}
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-primary via-purple-600 to-primary"
              >
                Verify OTP
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full h-11 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          )}

          {emailVerified && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={forgetPasswordMutation.isPending}
                className="w-full h-11 bg-gradient-to-r from-primary via-purple-600 to-primary"
              >
                Reset Password
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={handleBackToEmail}
                className="w-full h-11"
              >
                Back to Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
