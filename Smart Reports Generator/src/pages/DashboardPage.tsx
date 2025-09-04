import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { useRecordsStore } from '@/store/records-store';
import { useReportsStore } from '@/store/reports-store';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  LogOut,
  Calendar,
  Search,
  Settings,
  Sparkles,
  Bell
} from 'lucide-react';
import AddRecordDialog from '@/components/AddRecordDialog';
import RecordsList from '@/components/RecordsList';
import ReportGenerator from '@/components/ReportGenerator';
import ReportsHistory from '@/components/ReportsHistory';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ReportSearch from '@/components/ReportSearch';
import TemplateCustomizer from '@/components/TemplateCustomizer';
import TemplateManager from '@/components/TemplateManager';
import { ReminderSystem } from '@/components/ReminderSystem';
import { BatchProcessingGuide } from '@/components/BatchProcessingGuide';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { records, fetchRecords } = useRecordsStore();
  const { reports, fetchReports } = useReportsStore();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'generate' | 'analytics' | 'search' | 'templates' | 'history' | 'reminders'>('records');

  useEffect(() => {
    fetchRecords();
    fetchReports();
  }, [fetchRecords, fetchReports]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Calculate statistics
  const completedCount = records.filter(r => r.category === 'completed').length;
  const inProgressCount = records.filter(r => r.category === 'in_progress').length;
  const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0);
  const recentReports = reports.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Smart Report Generator</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">Work items finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">Active work items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalDuration / 60 * 10) / 10}</div>
              <p className="text-xs text-muted-foreground">Hours logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Professional reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="records" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Records
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Work Records</h2>
                <p className="text-muted-foreground">Manage your daily work items and tasks</p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </div>
            <RecordsList />
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Generate Report</h2>
              <p className="text-muted-foreground">Create professional reports from your work records</p>
            </div>
            <ReportGenerator />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Advanced Analytics</h2>
              <p className="text-muted-foreground">Deep insights into your productivity patterns and trends</p>
            </div>
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Report Search</h2>
              <p className="text-muted-foreground">Find and filter through your generated reports</p>
            </div>
            <ReportSearch />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Template Management</h2>
              <p className="text-muted-foreground">Customize report templates and export formats</p>
            </div>
            
            <Tabs defaultValue="report-templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="report-templates">Report Templates</TabsTrigger>
                <TabsTrigger value="export-templates">Export Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="report-templates" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Report Generation Templates</h3>
                  <p className="text-sm text-muted-foreground">Customize how your reports are structured and generated</p>
                </div>
                <TemplateCustomizer />
              </TabsContent>
              
              <TabsContent value="export-templates" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Export Templates</h3>
                  <p className="text-sm text-muted-foreground">Design custom headers, footers, and styling for exported documents</p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <TemplateManager
                      onSelectTemplate={(template) => {
                        toast({
                          title: "Template Selected",
                          description: `${template.name} is now available for export`,
                        });
                      }}
                      onClose={() => {}}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Report Reminders</h2>
              <p className="text-muted-foreground">Set up automatic reminders to generate reports on schedule</p>
            </div>
            <ReminderSystem />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reports">My Reports</TabsTrigger>
                <TabsTrigger value="batch-guide">Batch Export Guide</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reports" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Report History</h2>
                  <p className="text-muted-foreground">View and manage your generated reports</p>
                </div>
                <ReportsHistory />
              </TabsContent>
              
              <TabsContent value="batch-guide" className="space-y-6">
                <BatchProcessingGuide />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Quick Actions - Show only on records tab */}
        {activeTab === 'records' && recentReports.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Reports
              </CardTitle>
              <CardDescription>Your latest generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {report.report_type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Record Dialog */}
      <AddRecordDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
}