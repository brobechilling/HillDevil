import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionStore } from "@/store/sessionStore";
import { UtensilsCrossed, Mail, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AuthenticationRequest } from '@/dto/auth.dto';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/authApi';
import { getRestaurantsByOwner } from '@/api/restaurantApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSession } = useSessionStore.getState();

  const loginMutation = useMutation({
  mutationFn: login,
  onSuccess: async (data) => {
    setSession(data.user, data.accessToken);

    switch (data.user.role.name) {
      case "RESTAURANT_OWNER":
        try {
          const restaurants = await getRestaurantsByOwner(data.user.userId);
          if (restaurants.length === 0) {
            navigate('/');
            // navigate('/register/package');
          } else if (restaurants.length === 1) {
            localStorage.setItem('selected_restaurant', JSON.stringify(restaurants[0]));
            navigate('/dashboard/owner');
          } else {
            localStorage.setItem('user_restaurants', JSON.stringify(restaurants));
            navigate('/brand-selection');
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load restaurant information. Please try again.",
            variant: "destructive",
          });
        }
        return;
      case "ADMIN":
        navigate('/dashboard/admin');
        return;
      default:
        navigate('/dashboard');
        return;
    }
  },
  onError: () => {
    toast({
      title: "Login Failed",
      description: "Invalid email or password. Please try again.",
      variant: "destructive",
    });
  },
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authenticationRequest: AuthenticationRequest = {
      email: email,
      password: password
    };
    loginMutation.mutate(authenticationRequest);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 via-purple-500/3 to-pink-500/3 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <Card className="w-full max-w-md shadow-2xl backdrop-blur-xl bg-card/95 border-2 relative z-10 animate-scale-in">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-t-lg" />

        <CardHeader className="space-y-4 text-center relative">
          {/* Animated logo container */}
          <div className="mx-auto relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse" />

            {/* Logo */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-bounce-in">
              <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your <span className="font-semibold text-primary">HillDevilOS</span> account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className={cn(
                  "absolute left-3 top-3 h-4 w-4 transition-all duration-300",
                  focusedField === 'email' ? "text-primary scale-110" : "text-muted-foreground"
                )} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "pl-10 transition-all duration-300 h-11",
                    focusedField === 'email' && "ring-2 ring-primary/20 border-primary"
                  )}
                  required
                />
                {/* Animated bottom border */}
                {/* <div className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-300",
                  focusedField === 'email' ? "w-full" : "w-0"
                )} /> */}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline transition-all hover:translate-x-0.5 inline-flex items-center gap-1 group"
                >
                  Forgot password?
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="relative group">
                <Lock className={cn(
                  "absolute left-3 top-3 h-4 w-4 transition-all duration-300",
                  focusedField === 'password' ? "text-primary scale-110" : "text-muted-foreground"
                )} />
                <Input
                  id="password"
                  type="password"
                  placeholder="sieumatkhauvippro"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "pl-10 transition-all duration-300 h-11",
                    focusedField === 'password' && "ring-2 ring-primary/20 border-primary"
                  )}
                  required
                />
                {/* Animated bottom border */}
                {/* <div className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-300",
                  focusedField === 'password' ? "w-full" : "w-0"
                )} /> */}
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary via-purple-600 to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-500 relative group overflow-hidden animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
              disabled={loginMutation.isPending}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

              <span className="relative z-10 font-semibold">
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </span>
            </Button>

            {/* Divider */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 hover:bg-accent hover:border-primary/50 transition-all duration-300 group relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: '600ms' }}
              disabled={loginMutation.isPending}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <svg className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
              <span className="relative z-10">Sign in with Google</span>
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '700ms' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline inline-flex items-center gap-1 group transition-all">
              Sign up
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </p>

          {/* Staff Login */}
          <div className="mt-6 text-center space-y-3 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-dashed border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Staff Access</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full h-11 bg-secondary/50 hover:bg-secondary transition-all duration-300 group relative overflow-hidden"
              onClick={() => navigate('/restaurant-login')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Restaurant Staff Login
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(20px) rotate(-5deg);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .bg-size-200 {
          background-size: 200% auto;
        }

        .bg-pos-0 {
          background-position: 0% center;
        }

        .bg-pos-100 {
          background-position: 100% center;
        }
      `}</style>
    </div>
  );
};

export default Login;