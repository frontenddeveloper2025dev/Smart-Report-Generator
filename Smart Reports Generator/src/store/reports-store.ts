import { create } from 'zustand';
import { table } from '@devvai/devv-code-backend';
import { DevvAI } from '@devvai/devv-code-backend';

interface GeneratedReport {
  _id: string;
  _uid: string;
  title: string;
  report_type: 'weekly' | 'monthly' | 'quarterly';
  content: string;
  summary: string;
  highlights: string; // JSON array as string
  suggestions: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  record_count: number;
}

interface ReportsState {
  reports: GeneratedReport[];
  currentReport: GeneratedReport | null;
  isLoading: boolean;
  isGenerating: boolean;
  
  // Actions
  fetchReports: () => Promise<void>;
  generateReport: (recordIds: string[], reportType: 'weekly' | 'monthly' | 'quarterly', periodStart: string, periodEnd: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  setCurrentReport: (report: GeneratedReport | null) => void;
}

const TABLE_ID = 'ex33l4t7mrk0'; // generated_reports table ID
const RECORDS_TABLE_ID = 'ex33krfy718g'; // work_records table ID

export const useReportsStore = create<ReportsState>()((set, get) => ({
  reports: [],
  currentReport: null,
  isLoading: false,
  isGenerating: false,
  
  fetchReports: async () => {
    set({ isLoading: true });
    try {
      const response = await table.getItems(TABLE_ID, {
        sort: 'generated_at',
        order: 'desc',
        limit: 50
      });
      set({ reports: response.items as GeneratedReport[], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      set({ isLoading: false });
    }
  },
  
  generateReport: async (recordIds, reportType, periodStart, periodEnd) => {
    set({ isGenerating: true });
    try {
      // Fetch the work records for the specified period
      const recordsResponse = await table.getItems(RECORDS_TABLE_ID, {
        query: {
          date: {
            operator: 'BETWEEN',
            value: [periodStart, periodEnd]
          }
        },
        limit: 100
      });
      
      const records = recordsResponse.items;
      
      if (records.length === 0) {
        throw new Error('No work records found for the selected period');
      }
      
      // Use AI to analyze and generate the report
      const ai = new DevvAI();
      
      // Prepare records data for AI analysis
      const recordsText = records.map(record => 
        `Title: ${record.title}\nDescription: ${record.description}\nCategory: ${record.category}\nPriority: ${record.priority}\nDate: ${record.date}\nStatus: ${record.status}\n---`
      ).join('\n');
      
      const reportPrompt = `
You are a professional report generator. Analyze the following work records and create a comprehensive ${reportType} report.

WORK RECORDS:
${recordsText}

Please generate:
1. A professional executive summary
2. Key accomplishments and highlights
3. Current progress and in-progress items
4. Upcoming plans and priorities
5. Identified challenges and improvement suggestions
6. Quantitative analysis where possible

Format the response as JSON with these fields:
- title: A professional title for this ${reportType} report
- summary: Executive summary (2-3 paragraphs)
- content: Full report content in markdown format
- highlights: Array of key accomplishments (max 5 items)
- suggestions: Array of improvement suggestions (max 3 items)

Focus on professional language, actionable insights, and clear organization.`;

      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          { role: 'system', content: 'You are a professional business report writer. Always respond with valid JSON.' },
          { role: 'user', content: reportPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      const aiResponse = response.choices[0].message.content;
      let reportData;
      
      try {
        reportData = JSON.parse(aiResponse || '{}');
      } catch (parseError) {
        // Fallback if AI doesn't return valid JSON
        reportData = {
          title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Work Report`,
          summary: 'Report generated from work records analysis.',
          content: aiResponse || 'Report content could not be generated.',
          highlights: ['Work records processed successfully'],
          suggestions: ['Continue tracking work progress']
        };
      }
      
      // Save the generated report
      const now = new Date().toISOString();
      await table.addItem(TABLE_ID, {
        title: reportData.title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        report_type: reportType,
        content: reportData.content || '',
        summary: reportData.summary || '',
        highlights: JSON.stringify(reportData.highlights || []),
        suggestions: reportData.suggestions || '',
        period_start: periodStart,
        period_end: periodEnd,
        generated_at: now,
        record_count: records.length
      });
      
      // Refresh reports list
      await get().fetchReports();
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },
  
  deleteReport: async (id) => {
    set({ isLoading: true });
    try {
      const report = get().reports.find(r => r._id === id);
      if (!report) throw new Error('Report not found');
      
      await table.deleteItem(TABLE_ID, {
        _uid: report._uid,
        _id: id
      });
      
      // Refresh reports
      await get().fetchReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  setCurrentReport: (report) => {
    set({ currentReport: report });
  }
}));