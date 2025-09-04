import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecordsStore } from '@/store/records-store';
import { 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function RecordsList() {
  const { records, isLoading, deleteRecord } = useRecordsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter records based on search and filters
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || record.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-chart-3" />;
      case 'next_plan': return <FileText className="w-4 h-4 text-primary" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'completed': return 'bg-accent/10 text-accent border-accent/20';
      case 'in_progress': return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'next_plan': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'low': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted';
    }
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this work record?')) {
      try {
        await deleteRecord(recordId);
      } catch (error) {
        console.error('Failed to delete record:', error);
      }
    }
  };

  if (isLoading && records.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading work records...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
                <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                <SelectItem value="next_plan">📋 Next Plan</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">🔴 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No work records found</h3>
              <p className="text-muted-foreground mb-4">
                {records.length === 0 
                  ? "Start by adding your first work record"
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <Card key={record._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(record.category)}
                        <h3 className="font-semibold text-lg">{record.title}</h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDelete(record._id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Description */}
                    {record.description && (
                      <p className="text-muted-foreground">{record.description}</p>
                    )}
                    
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`capitalize ${getCategoryColor(record.category)}`}>
                        {record.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={`capitalize ${getPriorityColor(record.priority)}`}>
                        {record.priority} priority
                      </Badge>
                      {record.status && (
                        <Badge variant="secondary" className="capitalize">
                          {record.status}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      {record.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.floor(record.duration / 60)}h {record.duration % 60}m
                        </div>
                      )}
                      <div className="text-xs">
                        Added {new Date(record.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Results count */}
      {filteredRecords.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredRecords.length} of {records.length} work records
        </div>
      )}
    </div>
  );
}