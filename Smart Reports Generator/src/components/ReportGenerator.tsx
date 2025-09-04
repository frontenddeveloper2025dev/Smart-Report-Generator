import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRecordsStore } from '@/store/records-store';
import { useReportsStore } from '@/store/reports-store';
import { 
  Loader2,
  FileText,
  Calendar,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ReportGenerator() {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last week
    return date.toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { records } = useRecordsStore();
  const { generateReport, isGenerating } = useReportsStore();
  const { toast } = useToast();

  // Filter records for the selected period
  const periodRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    return recordDate >= startDate && recordDate <= endDate;
  });

  const completedCount = periodRecords.filter(r => r.category === 'completed').length;
  const inProgressCount = periodRecords.filter(r => r.category === 'in_progress').length;
  const nextPlanCount = periodRecords.filter(r => r.category === 'next_plan').length;

  const handleGenerateReport = async () => {
    if (periodRecords.length === 0) {
      toast({
        title: 'No records found',
        description: 'No work records found for the selected period. Please add some records first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await generateReport(
        periodRecords.map(r => r._id),
        reportType,
        periodStart,
        periodEnd
      );
      
      toast({
        title: 'Report generated successfully!',
        description: `Your ${reportType} report has been created with AI insights.`,
      });
      
    } catch (error) {
      toast({
        title: 'Failed to generate report',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleQuickPeriod = (type: 'week' | 'month') => {
    const today = new Date();
    let start: Date;
    
    if (type === 'week') {
      start = new Date(today);
      start.setDate(today.getDate() - 7);
      setReportType('weekly');
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      setReportType('monthly');
    }
    
    setPeriodStart(start.toISOString().split('T')[0]);
    setPeriodEnd(today.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            AI-Powered Report Configuration
          </CardTitle>
          <CardDescription>
            Configure your report parameters and let AI analyze your work patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Period Selection */}
          <div className="space-y-3">
            <Label>Quick Period Selection</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPeriod('week')}
                className="flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPeriod('month')}
                className="flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                This Month
              </Button>
            </div>
          </div>

          <Separator />

          {/* Manual Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">📅 Weekly Report</SelectItem>
                  <SelectItem value="monthly">📊 Monthly Report</SelectItem>
                  <SelectItem value="quarterly">📈 Quarterly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Period Start</Label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Period End</Label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Preview Statistics
          </CardTitle>
          <CardDescription>
            Data that will be included in your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          {periodRecords.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No data for selected period</h3>
              <p className="text-muted-foreground">
                Please adjust the date range or add work records for this period
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{periodRecords.length}</div>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-accent">{completedCount}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 bg-chart-3/10 rounded-lg">
                <div className="text-2xl font-bold text-chart-3">{inProgressCount}</div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{nextPlanCount}</div>
                <p className="text-sm text-muted-foreground">Next Plans</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Analysis Features
          </CardTitle>
          <CardDescription>
            What our AI will analyze and include in your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm">Smart categorization of work items</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm">Automatic highlight extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm">Progress tracking and analysis</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm">Problem identification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm">Improvement suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm">Professional formatting</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating || periodRecords.length === 0}
          size="lg"
          className="px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}