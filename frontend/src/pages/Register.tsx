import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Mail, Lock, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SignupRequest } from '@/dto/user.dto';
import { useRegister } from '@/hooks/queries/useAuth';
import { ApiResponse } from '@/dto/apiResponse';
import { AxiosError } from 'axios';
import { useValidateOTP, useVerifyMail } from '@/hooks/queries/useUsers';

const Register = () => {
  const [formData, setFormData] = useState<SignupRequest>({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState<string>('');
  const verifyMailMutation = useVerifyMail();
  const validateOTPMutation = useValidateOTP();
  const [timer, setTimer] = useState<number>(0);

  const registerMutation = useRegister({
    onSuccess: () => {
      toast({ variant: 'default', title: 'Success', description: 'You have registered successfully.' });
      navigate('/login');
    },
    onError(error: AxiosError<ApiResponse<null>>) {
      const message = error.response?.data?.message || 'Unexpected error occured. Please try again';
      toast({ variant: 'destructive', title: 'Error', description: message });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }
    if (emailVerified) {
      registerMutation.mutate(formData);
    }
    else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your email has not been verified",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === 'email') {
      setEmailVerified(false);
    }

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const handleSendOTP = async () => {
    if (!formData.email || !formData.username) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your name and email before verifying.",
      });
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    if (timer > 0) 
      return;
    verifyMailMutation.mutate(
      {
        mail: formData.email,
        name: formData.username
      },
      {
        onSuccess: () => {
          toast({
            variant: "default",
            title: "OTP sent!",
            description: "Please check your email for the OTP code.",
          });
          setTimer(60);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to send OTP. Please try again.",
          });
        },
      }
    );
  };

  const handleValidateOTP = async () => {
    if (!otp) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your OTP code.",
      });
      return;
    }

    validateOTPMutation.mutate(
      { email: formData.email, otp },
      {
        onSuccess: (data) => {
          // set email verified to be true only when the otp is correct, regardless of the mutation result state
          if (data) {
            setEmailVerified(true);
            toast({
              variant: "default",
              title: "Email verified!",
              description: "You can now complete your registration.",
            });
            setOtp('');
          } else {
            toast({
              variant: "destructive",
              title: "Invalid OTP",
              description: "Please check your code and try again.",
            });
          }
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Verification failed. Please try again.",
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



  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription className="text-base">Start managing your restaurant today</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  placeholder='pizza pho mai'
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  placeholder='sushicahoi@gmail.com'
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Email Verification</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={verifyMailMutation.isPending || !formData.email || !formData.username || timer > 0 || emailVerified}
                  className="whitespace-nowrap"
                >
                  {verifyMailMutation.isPending ? "Sending..." : timer > 0 ? `Resend (${timer}s)` : "Send OTP"}
                </Button>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1"
                  disabled={emailVerified}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleValidateOTP}
                  disabled={validateOTPMutation.isPending || !otp}
                >
                  {validateOTPMutation.isPending ? "Verifying..." : "Verify"}
                </Button>
              </div>
              {emailVerified && (
                <p className="text-green-600 text-sm font-medium mt-1">
                  Email verified
                </p>
              )}
            </div>


            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0909123456"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder='password'
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" variant="hero" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full" disabled={registerMutation.isPending} >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
