import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  FileText, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Search,
  Filter,
  Star,
  StarOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ExportTemplateEditor from './ExportTemplateEditor';

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

const predefinedTemplates: ExportTemplate[] = [
  {
    id: 'corporate-standard',
    name: 'Corporate Standard',
    description: 'Professional corporate report template with company branding',
    format: 'pdf',
    category: 'Business',
    isFavorite: true,
    header: {
      enabled: true,
      content: '{{company_name}} - {{report_title}}',
      height: 70,
      alignment: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1f2937',
      backgroundColor: '#f8fafc',
      borderBottom: true,
      includeDate: true,
      includePageNumber: false,
      includeCompanyLogo: true
    },
    footer: {
      enabled: true,
      content: 'Generated on {{date}} | Page {{page_number}} of {{total_pages}}',
      height: 45,
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
      fontFamily: 'Arial',
      fontSize: 11,
      lineHeight: 1.6,
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 35,
      marginRight: 35,
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
      company_name: 'Acme Corporation',
      report_title: 'Weekly Progress Report',
      author_name: 'John Doe',
      department: 'Operations'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple, clean template with minimal styling',
    format: 'markdown',
    category: 'Simple',
    header: {
      enabled: true,
      content: '{{report_title}}',
      height: 50,
      alignment: 'left',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000000',
      backgroundColor: '#ffffff',
      borderBottom: false,
      includeDate: false,
      includePageNumber: false,
      includeCompanyLogo: false
    },
    footer: {
      enabled: true,
      content: 'Page {{page_number}}',
      height: 30,
      alignment: 'right',
      fontSize: 9,
      fontWeight: 'normal',
      color: '#666666',
      backgroundColor: '#ffffff',
      borderTop: false,
      includeDate: false,
      includePageNumber: true,
      includeCompanyInfo: false
    },
    body: {
      fontFamily: 'Inter',
      fontSize: 12,
      lineHeight: 1.5,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 30,
      marginRight: 30,
      textAlign: 'left'
    },
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#007acc',
      text: '#333333',
      background: '#ffffff'
    },
    variables: {
      report_title: 'Work Summary',
      author_name: 'Team Member'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'Formal template for executive reports and presentations',
    format: 'word',
    category: 'Executive',
    header: {
      enabled: true,
      content: 'EXECUTIVE REPORT - {{report_title}}',
      height: 80,
      alignment: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: '#1e40af',
      borderBottom: true,
      includeDate: true,
      includePageNumber: false,
      includeCompanyLogo: true
    },
    footer: {
      enabled: true,
      content: '{{company_name}} | {{department}} | {{date}}',
      height: 50,
      alignment: 'center',
      fontSize: 10,
      fontWeight: 'normal',
      color: '#ffffff',
      backgroundColor: '#1e40af',
      borderTop: true,
      includeDate: true,
      includePageNumber: true,
      includeCompanyInfo: true,
      companyInfo: 'Strictly Confidential'
    },
    body: {
      fontFamily: 'Times New Roman',
      fontSize: 12,
      lineHeight: 1.8,
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 40,
      marginRight: 40,
      textAlign: 'justify'
    },
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#dc2626',
      text: '#1f2937',
      background: '#ffffff'
    },
    variables: {
      company_name: 'Executive Corp',
      report_title: 'Quarterly Review',
      author_name: 'C-Level Executive',
      department: 'Executive Office'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface TemplateManagerProps {
  onSelectTemplate: (template: ExportTemplate) => void;
  onClose: () => void;
}

export default function TemplateManager({ onSelectTemplate, onClose }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load templates from localStorage or use predefined templates
    const savedTemplates = localStorage.getItem('export-templates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates([...predefinedTemplates, ...parsed]);
      } catch (error) {
        console.error('Failed to load saved templates:', error);
        setTemplates(predefinedTemplates);
      }
    } else {
      setTemplates(predefinedTemplates);
    }
  }, []);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveTemplate = (template: ExportTemplate) => {
    const existingIndex = templates.findIndex(t => t.id === template.id);
    let updatedTemplates;
    
    if (existingIndex >= 0) {
      updatedTemplates = [...templates];
      updatedTemplates[existingIndex] = template;
      toast({
        title: "Template Updated",
        description: `Template "${template.name}" has been updated successfully`,
      });
    } else {
      updatedTemplates = [...templates, template];
      toast({
        title: "Template Created",
        description: `Template "${template.name}" has been created successfully`,
      });
    }
    
    // Save to localStorage
    localStorage.setItem('export-templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    localStorage.setItem('export-templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    toast({
      title: "Template Deleted",
      description: "Template has been removed successfully",
    });
  };

  const handleDuplicateTemplate = (template: ExportTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedTemplates = [...templates, duplicatedTemplate];
    localStorage.setItem('export-templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    toast({
      title: "Template Duplicated",
      description: `Created a copy of "${template.name}"`,
    });
  };

  const handleToggleFavorite = (templateId: string) => {
    const updatedTemplates = templates.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    );
    localStorage.setItem('export-templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleExportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'export-templates.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Templates Exported",
      description: "All templates have been exported successfully",
    });
  };

  const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTemplates = JSON.parse(e.target?.result as string);
        setTemplates([...templates, ...importedTemplates]);
        toast({
          title: "Templates Imported",
          description: `Successfully imported ${importedTemplates.length} templates`,
        });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import templates. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  if (showEditor) {
    return (
      <ExportTemplateEditor
        initialTemplate={editingTemplate || undefined}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Manager</h2>
          <p className="text-sm text-gray-600">Create and manage export templates for your reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowEditor(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Button>
          <Button
            variant="outline"
            onClick={handleExportTemplates}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export All
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleImportTemplates}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    {template.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFavorite(template.id)}
                >
                  {template.isFavorite ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {template.format.toUpperCase()}
                  </Badge>
                  {template.category && (
                    <Badge variant="outline">
                      {template.category}
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <div>Header: {template.header.enabled ? 'Enabled' : 'Disabled'}</div>
                  <div>Footer: {template.footer.enabled ? 'Enabled' : 'Disabled'}</div>
                  <div>Variables: {Object.keys(template.variables).length}</div>
                </div>

                <div className="text-xs text-gray-500">
                  Updated: {new Date(template.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowEditor(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{template.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by creating your first export template.'}
          </p>
          <Button onClick={() => setShowEditor(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
}