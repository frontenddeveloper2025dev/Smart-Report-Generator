import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ReportExporter, ReportData } from '@/lib/export-utils';
import TemplateManager from './TemplateManager';
import { 
  FileText, 
  Download, 
  FileImage, 
  File,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Palette
} from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportData;
  exportElement?: HTMLElement;
}

type ExportFormat = 'pdf' | 'word' | 'markdown';

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

export function ExportDialog({ open, onOpenChange, report, exportElement }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<ExportTemplate[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load available templates
    const loadTemplates = () => {
      const saved = localStorage.getItem('export-templates');
      if (saved) {
        try {
          const templates = JSON.parse(saved);
          setAvailableTemplates(templates);
          // Set default template if available
          const defaultTemplate = templates.find((t: ExportTemplate) => t.isFavorite);
          if (defaultTemplate) {
            setSelectedTemplate(defaultTemplate);
          }
        } catch (error) {
          console.error('Failed to load templates:', error);
          setAvailableTemplates([]);
        }
      }
    };

    if (open) {
      loadTemplates();
    }
  }, [open]);

  const exportFormats = [
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF Document',
      description: 'Professional formatted PDF with preserved styling',
      icon: FileImage,
      fileSize: '~2-5 MB',
      recommended: true,
    },
    {
      id: 'word' as ExportFormat,
      name: 'Word Document',
      description: 'Editable DOCX format with structured formatting',
      icon: FileText,
      fileSize: '~500 KB - 2 MB',
      recommended: false,
    },
    {
      id: 'markdown' as ExportFormat,
      name: 'Markdown',
      description: 'Plain text format, great for version control',
      icon: File,
      fileSize: '~5-50 KB',
      recommended: false,
    },
  ];

  const handleExport = async () => {
    if (!selectedFormat) return;

    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Check if template supports the selected format
      if (selectedTemplate && selectedTemplate.format !== selectedFormat) {
        throw new Error(`Selected template is designed for ${selectedTemplate.format.toUpperCase()} format`);
      }

      switch (selectedFormat) {
        case 'pdf':
          await ReportExporter.exportToPDF(report, exportElement, selectedTemplate || undefined);
          break;
        case 'word':
          await ReportExporter.exportToWord(report, selectedTemplate || undefined);
          break;
        case 'markdown':
          ReportExporter.exportToMarkdown(report, selectedTemplate || undefined);
          break;
      }

      setExportStatus('success');
      toast({
        title: "Export Successful",
        description: `Report exported as ${selectedFormat.toUpperCase()} with ${selectedTemplate?.name || 'default'} template.`,
      });

      // Auto close after success
      setTimeout(() => {
        onOpenChange(false);
        setExportStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm text-muted-foreground">Report to Export</h4>
                <p className="font-semibold">{report.title}</p>
                <p className="text-sm text-muted-foreground">
                  {report.report_type} • Generated {new Date(report.generated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Format Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">Choose Export Format</h4>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
              className="space-y-3"
            >
              {exportFormats.map((format) => (
                <div key={format.id} className="relative">
                  <Label
                    htmlFor={format.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary/50 ${
                      selectedFormat === format.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value={format.id} id={format.id} className="mt-0.5" />
                    <format.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{format.name}</span>
                        {format.recommended && (
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{format.description}</p>
                      <p className="text-xs text-muted-foreground">File size: {format.fileSize}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Export Template</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateManager(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Manage Templates
              </Button>
            </div>
            
            {availableTemplates.length > 0 ? (
              <div className="space-y-3">
                <Select
                  value={selectedTemplate?.id || ''}
                  onValueChange={(templateId) => {
                    const template = availableTemplates.find(t => t.id === templateId);
                    setSelectedTemplate(template || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default Template</SelectItem>
                    {availableTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          {template.isFavorite && (
                            <Badge variant="secondary" className="text-xs">
                              Favorite
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTemplate && (
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{selectedTemplate.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-muted-foreground">Format:</span>
                          <Badge 
                            variant={selectedTemplate.format === selectedFormat ? "default" : "outline"}
                            className="text-xs"
                          >
                            {selectedTemplate.format.toUpperCase()}
                          </Badge>
                          {selectedTemplate.category && (
                            <Badge variant="outline" className="text-xs">
                              {selectedTemplate.category}
                            </Badge>
                          )}
                        </div>

                        {selectedTemplate && selectedTemplate.format !== selectedFormat && (
                          <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>This template is designed for {selectedTemplate.format.toUpperCase()} format</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">No custom templates available</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplateManager(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Create Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Export Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {exportStatus === 'success' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Export completed!</span>
                </>
              )}
              {exportStatus === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Export failed</span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || !selectedFormat}
                className="min-w-[120px]"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedFormatData?.name}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Export Tips */}
          {selectedFormat && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Export Tips</h5>
                  {selectedFormat === 'pdf' && (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Best for sharing and printing</li>
                      <li>• Preserves exact formatting and styling</li>
                      <li>• Cannot be edited after export</li>
                    </ul>
                  )}
                  {selectedFormat === 'word' && (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Fully editable in Microsoft Word</li>
                      <li>• Professional formatting maintained</li>
                      <li>• Great for collaborative editing</li>
                    </ul>
                  )}
                  {selectedFormat === 'markdown' && (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Plain text format, lightweight</li>
                      <li>• Perfect for version control (Git)</li>
                      <li>• Compatible with many documentation tools</li>
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>

      {showTemplateManager && (
        <Dialog open={showTemplateManager} onOpenChange={setShowTemplateManager}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <TemplateManager
              onSelectTemplate={(template) => {
                setSelectedTemplate(template);
                setShowTemplateManager(false);
                // Reload templates from storage
                const saved = localStorage.getItem('export-templates');
                if (saved) {
                  try {
                    const templates = JSON.parse(saved);
                    setAvailableTemplates(templates);
                  } catch (error) {
                    console.error('Failed to reload templates:', error);
                  }
                }
                toast({
                  title: "Template Selected",
                  description: `${template.name} template is now active for export.`,
                });
              }}
              onClose={() => setShowTemplateManager(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}