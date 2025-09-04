import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportsStore } from '@/store/reports-store';
import { ExportDialog } from './ExportDialog';
import { BatchExportDialog } from './BatchExportDialog';
import { 
  FileText, 
  Calendar, 
  Eye, 
  Download, 
  Trash2,
  BarChart3,
  Clock,
  TrendingUp,
  Lightbulb,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReportsHistory() {
  const { reports, isLoading, deleteReport, setCurrentReport } = useReportsStore();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBatchExportDialog, setShowBatchExportDialog] = useState(false);
  const [exportingReport, setExportingReport] = useState<any>(null);
  const { toast } = useToast();

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setCurrentReport(report);
    setShowReportDialog(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await deleteReport(reportId);
        toast({
          title: 'Report deleted',
          description: 'The report has been successfully deleted.',
        });
      } catch (error) {
        toast({
          title: 'Failed to delete report',
          description: 'Please try again or check your connection.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleExportClick = (report: any) => {
    setExportingReport(report);
    setShowExportDialog(true);
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-primary/10 text-primary border-primary/20';
      case 'monthly': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'quarterly': return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
      default: return 'bg-muted';
    }
  };

  if (isLoading && reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Batch Export */}
      {reports.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Report History</h2>
            <p className="text-muted-foreground">
              {reports.length} report{reports.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <Button 
            onClick={() => setShowBatchExportDialog(true)}
            className="gap-2"
            disabled={reports.length === 0}
          >
            <Package className="w-4 h-4" />
            Batch Export
          </Button>
        </div>
      )}

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports generated yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first professional report from your work records
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`capitalize ${getReportTypeColor(report.report_type)}`}>
                        {report.report_type} Report
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {report.record_count} records
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportClick(report)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReport(report._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary */}
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.summary}
                    </p>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Generated {new Date(report.generated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Quick highlights preview */}
                  {report.highlights && (
                    <div className="border-l-4 border-accent pl-4">
                      <p className="text-sm font-medium text-accent mb-1">Key Highlights</p>
                      <div className="text-sm text-muted-foreground">
                        {JSON.parse(report.highlights).slice(0, 2).map((highlight: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <TrendingUp className="w-3 h-3 mt-1 flex-shrink-0" />
                            <span className="line-clamp-1">{highlight}</span>
                          </div>
                        ))}
                        {JSON.parse(report.highlights).length > 2 && (
                          <p className="text-xs mt-1">+{JSON.parse(report.highlights).length - 2} more highlights</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Viewer Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{selectedReport?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.report_type && (
                <Badge className={`capitalize ${getReportTypeColor(selectedReport.report_type)} mr-2`}>
                  {selectedReport.report_type} Report
                </Badge>
              )}
              Generated on {selectedReport && new Date(selectedReport.generated_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Export Options */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center space-x-2">
                  <Badge className={`capitalize ${getReportTypeColor(selectedReport.report_type)}`}>
                    {selectedReport.report_type} Report
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedReport.record_count} records
                  </Badge>
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleExportClick(selectedReport)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
              
              <ScrollArea className="h-[60vh]">
                <div className="space-y-6 pr-4">
                  {/* Executive Summary */}
                  {selectedReport.summary && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Executive Summary
                      </h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">{selectedReport.summary}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Key Highlights */}
                  {selectedReport.highlights && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Key Highlights
                      </h3>
                      <div className="space-y-2">
                        {JSON.parse(selectedReport.highlights).map((highlight: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-accent/5 rounded">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Main Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Detailed Report
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {selectedReport.content}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Suggestions */}
                  {selectedReport.suggestions && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Improvement Suggestions
                      </h3>
                      <div className="bg-chart-3/5 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">{selectedReport.suggestions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      {exportingReport && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          report={exportingReport}
        />
      )}

      {/* Batch Export Dialog */}
      <BatchExportDialog
        open={showBatchExportDialog}
        onOpenChange={setShowBatchExportDialog}
        reports={reports}
      />
    </div>
  );
}