import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useReportsStore } from '@/store/reports-store';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Clock,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface SearchFilters {
  query: string;
  type: 'all' | 'weekly' | 'monthly' | 'quarterly';
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year';
  sortBy: 'date' | 'type' | 'title';
  sortOrder: 'asc' | 'desc';
}

export default function ReportSearch() {
  const { reports } = useReportsStore();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(query) ||
        report.content.toLowerCase().includes(query) ||
        report.summary?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(report => report.report_type === filters.type);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(report => 
        new Date(report.generated_at) >= cutoffDate
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.generated_at);
          bValue = new Date(b.generated_at);
          break;
        case 'type':
          aValue = a.report_type;
          bValue = b.report_type;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.generated_at;
          bValue = b.generated_at;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [reports, filters]);

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && value !== 'date' && value !== 'desc'
  ).length;

  const getTypeIcon = (reportType: string) => {
    switch (reportType) {
      case 'weekly':
        return <Calendar className="w-4 h-4" />;
      case 'monthly':
        return <BarChart3 className="w-4 h-4" />;
      case 'quarterly':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeVariant = (reportType: string): "default" | "secondary" | "outline" => {
    switch (reportType) {
      case 'weekly':
        return 'default';
      case 'monthly':
        return 'secondary';
      case 'quarterly':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search reports by title, content, or summary..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>
              Refine your search with specific criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="weekly">Weekly Reports</SelectItem>
                    <SelectItem value="monthly">Monthly Reports</SelectItem>
                    <SelectItem value="quarterly">Quarterly Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Report Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort Order</label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {filteredReports.length} of {reports.length} reports
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                {reports.length === 0 
                  ? "You haven't generated any reports yet. Create your first report to get started."
                  : "Try adjusting your search criteria or filters to find what you're looking for."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.report_type)}
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge variant={getTypeBadgeVariant(report.report_type)}>
                        {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(report.generated_at), 'MMM d, yyyy')}</span>
                      </div>
                      {report.period_start && report.period_end && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {report.summary && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {report.summary}
                  </p>
                )}
                
                {report.highlights && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Key Highlights:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const highlights = JSON.parse(report.highlights);
                          if (Array.isArray(highlights)) {
                            return (
                              <>
                                {highlights.slice(0, 3).map((highlight, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {highlight.length > 50 ? `${highlight.substring(0, 50)}...` : highlight}
                                  </Badge>
                                ))}
                                {highlights.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{highlights.length - 3} more
                                  </Badge>
                                )}
                              </>
                            );
                          }
                        } catch (e) {
                          // If highlights is not valid JSON, treat as single string
                          return (
                            <Badge variant="outline" className="text-xs">
                              {report.highlights.length > 50 ? `${report.highlights.substring(0, 50)}...` : report.highlights}
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}