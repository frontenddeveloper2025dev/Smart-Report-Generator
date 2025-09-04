import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Palette, 
  FileText, 
  Layout,
  Save,
  RotateCcw,
  Eye,
  Download,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';

interface TemplateSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  content: string;
  variables: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  sections: TemplateSection[];
  styling: {
    primaryColor: string;
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    pageLayout: 'single' | 'multi';
    showMetadata: boolean;
    showSummary: boolean;
    showTimestamps: boolean;
  };
  variables: Record<string, string>;
}

const defaultTemplate: ReportTemplate = {
  id: 'default',
  name: 'Standard Report',
  description: 'Professional report template with all standard sections',
  type: 'weekly',
  sections: [
    {
      id: 'header',
      name: 'Header',
      enabled: true,
      order: 1,
      content: '# {{title}}\n\n**Report Type:** {{reportType}}  \n**Period:** {{period}}  \n**Generated:** {{date}}',
      variables: ['title', 'reportType', 'period', 'date']
    },
    {
      id: 'summary',
      name: 'Executive Summary',
      enabled: true,
      order: 2,
      content: '## Executive Summary\n\n{{summary}}',
      variables: ['summary']
    },
    {
      id: 'highlights',
      name: 'Key Highlights',
      enabled: true,
      order: 3,
      content: '## Key Highlights\n\n{{highlights}}',
      variables: ['highlights']
    },
    {
      id: 'content',
      name: 'Detailed Report',
      enabled: true,
      order: 4,
      content: '## Detailed Analysis\n\n{{content}}',
      variables: ['content']
    },
    {
      id: 'suggestions',
      name: 'Recommendations',
      enabled: true,
      order: 5,
      content: '## Recommendations & Next Steps\n\n{{suggestions}}',
      variables: ['suggestions']
    }
  ],
  styling: {
    primaryColor: '#2563eb',
    accentColor: '#059669',
    fontSize: 'medium',
    pageLayout: 'single',
    showMetadata: true,
    showSummary: true,
    showTimestamps: true,
  },
  variables: {
    title: 'Weekly Progress Report',
    reportType: 'Weekly',
    period: 'Current Week',
    date: 'Current Date'
  }
};

