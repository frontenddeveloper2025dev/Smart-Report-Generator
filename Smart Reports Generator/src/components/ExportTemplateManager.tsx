import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  FileText, 
  Image, 
  Type, 
  Palette,
  Layout,
  Save,
  Eye,
  Download,
  Settings,
  Zap
} from 'lucide-react';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  formats: ('pdf' | 'word' | 'markdown')[];
  header: {
    enabled: boolean;
    content: string;
    height: number;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    alignment: 'left' | 'center' | 'right';
    showLogo: boolean;
    logoUrl?: string;
    showDate: boolean;
    showPageNumbers: boolean;
  };
  footer: {
    enabled: boolean;
    content: string;
    height: number;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    alignment: 'left' | 'center' | 'right';
    showCompanyInfo: boolean;
    companyName?: string;
    showPageNumbers: boolean;
    showGeneratedBy: boolean;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    spacing: {
      sectionGap: number;
      paragraphGap: number;
    };
  };
  sections: {
    showExecutiveSummary: boolean;
    showHighlights: boolean;
    showDetailedContent: boolean;
    showRecommendations: boolean;
    customSections: Array<{
      id: string;
      title: string;
      content: string;
      order: number;
    }>;
  };
  variables: Array<{
    name: string;
    defaultValue: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

interface ExportTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect?: (template: ExportTemplate) => void;
}

const defaultTemplate: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  formats: ['pdf', 'word', 'markdown'],
  header: {
    enabled: true,
    content: '{companyName} - Professional Report',
    height: 80,
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
    fontSize: 18,
    alignment: 'center',
    showLogo: false,
    showDate: true,
    showPageNumbers: false,
  },
  footer: {
    enabled: true,
    content: 'Confidential & Proprietary',
    height: 60,
    backgroundColor: '#f8fafc',
    textColor: '#64748b',
    fontSize: 12,
    alignment: 'center',
    showCompanyInfo: true,
    companyName: 'Smart Report Generator',
    showPageNumbers: true,
    showGeneratedBy: true,
  },
  styling: {
    primaryColor: '#2563eb',
    secondaryColor: '#059669',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 1.6,
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
    spacing: {
      sectionGap: 32,
      paragraphGap: 16,
    },
  },
  sections: {
    showExecutiveSummary: true,
    showHighlights: true,
    showDetailedContent: true,
    showRecommendations: true,
    customSections: [],
  },
  variables: [
    { name: 'companyName', defaultValue: 'Your Company', description: 'Company name for headers and footers' },
    { name: 'authorName', defaultValue: 'Report Author', description: 'Name of the report author' },
    { name: 'department', defaultValue: 'Department', description: 'Department or division' },
  ],
  isDefault: false,
};

