import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Eye, 
  Save, 
  Copy, 
  Trash2, 
  Plus, 
  Settings, 
  Layout,
  Type,
  Palette,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'word' | 'pdf' | 'markdown';
  
  // Header configuration
  header: {
    enabled: boolean;
    content: string;
    height: number;
    alignment: 'left' | 'center' | 'right';
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    color: string;
    backgroundColor: string;
    borderBottom: boolean;
    includeDate: boolean;
    includePageNumber: boolean;
    includeCompanyLogo: boolean;
    logoUrl?: string;
  };
  
  // Footer configuration
  footer: {
    enabled: boolean;
    content: string;
    height: number;
    alignment: 'left' | 'center' | 'right';
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    color: string;
    backgroundColor: string;
    borderTop: boolean;
    includeDate: boolean;
    includePageNumber: boolean;
    includeCompanyInfo: boolean;
    companyInfo?: string;
  };
  
  // Body styling
  body: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    textAlign: 'left' | 'center' | 'right' | 'justify';
  };
  
  // Color scheme
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  
  // Variables support
  variables: {
    [key: string]: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

const defaultTemplate: ExportTemplate = {
  id: '',
  name: 'Professional Report',
  description: 'Standard business report template',
  format: 'pdf',
  header: {
    enabled: true,
    content: '{{company_name}} - {{report_title}}',
    height: 60,
    alignment: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    borderBottom: true,
    includeDate: true,
    includePageNumber: false,
    includeCompanyLogo: true,
    logoUrl: ''
  },
  footer: {
    enabled: true,
    content: 'Generated on {{date}} | Page {{page_number}}',
    height: 40,
    alignment: 'center',
    fontSize: 10,
    fontWeight: 'normal',
    color: '#6b7280',
    backgroundColor: '#ffffff',
    borderTop: true,
    includeDate: true,
    includePageNumber: true,
    includeCompanyInfo: true,
    companyInfo: 'Confidential - Internal Use Only'
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 1.6,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 30,
    textAlign: 'left'
  },
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#059669',
    text: '#1f2937',
    background: '#ffffff'
  },
  variables: {
    company_name: 'Your Company',
    report_title: 'Work Report',
    author_name: 'Report Author',
    department: 'Department Name'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const fontFamilies = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
  'Verdana', 'Calibri', 'Open Sans', 'Roboto', 'Lato'
];

const availableVariables = [
  '{{company_name}}', '{{report_title}}', '{{author_name}}', '{{department}}',
  '{{date}}', '{{time}}', '{{page_number}}', '{{total_pages}}',
  '{{report_period}}', '{{generated_by}}', '{{report_type}}'
];

interface ExportTemplateEditorProps {
  onSave: (template: ExportTemplate) => void;
  onCancel: () => void;
  initialTemplate?: ExportTemplate;
}

export default function ExportTemplateEditor({ onSave, onCancel, initialTemplate }: ExportTemplateEditorProps) {
  const [template, setTemplate] = useState<ExportTemplate>(initialTemplate || defaultTemplate);
  const [activeTab, setActiveTab] = useState('general');
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const updateTemplate = (path: string, value: any) => {
    setTemplate(prev => {
      const newTemplate = { ...prev };
      const keys = path.split('.');
      let current: any = newTemplate;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      newTemplate.updatedAt = new Date().toISOString();
      
      return newTemplate;
    });
  };

  const addVariable = (key: string, value: string) => {
    updateTemplate('variables', {
      ...template.variables,
      [key]: value
    });
  };

  const removeVariable = (key: string) => {
    const newVariables = { ...template.variables };
    delete newVariables[key];
    updateTemplate('variables', newVariables);
  };

  const handleSave = () => {
    if (!template.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    const savedTemplate = {
      ...template,
      id: template.id || `template_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    onSave(savedTemplate);
    toast({
      title: "Template Saved",
      description: `Template "${template.name}" has been saved successfully`,
    });
  };

  const insertVariable = (field: 'header.content' | 'footer.content', variable: string) => {
    const currentContent = field === 'header.content' ? template.header.content : template.footer.content;
    const newContent = currentContent + ` ${variable}`;
    updateTemplate(field, newContent);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export Template Editor</h2>
          <p className="text-sm text-gray-600">Design custom headers, footers, and styling for your reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Template
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview
            </CardTitle>
            <CardDescription>
              Preview of how your template will appear in exported documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              {/* Header Preview */}
              {template.header.enabled && (
                <div 
                  className="border-b pb-4 mb-6"
                  style={{
                    height: `${template.header.height}px`,
                    backgroundColor: template.header.backgroundColor,
                    color: template.header.color,
                    fontSize: `${template.header.fontSize}px`,
                    fontWeight: template.header.fontWeight,
                    textAlign: template.header.alignment,
                    borderBottom: template.header.borderBottom ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between h-full">
                    {template.header.includeCompanyLogo && (
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <Image className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 px-4">
                      {template.header.content.replace(/\{\{(\w+)\}\}/g, (match, key) => 
                        template.variables[key] || match
                      )}
                    </div>
                    {template.header.includeDate && (
                      <div className="text-xs text-gray-500">
                        {new Date().toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Body Preview */}
              <div 
                style={{
                  fontFamily: template.body.fontFamily,
                  fontSize: `${template.body.fontSize}px`,
                  lineHeight: template.body.lineHeight,
                  textAlign: template.body.textAlign,
                  color: template.colors.text,
                  margin: `${template.body.marginTop}px ${template.body.marginRight}px ${template.body.marginBottom}px ${template.body.marginLeft}px`
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: template.colors.primary }}>
                  Sample Report Content
                </h3>
                <p className="mb-4">
                  This is a preview of how your report content will appear with the selected template settings. 
                  The actual report will contain your work records and generated analysis.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2" style={{ color: template.colors.secondary }}>
                    Work Summary
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Completed 5 major tasks this week</li>
                    <li>• Made significant progress on project deliverables</li>
                    <li>• Resolved 3 critical issues</li>
                  </ul>
                </div>
              </div>

              {/* Footer Preview */}
              {template.footer.enabled && (
                <div 
                  className="border-t pt-4 mt-6"
                  style={{
                    height: `${template.footer.height}px`,
                    backgroundColor: template.footer.backgroundColor,
                    color: template.footer.color,
                    fontSize: `${template.footer.fontSize}px`,
                    fontWeight: template.footer.fontWeight,
                    textAlign: template.footer.alignment,
                    borderTop: template.footer.borderTop ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between h-full">
                    <div>
                      {template.footer.includeCompanyInfo && template.footer.companyInfo && (
                        <div className="text-xs">{template.footer.companyInfo}</div>
                      )}
                    </div>
                    <div className="flex-1 px-4 text-center">
                      {template.footer.content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                        if (key === 'date') return new Date().toLocaleDateString();
                        if (key === 'page_number') return '1';
                        return template.variables[key] || match;
                      })}
                    </div>
                    <div className="text-xs">
                      {template.footer.includePageNumber && 'Page 1 of 1'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="header" className="gap-2">
              <Layout className="h-4 w-4" />
              Header
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Layout className="h-4 w-4" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="styling" className="gap-2">
              <Palette className="h-4 w-4" />
              Styling
            </TabsTrigger>
            <TabsTrigger value="variables" className="gap-2">
              <Code className="h-4 w-4" />
              Variables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>Basic template settings and metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={template.name}
                      onChange={(e) => updateTemplate('name', e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={template.format} onValueChange={(value) => updateTemplate('format', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="word">Word Document</SelectItem>
                        <SelectItem value="markdown">Markdown File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={(e) => updateTemplate('description', e.target.value)}
                    placeholder="Describe this template's purpose and usage"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Header Configuration
                  <Switch
                    checked={template.header.enabled}
                    onCheckedChange={(checked) => updateTemplate('header.enabled', checked)}
                  />
                </CardTitle>
                <CardDescription>Customize the header that appears at the top of each page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.header.enabled && (
                  <>
                    <div>
                      <Label htmlFor="header-content">Header Content</Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="header-content"
                          value={template.header.content}
                          onChange={(e) => updateTemplate('header.content', e.target.value)}
                          placeholder="Enter header text (use variables like {{company_name}})"
                          rows={2}
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Insert Variable</DialogTitle>
                              <DialogDescription>
                                Click on a variable to insert it into the header content
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-2">
                              {availableVariables.map((variable) => (
                                <Button
                                  key={variable}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable('header.content', variable)}
                                  className="justify-start text-xs"
                                >
                                  {variable}
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="header-height">Height (px)</Label>
                        <Input
                          id="header-height"
                          type="number"
                          value={template.header.height}
                          onChange={(e) => updateTemplate('header.height', parseInt(e.target.value))}
                          min="20"
                          max="200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="header-alignment">Alignment</Label>
                        <Select value={template.header.alignment} onValueChange={(value) => updateTemplate('header.alignment', value)}>
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
                      <div>
                        <Label htmlFor="header-fontSize">Font Size</Label>
                        <Input
                          id="header-fontSize"
                          type="number"
                          value={template.header.fontSize}
                          onChange={(e) => updateTemplate('header.fontSize', parseInt(e.target.value))}
                          min="8"
                          max="24"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="header-color">Text Color</Label>
                        <Input
                          id="header-color"
                          type="color"
                          value={template.header.color}
                          onChange={(e) => updateTemplate('header.color', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="header-bg">Background Color</Label>
                        <Input
                          id="header-bg"
                          type="color"
                          value={template.header.backgroundColor}
                          onChange={(e) => updateTemplate('header.backgroundColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="header-border"
                          checked={template.header.borderBottom}
                          onCheckedChange={(checked) => updateTemplate('header.borderBottom', checked)}
                        />
                        <Label htmlFor="header-border">Show border</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="header-date"
                          checked={template.header.includeDate}
                          onCheckedChange={(checked) => updateTemplate('header.includeDate', checked)}
                        />
                        <Label htmlFor="header-date">Include date</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="header-logo"
                          checked={template.header.includeCompanyLogo}
                          onCheckedChange={(checked) => updateTemplate('header.includeCompanyLogo', checked)}
                        />
                        <Label htmlFor="header-logo">Include logo</Label>
                      </div>
                    </div>

                    {template.header.includeCompanyLogo && (
                      <div>
                        <Label htmlFor="logo-url">Logo URL</Label>
                        <Input
                          id="logo-url"
                          value={template.header.logoUrl || ''}
                          onChange={(e) => updateTemplate('header.logoUrl', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Footer Configuration
                  <Switch
                    checked={template.footer.enabled}
                    onCheckedChange={(checked) => updateTemplate('footer.enabled', checked)}
                  />
                </CardTitle>
                <CardDescription>Customize the footer that appears at the bottom of each page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.footer.enabled && (
                  <>
                    <div>
                      <Label htmlFor="footer-content">Footer Content</Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="footer-content"
                          value={template.footer.content}
                          onChange={(e) => updateTemplate('footer.content', e.target.value)}
                          placeholder="Enter footer text (use variables like {{date}})"
                          rows={2}
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Insert Variable</DialogTitle>
                              <DialogDescription>
                                Click on a variable to insert it into the footer content
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-2">
                              {availableVariables.map((variable) => (
                                <Button
                                  key={variable}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable('footer.content', variable)}
                                  className="justify-start text-xs"
                                >
                                  {variable}
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="footer-height">Height (px)</Label>
                        <Input
                          id="footer-height"
                          type="number"
                          value={template.footer.height}
                          onChange={(e) => updateTemplate('footer.height', parseInt(e.target.value))}
                          min="20"
                          max="200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="footer-alignment">Alignment</Label>
                        <Select value={template.footer.alignment} onValueChange={(value) => updateTemplate('footer.alignment', value)}>
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
                      <div>
                        <Label htmlFor="footer-fontSize">Font Size</Label>
                        <Input
                          id="footer-fontSize"
                          type="number"
                          value={template.footer.fontSize}
                          onChange={(e) => updateTemplate('footer.fontSize', parseInt(e.target.value))}
                          min="8"
                          max="18"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="footer-color">Text Color</Label>
                        <Input
                          id="footer-color"
                          type="color"
                          value={template.footer.color}
                          onChange={(e) => updateTemplate('footer.color', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="footer-bg">Background Color</Label>
                        <Input
                          id="footer-bg"
                          type="color"
                          value={template.footer.backgroundColor}
                          onChange={(e) => updateTemplate('footer.backgroundColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="footer-border"
                          checked={template.footer.borderTop}
                          onCheckedChange={(checked) => updateTemplate('footer.borderTop', checked)}
                        />
                        <Label htmlFor="footer-border">Show border</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="footer-date"
                          checked={template.footer.includeDate}
                          onCheckedChange={(checked) => updateTemplate('footer.includeDate', checked)}
                        />
                        <Label htmlFor="footer-date">Include date</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="footer-page"
                          checked={template.footer.includePageNumber}
                          onCheckedChange={(checked) => updateTemplate('footer.includePageNumber', checked)}
                        />
                        <Label htmlFor="footer-page">Include page numbers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="footer-company"
                          checked={template.footer.includeCompanyInfo}
                          onCheckedChange={(checked) => updateTemplate('footer.includeCompanyInfo', checked)}
                        />
                        <Label htmlFor="footer-company">Include company info</Label>
                      </div>
                    </div>

                    {template.footer.includeCompanyInfo && (
                      <div>
                        <Label htmlFor="company-info">Company Information</Label>
                        <Input
                          id="company-info"
                          value={template.footer.companyInfo || ''}
                          onChange={(e) => updateTemplate('footer.companyInfo', e.target.value)}
                          placeholder="e.g., Confidential - Internal Use Only"
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Body Styling</CardTitle>
                <CardDescription>Configure the main content area styling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select value={template.body.fontFamily} onValueChange={(value) => updateTemplate('body.fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={template.body.fontSize}
                      onChange={(e) => updateTemplate('body.fontSize', parseInt(e.target.value))}
                      min="8"
                      max="18"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="line-height">Line Height</Label>
                    <Input
                      id="line-height"
                      type="number"
                      step="0.1"
                      value={template.body.lineHeight}
                      onChange={(e) => updateTemplate('body.lineHeight', parseFloat(e.target.value))}
                      min="1.0"
                      max="3.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="text-align">Text Alignment</Label>
                    <Select value={template.body.textAlign} onValueChange={(value) => updateTemplate('body.textAlign', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="justify">Justify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="margin-top">Top Margin</Label>
                    <Input
                      id="margin-top"
                      type="number"
                      value={template.body.marginTop}
                      onChange={(e) => updateTemplate('body.marginTop', parseInt(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-right">Right Margin</Label>
                    <Input
                      id="margin-right"
                      type="number"
                      value={template.body.marginRight}
                      onChange={(e) => updateTemplate('body.marginRight', parseInt(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-bottom">Bottom Margin</Label>
                    <Input
                      id="margin-bottom"
                      type="number"
                      value={template.body.marginBottom}
                      onChange={(e) => updateTemplate('body.marginBottom', parseInt(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-left">Left Margin</Label>
                    <Input
                      id="margin-left"
                      type="number"
                      value={template.body.marginLeft}
                      onChange={(e) => updateTemplate('body.marginLeft', parseInt(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>Define the color palette for your template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={template.colors.primary}
                      onChange={(e) => updateTemplate('colors.primary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={template.colors.secondary}
                      onChange={(e) => updateTemplate('colors.secondary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      value={template.colors.accent}
                      onChange={(e) => updateTemplate('colors.accent', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="text-color">Text Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={template.colors.text}
                      onChange={(e) => updateTemplate('colors.text', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="background-color">Background Color</Label>
                    <Input
                      id="background-color"
                      type="color"
                      value={template.colors.background}
                      onChange={(e) => updateTemplate('colors.background', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Variables</CardTitle>
                <CardDescription>
                  Define custom variables that can be used in headers, footers, and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Variable name (e.g., company_name)"
                    id="new-var-key"
                  />
                  <Input
                    placeholder="Default value"
                    id="new-var-value"
                  />
                  <Button
                    onClick={() => {
                      const keyInput = document.getElementById('new-var-key') as HTMLInputElement;
                      const valueInput = document.getElementById('new-var-value') as HTMLInputElement;
                      
                      if (keyInput.value && valueInput.value) {
                        addVariable(keyInput.value, valueInput.value);
                        keyInput.value = '';
                        valueInput.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Current Variables</h4>
                  {Object.entries(template.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Badge variant="secondary">{`{{${key}}}`}</Badge>
                      <Input
                        value={value}
                        onChange={(e) => updateTemplate(`variables.${key}`, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariable(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Available System Variables</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableVariables.map((variable) => (
                      <Badge key={variable} variant="outline" className="justify-start">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}