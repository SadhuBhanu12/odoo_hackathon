import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle, Shield, Users, TrendingUp, BarChart3 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 card-professional">
          <div className="space-y-6">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-accent/20 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-3xl font-bold text-gradient">Account Created!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Please check your email to verify your account before signing in.
            </p>
            <Button asChild className="w-full btn-primary">
              <Link to="/login">Continue to Sign In</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
          <p className="text-muted-foreground leading-relaxed">Join the community making cities better</p>
        </div>

        {/* Enhanced Signup Form */}
        <Card className="card-professional shadow-professional-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Get started with reporting and tracking civic issues
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
                <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="input-professional"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-professional"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="input-professional pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 interactive-hover"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                  className="mt-1 text-primary"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 font-medium">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary py-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Already have an account?{' '}
              </span>
              <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-300">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Features */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Why join CivicTrack?</p>
          <div className="grid grid-cols-2 gap-4">
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
              <span className="text-xs font-medium text-foreground">Connect Community</span>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <BarChart3 className="h-6 w-6 text-success mx-auto mb-2" />
              <span className="text-xs font-medium text-foreground">View Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
