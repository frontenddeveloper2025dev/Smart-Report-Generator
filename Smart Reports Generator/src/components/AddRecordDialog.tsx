import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRecordsStore } from '@/store/records-store';
import { Loader2 } from 'lucide-react';

interface AddRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddRecordDialog({ open, onOpenChange }: AddRecordDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'completed' as 'completed' | 'in_progress' | 'next_plan',
    priority: 'medium' as 'high' | 'medium' | 'low',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    status: 'active'
  });

  const { addRecord, isLoading } = useRecordsStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your work record',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addRecord({
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined
      });
      
      toast({
        title: 'Work record added',
        description: 'Your work record has been saved successfully',
      });
      
      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        category: 'completed',
        priority: 'medium',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        status: 'active'
      });
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: 'Failed to add record',
        description: 'Please try again or check your connection',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Work Record</DialogTitle>
          <DialogDescription>
            Document your work item or task for report generation
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What did you work on?"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about your work..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                  <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                  <SelectItem value="next_plan">📋 Next Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleInputChange('priority', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="120"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                disabled={isLoading}
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Record'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}