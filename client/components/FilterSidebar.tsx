import { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal, Target, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISSUE_CATEGORIES, ISSUE_STATUS, DISTANCE_OPTIONS } from '@/constants/categories';

interface FilterState {
  search: string;
  categories: string[];
  statuses: string[];
  distance: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  issueCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  issueCount,
  isOpen,
  onClose
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...localFilters, ...newFilters };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilters.categories, categoryId]
      : localFilters.categories.filter(id => id !== categoryId);
    updateFilters({ categories: newCategories });
  };

  const handleStatusChange = (statusId: string, checked: boolean) => {
    const newStatuses = checked
      ? [...localFilters.statuses, statusId]
      : localFilters.statuses.filter(id => id !== statusId);
    updateFilters({ statuses: newStatuses });
  };

  const clearAllFilters = () => {
    const cleared = {
      search: '',
      categories: [],
      statuses: [],
      distance: 5
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters = 
    localFilters.search ||
    localFilters.categories.length > 0 ||
    localFilters.statuses.length > 0 ||
    localFilters.distance !== 5;

  return (
    <>
      {/* Enhanced Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Enhanced Sidebar - Removed all spacing */}
      <div className={`
        fixed lg:sticky top-16 left-0 z-50 lg:z-0
        w-80 h-[calc(100vh-4rem)] lg:h-auto
        glass-morphism lg:bg-transparent lg:backdrop-blur-none
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto shadow-professional-xl lg:shadow-none
        border-r border-white/20 lg:border-r-0
        lg:flex-shrink-0
      `}>
        <div className="p-4 space-y-4">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Filters</h2>
                <p className="text-sm text-muted-foreground">Refine your search</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Issue Count */}
          <div className="text-sm text-muted-foreground">
            {issueCount} issues found
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full btn-secondary"
            >
              Clear All Filters
            </Button>
          )}

          {/* Search Issues */}
          <Card className="card-professional">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" />
                Search Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by title or description..."
                value={localFilters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="input-professional"
              />
            </CardContent>
          </Card>

          {/* Distance Range */}
          <Card className="card-professional">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Distance Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={localFilters.distance.toString()}
                onValueChange={(value) => updateFilters({ distance: parseInt(value) })}
                className="space-y-2"
              >
                {DISTANCE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value={option.value.toString()} id={`distance-${option.value}`} />
                    <Label htmlFor={`distance-${option.value}`} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="card-professional">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ISSUE_CATEGORIES.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={localFilters.categories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="card-professional">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ISSUE_STATUS.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={localFilters.statuses.includes(status.id)}
                      onCheckedChange={(checked) => handleStatusChange(status.id, checked as boolean)}
                    />
                    <Label htmlFor={`status-${status.id}`} className="text-sm cursor-pointer">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
