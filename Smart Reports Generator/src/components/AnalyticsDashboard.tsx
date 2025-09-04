import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRecordsStore } from '@/store/records-store';
import { useReportsStore } from '@/store/reports-store';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

interface AnalyticsDashboardProps {
  selectedPeriod?: { start: string; end: string };
}

export default function AnalyticsDashboard({ selectedPeriod }: AnalyticsDashboardProps) {
  const { records } = useRecordsStore();
  const { reports } = useReportsStore();

  // Filter records for selected period or default to last 30 days
  const periodRecords = useMemo(() => {
    if (!selectedPeriod) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return records.filter(record => new Date(record.date) >= thirtyDaysAgo);
    }
    
    const startDate = new Date(selectedPeriod.start);
    const endDate = new Date(selectedPeriod.end);
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }, [records, selectedPeriod]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = periodRecords.length;
    const completed = periodRecords.filter(r => r.category === 'completed').length;
    const inProgress = periodRecords.filter(r => r.category === 'in_progress').length;
    const nextPlan = periodRecords.filter(r => r.category === 'next_plan').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Priority distribution
    const highPriority = periodRecords.filter(r => r.priority === 'high').length;
    const mediumPriority = periodRecords.filter(r => r.priority === 'medium').length;
    const lowPriority = periodRecords.filter(r => r.priority === 'low').length;

    // Total duration in hours
    const totalDuration = periodRecords.reduce((sum, record) => sum + (record.duration || 0), 0);
    const avgDuration = total > 0 ? Math.round((totalDuration / total) * 10) / 10 : 0;

    // Daily productivity data for charts
    const dailyData = periodRecords.reduce((acc, record) => {
      const date = new Date(record.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!acc[date]) {
        acc[date] = { date, completed: 0, inProgress: 0, nextPlan: 0, total: 0 };
      }
      
      acc[date].total++;
      if (record.category === 'completed') acc[date].completed++;
      else if (record.category === 'in_progress') acc[date].inProgress++;
      else if (record.category === 'next_plan') acc[date].nextPlan++;
      
      return acc;
    }, {} as Record<string, any>);

    const chartData = Object.values(dailyData).slice(-14); // Last 14 days

    return {
      total,
      completed,
      inProgress, 
      nextPlan,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      totalDuration,
      avgDuration,
      chartData
    };
  }, [periodRecords]);

  // Color scheme for charts
  const COLORS = {
    completed: 'hsl(142, 76%, 36%)',
    inProgress: 'hsl(38, 92%, 50%)', 
    nextPlan: 'hsl(221, 83%, 53%)',
    high: 'hsl(0, 84%, 60%)',
    medium: 'hsl(38, 92%, 50%)',
    low: 'hsl(142, 76%, 36%)'
  };

  const pieData = [
    { name: 'Completed', value: analytics.completed, color: COLORS.completed },
    { name: 'In Progress', value: analytics.inProgress, color: COLORS.inProgress },
    { name: 'Next Plans', value: analytics.nextPlan, color: COLORS.nextPlan }
  ];

  const priorityData = [
    { name: 'High', value: analytics.highPriority, color: COLORS.high },
    { name: 'Medium', value: analytics.mediumPriority, color: COLORS.medium },
    { name: 'Low', value: analytics.lowPriority, color: COLORS.low }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{analytics.total}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-accent">{analytics.completionRate}%</p>
              </div>
              <div className="flex items-center">
                {analytics.completionRate >= 70 ? (
                  <TrendingUp className="h-8 w-8 text-accent" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-chart-3" />
                )}
              </div>
            </div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{analytics.totalDuration}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{analytics.avgDuration}h</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Daily Activity Trends
            </CardTitle>
            <CardDescription>
              Task completion patterns over the last 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke={COLORS.completed}
                  fill={COLORS.completed}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="inProgress"
                  stackId="1"
                  stroke={COLORS.inProgress}
                  fill={COLORS.inProgress}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="nextPlan"
                  stackId="1"
                  stroke={COLORS.nextPlan}
                  fill={COLORS.nextPlan}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2" />
              Task Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of task categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Analysis and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>
              Task priorities breakdown and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={60} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Priority Insights */}
            <div className="space-y-2">
              {analytics.highPriority > analytics.total * 0.4 && (
                <div className="flex items-center space-x-2 p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm">High priority tasks exceed 40% - consider delegation</span>
                </div>
              )}
              {analytics.completionRate < 60 && (
                <div className="flex items-center space-x-2 p-2 bg-chart-3/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-chart-3" />
                  <span className="text-sm">Low completion rate - focus on fewer concurrent tasks</span>
                </div>
              )}
              {analytics.completionRate >= 80 && (
                <div className="flex items-center space-x-2 p-2 bg-accent/10 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="text-sm">Excellent completion rate - great productivity!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>
              AI-generated productivity analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <h4 className="font-medium text-accent mb-2">🎯 Strengths</h4>
                <ul className="text-sm space-y-1">
                  {analytics.completionRate >= 70 && (
                    <li>• High task completion rate ({analytics.completionRate}%)</li>
                  )}
                  {analytics.avgDuration > 0 && analytics.avgDuration <= 4 && (
                    <li>• Good time management with {analytics.avgDuration}h average duration</li>
                  )}
                  {analytics.total >= 10 && (
                    <li>• Consistent work logging with {analytics.total} recorded tasks</li>
                  )}
                </ul>
              </div>

              <div className="p-3 bg-chart-3/10 rounded-lg">
                <h4 className="font-medium text-chart-3 mb-2">⚡ Opportunities</h4>
                <ul className="text-sm space-y-1">
                  {analytics.completionRate < 60 && (
                    <li>• Focus on completing started tasks before adding new ones</li>
                  )}
                  {analytics.highPriority > analytics.mediumPriority + analytics.lowPriority && (
                    <li>• Balance high-priority tasks with manageable workload</li>
                  )}
                  {analytics.avgDuration > 6 && (
                    <li>• Consider breaking down large tasks into smaller chunks</li>
                  )}
                  {analytics.total < 5 && (
                    <li>• Increase work record logging for better insights</li>
                  )}
                </ul>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg">
                <h4 className="font-medium text-primary mb-2">📈 Recommendations</h4>
                <ul className="text-sm space-y-1">
                  <li>• Schedule regular review sessions to update task status</li>
                  <li>• Use time-blocking for high-priority items</li>
                  <li>• Set daily completion targets based on historical data</li>
                  {reports.length > 0 && (
                    <li>• Generate weekly reports to track improvement trends</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}