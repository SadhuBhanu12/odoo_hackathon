import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Eye, EyeOff, LogIn, ArrowLeft, Shield, Users, TrendingUp } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 hover:scale-105">
            <ArrowLeft className="h-4 w-4" />
            Back to CivicTrack
          </Link>
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-professional-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gradient">CivicTrack</h1>
              <p className="text-sm text-muted-foreground">Empowering Communities</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">Sign in to report and track civic issues in your community</p>
        </div>

        {/* Enhanced Login Form */}
        <Card className="card-professional shadow-professional-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="card-glass border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-professional"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-professional pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 interactive-hover"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary py-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            <div className="space-y-6">
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                </span>
                <Link to="/signup" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-300">
                  Create account
                </Link>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Features */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Join thousands making their communities better</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
              <span className="text-xs font-medium text-foreground">Report Issues</span>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <Users className="h-6 w-6 text-accent mx-auto mb-2" />
              <span className="text-xs font-medium text-foreground">Track Progress</span>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <TrendingUp className="h-6 w-6 text-warning mx-auto mb-2" />
              <span className="text-xs font-medium text-foreground">Build Community</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
