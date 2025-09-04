import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Settings,
  Trash2,
  Plus,
  CheckCircle
} from 'lucide-react';

interface Reminder {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  reportType: string;
  enabled: boolean;
  lastTriggered?: string;
  nextTrigger: string;
}

export function ReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newReminder, setNewReminder] = useState<{
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek: number;
    dayOfMonth: number;
    reportType: string;
  }>({
    name: '',
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    reportType: 'weekly',
  });
  const { toast } = useToast();

  // Load reminders from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('report-reminders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReminders(parsed);
      } catch (error) {
        console.error('Failed to load reminders:', error);
      }
    }
  }, []);

  // Save reminders to localStorage
  const saveReminders = (updatedReminders: Reminder[]) => {
    localStorage.setItem('report-reminders', JSON.stringify(updatedReminders));
    setReminders(updatedReminders);
  };

  // Calculate next trigger time
  const calculateNextTrigger = (reminder: Omit<Reminder, 'id' | 'enabled' | 'nextTrigger'>): string => {
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    let nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);

    switch (reminder.frequency) {
      case 'daily':
        if (nextDate <= now) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        break;
      
      case 'weekly':
        const targetDay = reminder.dayOfWeek || 1;
        const currentDay = nextDate.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        
        if (daysUntilTarget === 0 && nextDate <= now) {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (daysUntilTarget > 0) {
          nextDate.setDate(nextDate.getDate() + daysUntilTarget);
        }
        break;
      
      case 'monthly':
        const targetDate = reminder.dayOfMonth || 1;
        nextDate.setDate(targetDate);
        
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(targetDate);
        }
        break;
    }

    return nextDate.toISOString();
  };

  const handleCreateReminder = () => {
    if (!newReminder.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the reminder.",
        variant: "destructive",
      });
      return;
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      ...newReminder,
      enabled: true,
      nextTrigger: calculateNextTrigger(newReminder),
    };

    const updated = [...reminders, reminder];
    saveReminders(updated);
    
    setIsCreating(false);
    setNewReminder({
      name: '',
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      reportType: 'weekly',
    });

    toast({
      title: "Reminder Created",
      description: `"${reminder.name}" reminder has been set up.`,
    });
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(reminder => 
      reminder.id === id 
        ? { 
            ...reminder, 
            enabled: !reminder.enabled,
            nextTrigger: !reminder.enabled ? calculateNextTrigger(reminder) : reminder.nextTrigger
          }
        : reminder
    );
    saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(reminder => reminder.id !== id);
    saveReminders(updated);
    toast({
      title: "Reminder Deleted",
      description: "The reminder has been removed.",
    });
  };

  const formatNextTrigger = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const getFrequencyLabel = (reminder: Reminder): string => {
    switch (reminder.frequency) {
      case 'daily':
        return `Daily at ${reminder.time}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[reminder.dayOfWeek || 1]}s at ${reminder.time}`;
      case 'monthly':
        return `Monthly on the ${reminder.dayOfMonth}${getOrdinalSuffix(reminder.dayOfMonth || 1)} at ${reminder.time}`;
      default:
        return 'Unknown';
    }
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Report Reminders</h2>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Create New Reminder */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-name">Reminder Name</Label>
                <Input
                  id="reminder-name"
                  placeholder="e.g., Weekly Team Report"
                  value={newReminder.name}
                  onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={newReminder.reportType}
                  onValueChange={(value) => setNewReminder({ ...newReminder, reportType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Report</SelectItem>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                    <SelectItem value="project">Project Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newReminder.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setNewReminder({ ...newReminder, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>

              {newReminder.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label htmlFor="day-of-week">Day of Week</Label>
                  <Select
                    value={newReminder.dayOfWeek?.toString()}
                    onValueChange={(value) => setNewReminder({ ...newReminder, dayOfWeek: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newReminder.frequency === 'monthly' && (
                <div className="space-y-2">
                  <Label htmlFor="day-of-month">Day of Month</Label>
                  <Input
                    id="day-of-month"
                    type="number"
                    min="1"
                    max="31"
                    value={newReminder.dayOfMonth}
                    onChange={(e) => setNewReminder({ ...newReminder, dayOfMonth: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateReminder}>
                Create Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Reminders */}
      {reminders.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Reminders Set</h3>
            <p className="text-muted-foreground mb-4">
              Create reminders to automatically prompt you to generate reports on schedule.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{reminder.name}</h3>
                      <Badge variant={reminder.enabled ? "default" : "secondary"}>
                        {reminder.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getFrequencyLabel(reminder)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Next: {formatNextTrigger(reminder.nextTrigger)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">Report Type:</span>
                      <Badge variant="outline">{reminder.reportType}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Note about browser notifications */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Browser Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Reminders currently work when the app is open. For system notifications, 
                ensure your browser allows notifications for this site. This feature 
                will be enhanced in future updates with background scheduling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}