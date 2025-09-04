import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportExporter, ReportData, BatchExportOptions, BatchExportResult } from '@/lib/export-utils';
// Define ExportTemplate interface locally
interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'word' | 'pdf' | 'markdown';
  header: any;
  footer: any;
  body: any;
  colors: any;
  variables: any;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  category?: string;
}
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Filter,
  Settings,
  Loader2,
  Clock,
  Layers,
  Zap,
  Palette,
  Archive
} from 'lucide-react';

interface BatchExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: ReportData[];
}

type ExportFormat = 'pdf' | 'word' | 'markdown';
type FilterType = 'all' | 'weekly' | 'monthly' | 'quarterly';
type SortType = 'newest' | 'oldest' | 'title';
type BatchMode = 'individual' | 'combined' | 'zip' | 'mixed-zip';

interface BatchExportSettings {
  format: ExportFormat;
  template: ExportTemplate | null;
  filter: FilterType;
  sort: SortType;
  batchMode: BatchMode;
  batchSize: number;
  delay: number;
  includeMetadata: boolean;
  archiveName?: string;
}

interface ExportProgress {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  estimatedTime?: number;
}

export function BatchExportDialog({ open, onOpenChange, reports }: BatchExportDialogProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [settings, setSettings] = useState<BatchExportSettings>({
    format: 'pdf',
    template: null,
    filter: 'all',
    sort: 'newest',
    batchMode: 'individual',
    batchSize: 5,
    delay: 500,
    includeMetadata: true,
    archiveName: `reports-${new Date().toISOString().split('T')[0]}`
  });
  const [availableTemplates, setAvailableTemplates] = useState<ExportTemplate[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress[]>([]);
  const [exportComplete, setExportComplete] = useState(false);
  const { toast } = useToast();

  // Load available templates when dialog opens
  useEffect(() => {
    if (open) {
      const loadTemplates = () => {
        const saved = localStorage.getItem('export-templates');
        if (saved) {
          try {
            const templates = JSON.parse(saved);
            setAvailableTemplates(templates);
            // Set default template if available
            const defaultTemplate = templates.find((t: ExportTemplate) => t.isDefault);
            if (defaultTemplate) {
              setSettings(prev => ({ ...prev, template: defaultTemplate }));
            }
          } catch (error) {
            console.error('Failed to load templates:', error);
            setAvailableTemplates([]);
          }
        }
      };
      loadTemplates();
    }
  }, [open]);

  // Filter and sort reports based on settings
  const filteredReports = reports
    .filter(report => {
      if (settings.filter === 'all') return true;
      return report.report_type === settings.filter;
    })
    .sort((a, b) => {
      switch (settings.sort) {
        case 'newest':
          return new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime();
        case 'oldest':
          return new Date(a.generated_at).getTime() - new Date(b.generated_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(report => report._id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports(prev => [...prev, reportId]);
    } else {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-primary/10 text-primary border-primary/20';
      case 'monthly': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'quarterly': return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
      default: return 'bg-muted';
    }
  };

  const handleBatchExport = async () => {
    if (selectedReports.length === 0) {
      toast({
        title: 'No reports selected',
        description: 'Please select at least one report to export.',
        variant: 'destructive',
      });
      return;
    }

    // Validate reports before export
    const reportsToExport = filteredReports.filter(report => 
      selectedReports.includes(report._id)
    );

    const validationErrors = ReportExporter.validateReportsForExport(reportsToExport);
    if (validationErrors.length > 0) {
      toast({
        title: 'Export validation failed',
        description: validationErrors[0],
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    setExportComplete(false);
    
    // Initialize progress tracking with estimated times
    const estimatedTimePerReport = ReportExporter.getEstimatedBatchTime(1, settings.format);
    const progressList: ExportProgress[] = reportsToExport.map(report => ({
      id: report._id,
      title: report.title,
      status: 'pending',
      estimatedTime: estimatedTimePerReport
    }));
    
    setExportProgress(progressList);

    try {
      if (settings.batchMode === 'combined') {
        // Export as single combined document
        await ReportExporter.exportCombinedReport(
          reportsToExport,
          settings.format,
          `Combined Report - ${new Date().toLocaleDateString()}`,
          settings.template || undefined
        );

        // Update all as completed
        setExportProgress(prev => prev.map(p => ({ ...p, status: 'completed' })));
        
        toast({
          title: 'Combined export completed',
          description: `${reportsToExport.length} reports combined into one document.`,
        });
      } else if (settings.batchMode === 'zip') {
        // Export as ZIP archive with single format
        const archiveName = settings.archiveName || `reports-${settings.format}-${new Date().toISOString().split('T')[0]}`;
        
        // ZIP archive export functionality to be implemented
        toast({
          title: "Feature Coming Soon",
          description: "ZIP archive export will be available in a future update",
          variant: "destructive"
        });
        /*await ReportExporter.exportToZipArchive(reportsToExport, {
          format: settings.format,
          archiveName,
          template: settings.template || undefined,
          onProgress: (current: number, total: number, fileName: string) => {*/
            // Update progress for current file
            setExportProgress(prev => prev.map((p, index) => {
              if (index < current) {
                return { ...p, status: 'completed' };
              } else if (index === current) {
                return { ...p, status: 'processing' };
              }
              return p;
            }));
          }
        });

        // Mark all as completed
        setExportProgress(prev => prev.map(p => ({ ...p, status: 'completed' })));
        
        toast({
          title: 'ZIP archive created',
          description: `${reportsToExport.length} reports packaged into ${archiveName}.zip`,
        });
      } else if (settings.batchMode === 'mixed-zip') {
        // Export as mixed ZIP archive with different formats per report
        const archiveName = settings.archiveName || `mixed-reports-${new Date().toISOString().split('T')[0]}`;
        
        // Create mixed format items (for demo, alternate between formats)
        const mixedItems: MixedZipExportItem[] = reportsToExport.map((report, index) => {
          const formats: ('pdf' | 'word' | 'markdown')[] = ['pdf', 'word', 'markdown'];
          const format = formats[index % formats.length];
          
          return {
            report,
            format,
            template: settings.template || undefined
          };
        });

        // Mixed ZIP archive export functionality to be implemented
        toast({
          title: "Feature Coming Soon", 
          description: "Mixed format ZIP export will be available in a future update",
          variant: "destructive"
        });
        /*await ReportExporter.exportToMixedZipArchive(mixedItems, {
          archiveName,
          onProgress: (current: number, total: number, fileName: string) => {*/
            setExportProgress(prev => prev.map((p, index) => {
              if (index < current) {
                return { ...p, status: 'completed' };
              } else if (index === current) {
                return { ...p, status: 'processing' };
              }
              return p;
            }));
          }
        });

        // Mark all as completed
        setExportProgress(prev => prev.map(p => ({ ...p, status: 'completed' })));
        
        toast({
          title: 'Mixed format ZIP created',
          description: `${reportsToExport.length} reports in multiple formats packaged into ${archiveName}.zip`,
        });
      } else {
        // Individual batch export using the ReportExporter
        const batchOptions: BatchExportOptions = {
          format: settings.format,
          template: settings.template || undefined,
          batchSize: settings.batchSize,
          delayBetweenExports: settings.delay,
          onProgress: (completed: number, total: number, currentReport: string) => {
            // Update progress for the current report
            const reportIndex = reportsToExport.findIndex(r => r.title === currentReport);
            if (reportIndex >= 0) {
              const reportId = reportsToExport[reportIndex]._id;
              setExportProgress(prev => prev.map(p => 
                p.id === reportId ? { ...p, status: 'processing' } : p
              ));
            }

            // Mark previous reports as completed
            setExportProgress(prev => prev.map((p, index) => {
              if (index < completed) {
                return { ...p, status: 'completed' };
              }
              return p;
            }));
          },
          onError: (reportId: string, error: Error) => {
            setExportProgress(prev => prev.map(p => 
              p.id === reportId ? { 
                ...p, 
                status: 'error', 
                error: error.message 
              } : p
            ));
          }
        };

        const result: BatchExportResult = await ReportExporter.batchExport(
          reportsToExport,
          batchOptions
        );

        // Final progress update
        setExportProgress(prev => prev.map(p => {
          const wasSuccessful = !result.errors.find(err => err.reportId === p.id);
          return {
            ...p,
            status: wasSuccessful ? 'completed' : 'error',
            error: wasSuccessful ? undefined : 'Export failed'
          };
        }));

        const message = result.successful > 0 
          ? `${result.successful} reports exported successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}.`
          : 'All exports failed. Please try again.';

        toast({
          title: result.successful > 0 ? 'Batch export completed' : 'Batch export failed',
          description: message,
          variant: result.successful > 0 ? 'default' : 'destructive',
        });
      }

      setExportComplete(true);
      
    } catch (error) {
      console.error('Batch export error:', error);
      toast({
        title: 'Batch export failed',
        description: 'There was an error during the batch export process.',
        variant: 'destructive',
      });
      
      // Mark all as failed
      setExportProgress(prev => prev.map(p => ({ 
        ...p, 
        status: 'error', 
        error: 'Batch process failed' 
      })));
    } finally {
      setIsExporting(false);
    }
  };

  const resetDialog = () => {
    setSelectedReports([]);
    setIsExporting(false);
    setExportProgress([]);
    setExportComplete(false);
  };

  const handleClose = (open: boolean) => {
    if (!isExporting) {
      onOpenChange(open);
      if (!open) {
        resetDialog();
      }
    }
  };

  const completedCount = exportProgress.filter(p => p.status === 'completed').length;
  const errorCount = exportProgress.filter(p => p.status === 'error').length;
  const progressPercentage = exportProgress.length > 0 
    ? ((completedCount + errorCount) / exportProgress.length) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Batch Export Reports</span>
          </DialogTitle>
          <DialogDescription>
            Export multiple reports simultaneously with advanced batch processing and performance optimization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isExporting && !exportComplete && (
            <>
              {/* Export Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Export Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <Select
                        value={settings.format}
                        onValueChange={(value: ExportFormat) => 
                          setSettings(prev => ({ ...prev, format: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="word">Word Document</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Template</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTemplateManager(true)}
                          className="h-auto p-1 text-xs"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                      <Select
                        value={settings.template?.id || ''}
                        onValueChange={(templateId) => {
                          const template = availableTemplates.find(t => t.id === templateId);
                          setSettings(prev => ({ ...prev, template: template || null }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Default Template</SelectItem>
                          {availableTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <Palette className="w-3 h-3" />
                                <span>{template.name}</span>
                                {template.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filter</label>
                      <Select
                        value={settings.filter}
                        onValueChange={(value: FilterType) => {
                          setSettings(prev => ({ ...prev, filter: value }));
                          setSelectedReports([]); // Reset selection when filter changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Reports</SelectItem>
                          <SelectItem value="weekly">Weekly Reports</SelectItem>
                          <SelectItem value="monthly">Monthly Reports</SelectItem>
                          <SelectItem value="quarterly">Quarterly Reports</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort by</label>
                      <Select
                        value={settings.sort}
                        onValueChange={(value: SortType) => 
                          setSettings(prev => ({ ...prev, sort: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="title">Title (A-Z)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mode</label>
                      <Select
                        value={settings.batchMode}
                        onValueChange={(value: BatchMode) => 
                          setSettings(prev => ({ ...prev, batchMode: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual Files</SelectItem>
                          <SelectItem value="combined">Combined Document</SelectItem>
                          <SelectItem value="zip">ZIP Archive (Single Format)</SelectItem>
                          <SelectItem value="mixed-zip">ZIP Archive (Mixed Formats)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Settings for Individual Mode */}
                  {settings.batchMode === 'individual' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Batch Size ({settings.batchSize} reports)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={settings.batchSize}
                          onChange={(e) => 
                            setSettings(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1</span>
                          <span>Parallel processing</span>
                          <span>10</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Delay ({settings.delay}ms)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="100"
                          value={settings.delay}
                          onChange={(e) => 
                            setSettings(prev => ({ ...prev, delay: parseInt(e.target.value) }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0ms</span>
                          <span>Between exports</span>
                          <span>2s</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Archive Settings for ZIP Modes */}
                  {(settings.batchMode === 'zip' || settings.batchMode === 'mixed-zip') && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm font-medium">
                        <Archive className="h-4 w-4" />
                        <span>Archive Settings</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="archiveName" className="text-sm font-medium">
                            Archive Name
                          </Label>
                          <Input
                            id="archiveName"
                            type="text"
                            value={settings.archiveName || ''}
                            onChange={(e) => 
                              setSettings(prev => ({ ...prev, archiveName: e.target.value }))
                            }
                            placeholder="Enter archive name (without .zip extension)"
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            {settings.batchMode === 'zip' 
                              ? `All reports will be exported as ${settings.format.toUpperCase()} files in the archive`
                              : 'Reports will be exported in different formats (PDF, Word, Markdown) organized in folders'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeMetadata"
                        checked={settings.includeMetadata}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, includeMetadata: checked as boolean }))
                        }
                      />
                      <label htmlFor="includeMetadata" className="text-sm">
                        Include metadata in exports
                      </label>
                    </div>
                    
                    {selectedReports.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Estimated time: {Math.ceil(ReportExporter.getEstimatedBatchTime(selectedReports.length, settings.format) / 1000)}s
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Report Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Select Reports ({filteredReports.length} available)
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selectAll"
                        checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <label htmlFor="selectAll" className="text-sm">
                        Select All
                      </label>
                    </div>
                  </div>
                  <CardDescription>
                    {selectedReports.length} of {filteredReports.length} reports selected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60">
                    <div className="space-y-2">
                      {filteredReports.map((report) => (
                        <div
                          key={report._id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedReports.includes(report._id)}
                            onCheckedChange={(checked) => 
                              handleSelectReport(report._id, checked as boolean)
                            }
                          />
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium truncate">{report.title}</p>
                              <Badge className={`text-xs ${getReportTypeColor(report.report_type)}`}>
                                {report.report_type}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(report.generated_at).toLocaleDateString()}
                              </span>
                              <span>{report.record_count} records</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting Reports
                </CardTitle>
                <CardDescription>
                  Processing {exportProgress.length} reports...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{completedCount + errorCount} / {exportProgress.length}</span>
                  </div>
                  <Progress value={progressPercentage} className="w-full" />
                </div>
                
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {exportProgress.map((progress) => (
                      <div
                        key={progress.id}
                        className="flex items-center space-x-3 p-2 border rounded"
                      >
                        {progress.status === 'pending' && (
                          <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
                        )}
                        {progress.status === 'processing' && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                        {progress.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        {progress.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium">{progress.title}</p>
                          {progress.error && (
                            <p className="text-xs text-red-500">{progress.error}</p>
                          )}
                        </div>
                        
                        <Badge variant={
                          progress.status === 'completed' ? 'default' :
                          progress.status === 'error' ? 'destructive' :
                          progress.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {progress.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Export Complete */}
          {exportComplete && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Export Complete!</h3>
                    <p className="text-muted-foreground">
                      {completedCount} reports exported successfully
                      {errorCount > 0 && `, ${errorCount} failed`}
                    </p>
                  </div>

                  {/* Export Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <div className="text-sm font-medium">{completedCount}</div>
                      <div className="text-xs text-muted-foreground">Successful</div>
                    </div>
                    {errorCount > 0 && (
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <div className="text-sm font-medium">{errorCount}</div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                    )}
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Layers className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-sm font-medium">{settings.format.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">Format</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <div className="text-sm font-medium">{settings.batchMode}</div>
                      <div className="text-xs text-muted-foreground">Mode</div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2 mt-6">
                    <Button onClick={() => handleClose(false)}>
                      Close
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetDialog}
                    >
                      Export More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!isExporting && !exportComplete && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected for export
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleClose(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBatchExport}
                  disabled={selectedReports.length === 0}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export {selectedReports.length} Report{selectedReports.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <ExportTemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onTemplateSelect={(template) => {
          setSettings(prev => ({ ...prev, template }));
          setShowTemplateManager(false);
          toast({
            title: "Template Selected",
            description: `${template.name} template is now active for batch export.`,
          });
        }}
      />
    </Dialog>
  );
}