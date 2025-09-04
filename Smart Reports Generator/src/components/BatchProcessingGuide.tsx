import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Zap, 
  Clock, 
  Layers, 
  Settings,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  Download
} from 'lucide-react';

export function BatchProcessingGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Batch Processing Guide</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn how to efficiently export multiple reports with advanced batch processing features
        </p>
      </div>

      {/* Processing Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="w-5 h-5" />
            <span>Processing Modes</span>
          </CardTitle>
          <CardDescription>
            Choose the right mode for your export needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium">Individual Files</h3>
                <Badge variant="secondary">Default</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Export each report as a separate file with parallel processing
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Parallel processing for speed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Individual file control</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Progress tracking per report</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <h3 className="font-medium">Combined Document</h3>
                <Badge variant="outline">Consolidated</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Merge all selected reports into one comprehensive document
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Single comprehensive file</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Easier sharing and storage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Cross-report analysis</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Performance Optimization</span>
          </CardTitle>
          <CardDescription>
            Fine-tune batch processing for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Settings className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium mb-2">Batch Size</h3>
              <p className="text-sm text-muted-foreground">
                Number of reports processed simultaneously. Higher values increase speed but use more resources.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Recommended: 5-10 reports
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium mb-2">Processing Delay</h3>
              <p className="text-sm text-muted-foreground">
                Pause between exports to prevent system overload and ensure stability.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Recommended: 500-1000ms
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Download className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium mb-2">Format Choice</h3>
              <p className="text-sm text-muted-foreground">
                Different formats have varying processing times and file sizes.
              </p>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div>PDF: ~3s per report</div>
                <div>Word: ~1.5s per report</div>
                <div>Markdown: ~0.1s per report</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-green-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Do</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Start with small batches (5-10 reports) to test performance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Use filtering to export only relevant reports</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Monitor progress and wait for completion</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Use combined mode for related reports</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-red-600 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Don't</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Export more than 50 reports at once</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Close the browser tab during processing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Set batch size too high on slower devices</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Remove delay between exports unless necessary</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Estimates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Performance Estimates</span>
          </CardTitle>
          <CardDescription>
            Estimated processing times for different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Reports</th>
                  <th className="text-left p-2">PDF</th>
                  <th className="text-left p-2">Word</th>
                  <th className="text-left p-2">Markdown</th>
                  <th className="text-left p-2">Combined</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="p-2 font-medium">5 reports</td>
                  <td className="p-2">~15 seconds</td>
                  <td className="p-2">~8 seconds</td>
                  <td className="p-2">~3 seconds</td>
                  <td className="p-2">~5 seconds</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">10 reports</td>
                  <td className="p-2">~30 seconds</td>
                  <td className="p-2">~15 seconds</td>
                  <td className="p-2">~5 seconds</td>
                  <td className="p-2">~8 seconds</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">25 reports</td>
                  <td className="p-2">~1.5 minutes</td>
                  <td className="p-2">~45 seconds</td>
                  <td className="p-2">~15 seconds</td>
                  <td className="p-2">~20 seconds</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">50 reports</td>
                  <td className="p-2">~3 minutes</td>
                  <td className="p-2">~1.5 minutes</td>
                  <td className="p-2">~30 seconds</td>
                  <td className="p-2">~45 seconds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Times are estimates and may vary based on system performance and report complexity
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🚀 Speed Optimization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use Markdown for fastest exports</li>
                <li>• Increase batch size on powerful devices</li>
                <li>• Filter reports before exporting</li>
                <li>• Close other browser tabs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">🎯 Quality Control</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Preview reports before batch export</li>
                <li>• Use combined mode for consistency</li>
                <li>• Include metadata for context</li>
                <li>• Test with small batches first</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}