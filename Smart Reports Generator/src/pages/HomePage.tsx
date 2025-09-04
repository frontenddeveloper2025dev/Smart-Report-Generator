import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, Brain, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Smart Report Generator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform scattered work records into professional reports with AI-powered analysis and insights
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/dashboard')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-accent" />
              </div>
              <CardTitle>AI-Powered Categorization</CardTitle>
              <CardDescription>Automatically organize work items into completed, in-progress, and planned tasks</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Smart algorithms analyze your work patterns and categorize items for maximum clarity and insight.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-chart-2/10 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-chart-2" />
              </div>
              <CardTitle>Data Analysis & Charts</CardTitle>
              <CardDescription>Generate visual insights and performance metrics from your work data</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Professional charts and analytics help identify trends, bottlenecks, and opportunities for improvement.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <CardTitle>Professional Reports</CardTitle>
              <CardDescription>Export to Word, PDF, or Markdown with customizable templates</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Beautiful, professional reports ready for meetings, reviews, and stakeholder communications.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow */}
        <div className="bg-card/50 rounded-3xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Simple 3-Step Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold">Input Work Records</h3>
              <p className="text-muted-foreground">
                Add your daily tasks, accomplishments, and work items with simple forms or bulk import.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI automatically categorizes, highlights key achievements, and identifies improvement areas.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-chart-2 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold">Generate Reports</h3>
              <p className="text-muted-foreground">
                Professional reports generated instantly, ready for export in multiple formats.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">Why Choose Smart Report Generator?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 p-4 bg-card/30 rounded-xl">
              <Clock className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Save Hours Weekly</h3>
                <p className="text-sm text-muted-foreground">Automate report creation and focus on what matters</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-card/30 rounded-xl">
              <TrendingUp className="w-8 h-8 text-accent flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Data-Driven Insights</h3>
                <p className="text-sm text-muted-foreground">Identify patterns and improve productivity</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-card/30 rounded-xl">
              <Brain className="w-8 h-8 text-chart-2 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">Smart categorization and suggestion engine</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-card/30 rounded-xl">
              <FileText className="w-8 h-8 text-chart-5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Professional Output</h3>
                <p className="text-sm text-muted-foreground">Export-ready reports for any audience</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 bg-primary/5 rounded-3xl">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Reporting?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join professionals who have streamlined their reporting process with AI-powered insights.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate('/dashboard')}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Creating Reports
          </Button>
        </div>
      </div>
    </div>
  );
}