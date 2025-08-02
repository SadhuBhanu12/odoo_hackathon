import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, Plus, User, Shield, Moon, Sun, LogOut, Settings, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set dark mode as default
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Initialize dark mode on component mount
  useState(() => {
    document.documentElement.classList.add('dark');
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => location.pathname === path;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 w-full glass-morphism border-b border-white/20 shadow-professional-lg">
        <div className="container flex h-16 items-center">
          {/* Enhanced Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group interactive-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-all duration-300 shadow-professional-lg hover:shadow-2xl">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient">
                Civic<span className="text-accent">Track</span>
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Empowering Communities</span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex ml-8 space-x-2">
            <Link
              to="/"
              className={`nav-link px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActivePath('/')
                  ? 'active shadow-professional'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
              }`}
            >
              Feed
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`nav-link px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActivePath('/dashboard')
                    ? 'active shadow-professional'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                My Reports
              </Link>
            )}
          </nav>

          {/* Enhanced Right side actions */}
          <div className="ml-auto flex items-center space-x-3">
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="interactive-hover">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="interactive-hover relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>

            {/* Enhanced Dark mode toggle */}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="interactive-hover">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <>
                {/* Enhanced Report Issue Button */}
                <Button asChild className="hidden sm:inline-flex btn-primary">
                  <Link to="/report">
                    <Plus className="h-4 w-4 mr-2" />
                    Report Issue
                  </Link>
                </Button>

                {/* Enhanced User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full interactive-hover">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                          {getInitials(user.user_metadata?.full_name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 card-glass">
                    <div className="flex items-center justify-start gap-3 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                          {getInitials(user.user_metadata?.full_name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="font-semibold text-foreground">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/10">
                      <Link to="/dashboard">
                        <User className="h-4 w-4 mr-3" />
                        My Reports
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/10">
                      <Link to="/admin">
                        <Shield className="h-4 w-4 mr-3" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer hover:bg-accent/10">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive hover:bg-destructive/10">
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Enhanced Auth Buttons for Non-logged users */
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="btn-secondary">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="btn-primary">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Enhanced Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden interactive-hover"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur-md">
            <div className="space-y-2 px-4 py-4">
              <Link
                to="/"
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActivePath('/') 
                    ? 'bg-primary text-white shadow-professional' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Feed
              </Link>
              <Link
                to="/dashboard"
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActivePath('/dashboard') 
                    ? 'bg-primary text-white shadow-professional' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Reports
              </Link>
              <Link
                to="/report"
                className="block px-4 py-3 rounded-xl text-base font-medium text-primary hover:bg-accent/10 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="h-4 w-4 mr-3 inline" />
                Report Issue
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Enhanced Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-professional">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gradient">
                    Civic<span className="text-accent">Track</span>
                  </span>
                  <p className="text-xs text-muted-foreground">Empowering Communities</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering citizens to report, track, and resolve civic issues in their communities. 
                Together, we build better neighborhoods.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/report" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                    Report Issue
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                    My Reports
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">About</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-300 text-left">
                    How it Works
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-300 text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-300 text-left">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-300 text-left">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-300 text-left">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-300 text-left">
                    Community Guidelines
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 CivicTrack. Making communities better, one report at a time.
            </p>
          </div>
        </div>
      </footer>

      {/* Enhanced Floating Action Button for Mobile */}
      {user && (
        <Link
          to="/report"
          className="fixed bottom-6 right-6 z-40 md:hidden"
        >
          <Button size="lg" className="h-16 w-16 rounded-full shadow-professional-lg cta-button floating">
            <Plus className="h-7 w-7" />
          </Button>
        </Link>
      )}
    </div>
  );
}