export function AdvancedTemplateEditor() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<ReportTemplate>(defaultTemplate);
  const [activeTab, setActiveTab] = useState('structure');
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('report-templates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates([defaultTemplate, ...parsed]);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates([defaultTemplate]);
      }
    } else {
      setTemplates([defaultTemplate]);
    }
  }, []);

  const saveTemplate = () => {
    if (!currentTemplate.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    const updatedTemplates = templates.map(t => 
      t.id === currentTemplate.id ? currentTemplate : t
    );

    if (!templates.find(t => t.id === currentTemplate.id)) {
      updatedTemplates.push({ ...currentTemplate, id: Date.now().toString() });
    }

    const customTemplates = updatedTemplates.filter(t => t.id !== 'default');
    localStorage.setItem('report-templates', JSON.stringify(customTemplates));
    setTemplates(updatedTemplates);
    setIsEditing(false);

    toast({
      title: "Template Saved",
      description: `"${currentTemplate.name}" has been saved successfully.`,
    });
  };

  const createNewTemplate = () => {
    const newTemplate: ReportTemplate = {
      ...defaultTemplate,
      id: Date.now().toString(),
      name: 'New Template',
      description: 'Custom report template'
    };
    setCurrentTemplate(newTemplate);
    setIsEditing(true);
  };

  const deleteTemplate = (templateId: string) => {
    if (templateId === 'default') return;
    
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    const customTemplates = updatedTemplates.filter(t => t.id !== 'default');
    localStorage.setItem('report-templates', JSON.stringify(customTemplates));
    setTemplates(updatedTemplates);

    if (currentTemplate.id === templateId) {
      setCurrentTemplate(defaultTemplate);
    }

    toast({
      title: "Template Deleted",
      description: "The template has been removed.",
    });
  };

  const duplicateTemplate = (template: ReportTemplate) => {
    const duplicated: ReportTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      description: `Copy of ${template.description}`
    };
    setCurrentTemplate(duplicated);
    setIsEditing(true);
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const addCustomSection = () => {
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      name: 'Custom Section',
      enabled: true,
      order: currentTemplate.sections.length + 1,
      content: '## {{sectionTitle}}\n\n{{sectionContent}}',
      variables: ['sectionTitle', 'sectionContent']
    };

    setCurrentTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (sectionId: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const generatePreview = () => {
    let preview = '';
    const sortedSections = [...currentTemplate.sections]
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);

    for (const section of sortedSections) {
      let sectionContent = section.content;
      
      // Replace variables with sample data
      sectionContent = sectionContent
        .replace(/{{title}}/g, currentTemplate.variables.title || 'Sample Report Title')
        .replace(/{{reportType}}/g, currentTemplate.variables.reportType || 'Weekly')
        .replace(/{{period}}/g, currentTemplate.variables.period || 'March 1-7, 2024')
        .replace(/{{date}}/g, new Date().toLocaleDateString())
        .replace(/{{summary}}/g, 'This is a sample executive summary that provides an overview of the key findings and results from this reporting period.')
        .replace(/{{highlights}}/g, '• Completed 15 tasks with high priority\n• Achieved 95% of weekly goals\n• Identified 3 areas for improvement')
        .replace(/{{content}}/g, 'This section contains the detailed analysis and findings from the reporting period. It includes comprehensive information about progress, challenges, and outcomes.')
        .replace(/{{suggestions}}/g, '1. Focus on completing remaining high-priority tasks\n2. Implement new workflow improvements\n3. Schedule follow-up meetings with stakeholders');

      preview += sectionContent + '\n\n';
    }

    return preview;
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Template Editor
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Customize report templates to match your organization's style and requirements
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={createNewTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
              {isEditing && (
                <Button size="sm" onClick={saveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all ${
                  currentTemplate.id === template.id 
                    ? 'ring-2 ring-primary' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setCurrentTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline" className="capitalize">
                        {template.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        {template.sections.filter(s => s.enabled).length} sections
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTemplate(template);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {template.id !== 'default' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTemplate(template.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentTemplate.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentTemplate.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
              <Label htmlFor="preview-mode">Preview Mode</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode ? (
            <div className="space-y-4">
              <div className="bg-muted/30 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {generatePreview()}
                </pre>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPreviewMode(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="styling">Styling</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Report Sections</h3>
                  <Button variant="outline" size="sm" onClick={addCustomSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {currentTemplate.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                    <Card key={section.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={section.enabled}
                                onCheckedChange={(enabled) => {
                                  updateSection(section.id, { enabled });
                                  setIsEditing(true);
                                }}
                              />
                              <Input
                                value={section.name}
                                onChange={(e) => {
                                  updateSection(section.id, { name: e.target.value });
                                  setIsEditing(true);
                                }}
                                className="max-w-[200px]"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={section.order}
                                onChange={(e) => {
                                  updateSection(section.id, { order: parseInt(e.target.value) });
                                  setIsEditing(true);
                                }}
                                className="w-16"
                                min="1"
                              />
                              {!['header', 'summary', 'highlights', 'content', 'suggestions'].includes(section.id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    removeSection(section.id);
                                    setIsEditing(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <Textarea
                            value={section.content}
                            onChange={(e) => {
                              updateSection(section.id, { content: e.target.value });
                              setIsEditing(true);
                            }}
                            placeholder="Section content with {{variables}}"
                            className="min-h-[100px] font-mono text-sm"
                          />
                          <div className="flex flex-wrap gap-1">
                            {section.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="styling" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={currentTemplate.styling.primaryColor}
                          onChange={(e) => {
                            setCurrentTemplate(prev => ({
                              ...prev,
                              styling: { ...prev.styling, primaryColor: e.target.value }
                            }));
                            setIsEditing(true);
                          }}
                          className="w-16 h-10"
                        />
                        <Input
                          value={currentTemplate.styling.primaryColor}
                          onChange={(e) => {
                            setCurrentTemplate(prev => ({
                              ...prev,
                              styling: { ...prev.styling, primaryColor: e.target.value }
                            }));
                            setIsEditing(true);
                          }}
                          placeholder="#2563eb"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="accent-color"
                          type="color"
                          value={currentTemplate.styling.accentColor}
                          onChange={(e) => {
                            setCurrentTemplate(prev => ({
                              ...prev,
                              styling: { ...prev.styling, accentColor: e.target.value }
                            }));
                            setIsEditing(true);
                          }}
                          className="w-16 h-10"
                        />
                        <Input
                          value={currentTemplate.styling.accentColor}
                          onChange={(e) => {
                            setCurrentTemplate(prev => ({
                              ...prev,
                              styling: { ...prev.styling, accentColor: e.target.value }
                            }));
                            setIsEditing(true);
                          }}
                          placeholder="#059669"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select
                        value={currentTemplate.styling.fontSize}
                        onValueChange={(value: 'small' | 'medium' | 'large') => {
                          setCurrentTemplate(prev => ({
                            ...prev,
                            styling: { ...prev.styling, fontSize: value }
                          }));
                          setIsEditing(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Page Layout</Label>
                      <Select
                        value={currentTemplate.styling.pageLayout}
                        onValueChange={(value: 'single' | 'multi') => {
                          setCurrentTemplate(prev => ({
                            ...prev,
                            styling: { ...prev.styling, pageLayout: value }
                          }));
                          setIsEditing(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Column</SelectItem>
                          <SelectItem value="multi">Multi Column</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variables" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure default values for template variables
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentTemplate.variables).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Input
                          id={key}
                          value={value}
                          onChange={(e) => {
                            setCurrentTemplate(prev => ({
                              ...prev,
                              variables: { ...prev.variables, [key]: e.target.value }
                            }));
                            setIsEditing(true);
                          }}
                          placeholder={`Default ${key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          value={currentTemplate.name}
                          onChange={(e) => {
                            setCurrentTemplate(prev => ({ ...prev, name: e.target.value }));
                            setIsEditing(true);
                          }}
                          placeholder="Enter template name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-description">Description</Label>
                        <Textarea
                          id="template-description"
                          value={currentTemplate.description}
                          onChange={(e) => {
                            setCurrentTemplate(prev => ({ ...prev, description: e.target.value }));
                            setIsEditing(true);
                          }}
                          placeholder="Describe this template"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Template Type</Label>
                        <Select
                          value={currentTemplate.type}
                          onValueChange={(value: 'weekly' | 'monthly' | 'quarterly' | 'custom') => {
                            setCurrentTemplate(prev => ({ ...prev, type: value }));
                            setIsEditing(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Display Options</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-metadata">Show Metadata</Label>
                          <Switch
                            id="show-metadata"
                            checked={currentTemplate.styling.showMetadata}
                            onCheckedChange={(checked) => {
                              setCurrentTemplate(prev => ({
                                ...prev,
                                styling: { ...prev.styling, showMetadata: checked }
                              }));
                              setIsEditing(true);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-summary">Show Summary Section</Label>
                          <Switch
                            id="show-summary"
                            checked={currentTemplate.styling.showSummary}
                            onCheckedChange={(checked) => {
                              setCurrentTemplate(prev => ({
                                ...prev,
                                styling: { ...prev.styling, showSummary: checked }
                              }));
                              setIsEditing(true);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-timestamps">Show Timestamps</Label>
                          <Switch
                            id="show-timestamps"
                            checked={currentTemplate.styling.showTimestamps}
                            onCheckedChange={(checked) => {
                              setCurrentTemplate(prev => ({
                                ...prev,
                                styling: { ...prev.styling, showTimestamps: checked }
                              }));
                              setIsEditing(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}