export const ExportTemplateManager: React.FC<ExportTemplateManagerProps> = ({
  isOpen,
  onClose,
  onTemplateSelect,
}) => {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [previewData, setPreviewData] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const saved = localStorage.getItem('export-templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTemplates(parsed);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates(getDefaultTemplates());
      }
    } else {
      setTemplates(getDefaultTemplates());
    }
  };

  const getDefaultTemplates = (): ExportTemplate[] => [
    {
      ...defaultTemplate,
      id: 'professional',
      name: 'Professional',
      description: 'Clean, professional template suitable for business reports',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true,
    },
    {
      ...defaultTemplate,
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, clean design with minimal styling',
      header: {
        ...defaultTemplate.header,
        enabled: false,
      },
      footer: {
        ...defaultTemplate.footer,
        backgroundColor: '#ffffff',
        content: 'Page {pageNumber}',
        showCompanyInfo: false,
        showGeneratedBy: false,
      },
      styling: {
        ...defaultTemplate.styling,
        primaryColor: '#374151',
        secondaryColor: '#6b7280',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true,
    },
    {
      ...defaultTemplate,
      id: 'executive',
      name: 'Executive',
      description: 'Elegant design for executive-level reports',
      header: {
        ...defaultTemplate.header,
        content: 'Executive Report - {department}',
        backgroundColor: '#1f2937',
        fontSize: 20,
        showLogo: true,
      },
      footer: {
        ...defaultTemplate.footer,
        content: 'Prepared by {authorName} | {companyName}',
        backgroundColor: '#1f2937',
        textColor: '#ffffff',
      },
      styling: {
        ...defaultTemplate.styling,
        primaryColor: '#1f2937',
        secondaryColor: '#dc2626',
        fontSize: 16,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true,
    },
  ];

  const saveTemplates = (newTemplates: ExportTemplate[]) => {
    localStorage.setItem('export-templates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const createTemplate = () => {
    const newTemplate: ExportTemplate = {
      ...defaultTemplate,
      id: 'template-' + Date.now(),
      name: 'New Template',
      description: 'Custom export template',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingTemplate(newTemplate);
    setIsCreateMode(true);
    setActiveTab('editor');
  };

  const editTemplate = (template: ExportTemplate) => {
    setEditingTemplate({ ...template });
    setIsCreateMode(false);
    setActiveTab('editor');
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;

    if (!editingTemplate.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    const updatedTemplate = {
      ...editingTemplate,
      updatedAt: new Date().toISOString(),
    };

    let newTemplates;
    if (isCreateMode) {
      newTemplates = [...templates, updatedTemplate];
    } else {
      newTemplates = templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
    }

    saveTemplates(newTemplates);
    setEditingTemplate(null);
    setIsCreateMode(false);
    setActiveTab('list');

    toast({
      title: "Success",
      description: `Template "${updatedTemplate.name}" ${isCreateMode ? 'created' : 'updated'} successfully`,
    });
  };

  const deleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default templates cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    const newTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(newTemplates);

    toast({
      title: "Success",
      description: "Template deleted successfully",
    });
  };

  const duplicateTemplate = (template: ExportTemplate) => {
    const newTemplate: ExportTemplate = {
      ...template,
      id: 'template-' + Date.now(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTemplates = [...templates, newTemplate];
    saveTemplates(newTemplates);

    toast({
      title: "Success",
      description: "Template duplicated successfully",
    });
  };

  const generatePreview = () => {
    if (!editingTemplate) return;

    const sampleReport = {
      title: 'Sample Monthly Report',
      report_type: 'Monthly Performance',
      content: 'This is a sample report content to demonstrate how your template will look when applied to actual reports.',
      summary: 'This month showed significant progress across all key areas.',
      highlights: 'Key achievements include improved efficiency and successful project completions.',
      suggestions: 'Continue current strategies and focus on areas identified for improvement.',
      generated_at: new Date().toISOString(),
    };

    // Generate preview HTML with template styling
    const preview = generateTemplatePreview(editingTemplate, sampleReport);
    setPreviewData(preview);
    setActiveTab('preview');
  };

  const generateTemplatePreview = (template: ExportTemplate, sampleData: any): string => {
    const { header, footer, styling } = template;
    
    let headerHtml = '';
    if (header.enabled) {
      const headerContent = replaceVariables(header.content, template.variables);
      headerHtml = `
        <div style="
          background-color: ${header.backgroundColor};
          color: ${header.textColor};
          height: ${header.height}px;
          display: flex;
          align-items: center;
          justify-content: ${header.alignment};
          padding: 0 ${styling.margins.left}px;
          font-size: ${header.fontSize}px;
          font-weight: bold;
        ">
          ${headerContent}
          ${header.showDate ? ` | ${new Date().toLocaleDateString()}` : ''}
        </div>
      `;
    }

    let footerHtml = '';
    if (footer.enabled) {
      const footerContent = replaceVariables(footer.content, template.variables);
      footerHtml = `
        <div style="
          background-color: ${footer.backgroundColor};
          color: ${footer.textColor};
          height: ${footer.height}px;
          display: flex;
          align-items: center;
          justify-content: ${footer.alignment};
          padding: 0 ${styling.margins.left}px;
          font-size: ${footer.fontSize}px;
          margin-top: auto;
        ">
          ${footerContent}
          ${footer.showPageNumbers ? ' | Page 1' : ''}
          ${footer.showGeneratedBy ? ` | Generated by ${footer.companyName || 'Smart Report Generator'}` : ''}
        </div>
      `;
    }

    return `
      <div style="
        font-family: ${styling.fontFamily}, system-ui, sans-serif;
        font-size: ${styling.fontSize}px;
        line-height: ${styling.lineHeight};
        margin: ${styling.margins.top}px ${styling.margins.right}px ${styling.margins.bottom}px ${styling.margins.left}px;
        min-height: 600px;
        display: flex;
        flex-direction: column;
      ">
        ${headerHtml}
        
        <div style="flex: 1; padding: ${styling.spacing.sectionGap}px 0;">
          <h1 style="color: ${styling.primaryColor}; margin-bottom: ${styling.spacing.sectionGap}px; font-size: 28px;">
            ${sampleData.title}
          </h1>
          
          ${template.sections.showExecutiveSummary ? `
            <h2 style="color: ${styling.secondaryColor}; margin: ${styling.spacing.sectionGap}px 0 ${styling.spacing.paragraphGap}px 0;">
              Executive Summary
            </h2>
            <p style="margin-bottom: ${styling.spacing.paragraphGap}px;">${sampleData.summary}</p>
          ` : ''}
          
          ${template.sections.showHighlights ? `
            <h2 style="color: ${styling.secondaryColor}; margin: ${styling.spacing.sectionGap}px 0 ${styling.spacing.paragraphGap}px 0;">
              Key Highlights
            </h2>
            <p style="margin-bottom: ${styling.spacing.paragraphGap}px;">${sampleData.highlights}</p>
          ` : ''}
          
          ${template.sections.showDetailedContent ? `
            <h2 style="color: ${styling.secondaryColor}; margin: ${styling.spacing.sectionGap}px 0 ${styling.spacing.paragraphGap}px 0;">
              Detailed Report
            </h2>
            <p style="margin-bottom: ${styling.spacing.paragraphGap}px;">${sampleData.content}</p>
          ` : ''}
          
          ${template.sections.showRecommendations ? `
            <h2 style="color: ${styling.secondaryColor}; margin: ${styling.spacing.sectionGap}px 0 ${styling.spacing.paragraphGap}px 0;">
              Recommendations
            </h2>
            <p style="margin-bottom: ${styling.spacing.paragraphGap}px;">${sampleData.suggestions}</p>
          ` : ''}
        </div>
        
        ${footerHtml}
      </div>
    `;
  };

  const replaceVariables = (content: string, variables: ExportTemplate['variables']): string => {
    let result = content;
    variables.forEach(variable => {
      const placeholder = `{${variable.name}}`;
      result = result.replace(new RegExp(placeholder, 'g'), variable.defaultValue);
    });
    return result;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Template Manager
          </DialogTitle>
          <DialogDescription>
            Create and customize export templates with headers, footers, and styling options
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Templates</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Available Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your export templates and create new ones
                </p>
              </div>
              <Button onClick={createTemplate} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.formats.map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editTemplate(template)}
                          className="flex items-center gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateTemplate(template)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Duplicate
                        </Button>
                        {onTemplateSelect && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTemplateSelect(template)}
                            className="flex items-center gap-1"
                          >
                            <Zap className="h-3 w-3" />
                            Use
                          </Button>
                        )}
                        {!template.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            className="flex items-center gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="editor" className="overflow-y-auto max-h-[60vh]">
            {editingTemplate ? (
              <TemplateEditor
                template={editingTemplate}
                onChange={setEditingTemplate}
                onSave={saveTemplate}
                onCancel={() => {
                  setEditingTemplate(null);
                  setActiveTab('list');
                }}
                onPreview={generatePreview}
              />
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Select a template to edit or create a new one</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="overflow-y-auto max-h-[60vh]">
            {previewData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Template Preview</h3>
                  <Button onClick={generatePreview} variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Refresh Preview
                  </Button>
                </div>
                <div 
                  className="border rounded-lg p-4 bg-white"
                  style={{ minHeight: '600px' }}
                  dangerouslySetInnerHTML={{ __html: previewData }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Generate a preview to see how your template looks</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface TemplateEditorProps {
  template: ExportTemplate;
  onChange: (template: ExportTemplate) => void;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onChange,
  onSave,
  onCancel,
  onPreview,
}) => {
  const updateTemplate = (updates: Partial<ExportTemplate>) => {
    onChange({ ...template, ...updates });
  };

  const updateHeader = (updates: Partial<ExportTemplate['header']>) => {
    onChange({
      ...template,
      header: { ...template.header, ...updates }
    });
  };

  const updateFooter = (updates: Partial<ExportTemplate['footer']>) => {
    onChange({
      ...template,
      footer: { ...template.footer, ...updates }
    });
  };

  const updateStyling = (updates: Partial<ExportTemplate['styling']>) => {
    onChange({
      ...template,
      styling: { ...template.styling, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Template Editor</h3>
        <div className="flex gap-2">
          <Button onClick={onPreview} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={onSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="styling">Styling</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={template.name}
                onChange={(e) => updateTemplate({ name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label>Export Formats</Label>
              <div className="flex gap-2 mt-2">
                {(['pdf', 'word', 'markdown'] as const).map((format) => (
                  <div key={format} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`format-${format}`}
                      checked={template.formats.includes(format)}
                      onChange={(e) => {
                        const formats = e.target.checked
                          ? [...template.formats, format]
                          : template.formats.filter(f => f !== format);
                        updateTemplate({ formats });
                      }}
                    />
                    <Label htmlFor={`format-${format}`}>{format.toUpperCase()}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={template.description}
              onChange={(e) => updateTemplate({ description: e.target.value })}
              placeholder="Describe your template"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={template.header.enabled}
              onCheckedChange={(enabled) => updateHeader({ enabled })}
            />
            <Label>Enable Header</Label>
          </div>

          {template.header.enabled && (
            <div className="space-y-4 border rounded-lg p-4">
              <div>
                <Label htmlFor="header-content">Header Content</Label>
                <Textarea
                  id="header-content"
                  value={template.header.content}
                  onChange={(e) => updateHeader({ content: e.target.value })}
                  placeholder="Use variables like {companyName}, {date}, etc."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="header-height">Height (px)</Label>
                  <Input
                    id="header-height"
                    type="number"
                    value={template.header.height}
                    onChange={(e) => updateHeader({ height: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div>
                  <Label htmlFor="header-bg">Background Color</Label>
                  <Input
                    id="header-bg"
                    type="color"
                    value={template.header.backgroundColor}
                    onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="header-text">Text Color</Label>
                  <Input
                    id="header-text"
                    type="color"
                    value={template.header.textColor}
                    onChange={(e) => updateHeader({ textColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="header-font-size">Font Size</Label>
                  <Input
                    id="header-font-size"
                    type="number"
                    value={template.header.fontSize}
                    onChange={(e) => updateHeader({ fontSize: parseInt(e.target.value) || 16 })}
                  />
                </div>
                <div>
                  <Label htmlFor="header-alignment">Alignment</Label>
                  <Select
                    value={template.header.alignment}
                    onValueChange={(alignment: 'left' | 'center' | 'right') => updateHeader({ alignment })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={template.header.showDate}
                    onCheckedChange={(showDate) => updateHeader({ showDate })}
                  />
                  <Label>Show Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={template.header.showLogo}
                    onCheckedChange={(showLogo) => updateHeader({ showLogo })}
                  />
                  <Label>Show Logo</Label>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={template.footer.enabled}
              onCheckedChange={(enabled) => updateFooter({ enabled })}
            />
            <Label>Enable Footer</Label>
          </div>

          {template.footer.enabled && (
            <div className="space-y-4 border rounded-lg p-4">
              <div>
                <Label htmlFor="footer-content">Footer Content</Label>
                <Textarea
                  id="footer-content"
                  value={template.footer.content}
                  onChange={(e) => updateFooter({ content: e.target.value })}
                  placeholder="Use variables like {companyName}, {authorName}, etc."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="footer-height">Height (px)</Label>
                  <Input
                    id="footer-height"
                    type="number"
                    value={template.footer.height}
                    onChange={(e) => updateFooter({ height: parseInt(e.target.value) || 40 })}
                  />
                </div>
                <div>
                  <Label htmlFor="footer-bg">Background Color</Label>
                  <Input
                    id="footer-bg"
                    type="color"
                    value={template.footer.backgroundColor}
                    onChange={(e) => updateFooter({ backgroundColor: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="footer-text">Text Color</Label>
                  <Input
                    id="footer-text"
                    type="color"
                    value={template.footer.textColor}
                    onChange={(e) => updateFooter({ textColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="footer-font-size">Font Size</Label>
                  <Input
                    id="footer-font-size"
                    type="number"
                    value={template.footer.fontSize}
                    onChange={(e) => updateFooter({ fontSize: parseInt(e.target.value) || 12 })}
                  />
                </div>
                <div>
                  <Label htmlFor="footer-alignment">Alignment</Label>
                  <Select
                    value={template.footer.alignment}
                    onValueChange={(alignment: 'left' | 'center' | 'right') => updateFooter({ alignment })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={template.footer.showPageNumbers}
                    onCheckedChange={(showPageNumbers) => updateFooter({ showPageNumbers })}
                  />
                  <Label>Show Page Numbers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={template.footer.showGeneratedBy}
                    onCheckedChange={(showGeneratedBy) => updateFooter({ showGeneratedBy })}
                  />
                  <Label>Show Generated By</Label>
                </div>
              </div>

              {template.footer.showGeneratedBy && (
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={template.footer.companyName || ''}
                    onChange={(e) => updateFooter({ companyName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="styling" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <Input
                id="primary-color"
                type="color"
                value={template.styling.primaryColor}
                onChange={(e) => updateStyling({ primaryColor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <Input
                id="secondary-color"
                type="color"
                value={template.styling.secondaryColor}
                onChange={(e) => updateStyling({ secondaryColor: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="font-family">Font Family</Label>
              <Select
                value={template.styling.fontFamily}
                onValueChange={(fontFamily) => updateStyling({ fontFamily })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                value={template.styling.fontSize}
                onChange={(e) => updateStyling({ fontSize: parseInt(e.target.value) || 14 })}
              />
            </div>
            <div>
              <Label htmlFor="line-height">Line Height</Label>
              <Input
                id="line-height"
                type="number"
                step="0.1"
                value={template.styling.lineHeight}
                onChange={(e) => updateStyling({ lineHeight: parseFloat(e.target.value) || 1.5 })}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3">Margins (px)</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="margin-top">Top</Label>
                <Input
                  id="margin-top"
                  type="number"
                  value={template.styling.margins.top}
                  onChange={(e) => updateStyling({
                    margins: { ...template.styling.margins, top: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="margin-right">Right</Label>
                <Input
                  id="margin-right"
                  type="number"
                  value={template.styling.margins.right}
                  onChange={(e) => updateStyling({
                    margins: { ...template.styling.margins, right: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="margin-bottom">Bottom</Label>
                <Input
                  id="margin-bottom"
                  type="number"
                  value={template.styling.margins.bottom}
                  onChange={(e) => updateStyling({
                    margins: { ...template.styling.margins, bottom: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="margin-left">Left</Label>
                <Input
                  id="margin-left"
                  type="number"
                  value={template.styling.margins.left}
                  onChange={(e) => updateStyling({
                    margins: { ...template.styling.margins, left: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Spacing (px)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section-gap">Section Gap</Label>
                <Input
                  id="section-gap"
                  type="number"
                  value={template.styling.spacing.sectionGap}
                  onChange={(e) => updateStyling({
                    spacing: { ...template.styling.spacing, sectionGap: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="paragraph-gap">Paragraph Gap</Label>
                <Input
                  id="paragraph-gap"
                  type="number"
                  value={template.styling.spacing.paragraphGap}
                  onChange={(e) => updateStyling({
                    spacing: { ...template.styling.spacing, paragraphGap: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Report Sections</h4>
            <div className="space-y-3">
              {[
                { key: 'showExecutiveSummary', label: 'Executive Summary' },
                { key: 'showHighlights', label: 'Key Highlights' },
                { key: 'showDetailedContent', label: 'Detailed Content' },
                { key: 'showRecommendations', label: 'Recommendations' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    checked={template.sections[key as keyof typeof template.sections] as boolean}
                    onCheckedChange={(checked) => onChange({
                      ...template,
                      sections: { ...template.sections, [key]: checked }
                    })}
                  />
                  <Label>{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3">Template Variables</h4>
            <div className="space-y-3">
              {template.variables.map((variable, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Variable name"
                    value={variable.name}
                    onChange={(e) => {
                      const newVariables = [...template.variables];
                      newVariables[index] = { ...variable, name: e.target.value };
                      onChange({ ...template, variables: newVariables });
                    }}
                  />
                  <Input
                    placeholder="Default value"
                    value={variable.defaultValue}
                    onChange={(e) => {
                      const newVariables = [...template.variables];
                      newVariables[index] = { ...variable, defaultValue: e.target.value };
                      onChange({ ...template, variables: newVariables });
                    }}
                  />
                  <Input
                    placeholder="Description"
                    value={variable.description}
                    onChange={(e) => {
                      const newVariables = [...template.variables];
                      newVariables[index] = { ...variable, description: e.target.value };
                      onChange({ ...template, variables: newVariables });
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange({
                  ...template,
                  variables: [...template.variables, { name: '', defaultValue: '', description: '' }]
                })}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Variable
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};