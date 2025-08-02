import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import MapView from '@/components/MapView';
import { Coordinates, getCurrentLocation } from '@/utils/geoUtils';
import { ISSUE_CATEGORIES } from '@/constants/categories';
import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImages } from '@/utils/imageUpload';

interface ReportForm {
  title: string;
  description: string;
  category: string;
  coordinates: Coordinates | null;
  images: File[];
  isAnonymous: boolean;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createIssue } = useIssues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<ReportForm>({
    title: '',
    description: '',
    category: '',
    coordinates: null,
    images: [],
    isAnonymous: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    getCurrentLocation()
      .then((location) => {
        setUserLocation(location);
        setSelectedLocation(location);
        setFormData(prev => ({ ...prev, coordinates: location }));
      })
      .catch(() => {
        // Fallback to NYC for demo
        const fallback = { lat: 40.7589, lng: -73.9851 };
        setUserLocation(fallback);
        setSelectedLocation(fallback);
        setFormData(prev => ({ ...prev, coordinates: fallback }));
      });
  }, []);

  const handleInputChange = (field: keyof ReportForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files).slice(0, 5 - formData.images.length);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const canSubmit = 
    formData.title.trim() && 
    formData.description.trim() && 
    formData.category && 
    formData.coordinates;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images);
      }

      // Create issue
      const { error } = await createIssue({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        coordinates: formData.coordinates!,
        images: imageUrls,
        is_anonymous: formData.isAnonymous,
      });

      if (error) {
        throw new Error(error);
      }

      setIsSubmitted(true);

      // Redirect after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Report Submitted!</h2>
              <p className="text-muted-foreground mb-4">
                Thank you for helping improve your community. Your report has been submitted successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to feed...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Report a Civic Issue</h1>
          <p className="text-muted-foreground">
            Help make your community better by reporting issues that need attention.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      maxLength={60}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ISSUE_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide more details about the issue..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      maxLength={200}
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/200 characters
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="anonymous">Report Anonymously</Label>
                    <Switch
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center transition-colors
                      ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                      ${formData.images.length >= 5 ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (formData.images.length < 5) {
                        document.getElementById('image-upload')?.click();
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">
                      Drop images here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB each (max 5 images)
                    </p>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    The issue location is set to your current position. You can adjust it by clicking on the map.
                  </p>
                  
                  {userLocation && (
                    <MapView
                      issues={[]}
                      center={selectedLocation || userLocation}
                      className="h-64"
                    />
                  )}

                  {selectedLocation && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Selected location:</strong><br />
                        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card>
                <CardContent className="p-6">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                  
                  {!canSubmit && (
                    <Alert className="mt-4">
                      <AlertDescription>
                        Please fill in all required fields: title, category, description, and location.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
