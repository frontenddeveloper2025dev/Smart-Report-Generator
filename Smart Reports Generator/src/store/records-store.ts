import { create } from 'zustand';
import { table } from '@devvai/devv-code-backend';

interface WorkRecord {
  _id: string;
  _uid: string;
  title: string;
  description: string;
  category: 'completed' | 'in_progress' | 'next_plan';
  priority: 'high' | 'medium' | 'low';
  date: string;
  duration?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RecordsState {
  records: WorkRecord[];
  isLoading: boolean;
  
  // Actions
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<WorkRecord, '_id' | '_uid' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecord: (id: string, updates: Partial<WorkRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  categorizeWithAI: (records: WorkRecord[]) => Promise<WorkRecord[]>;
}

const TABLE_ID = 'ex33krfy718g'; // work_records table ID

export const useRecordsStore = create<RecordsState>()((set, get) => ({
  records: [],
  isLoading: false,
  
  fetchRecords: async () => {
    set({ isLoading: true });
    try {
      const response = await table.getItems(TABLE_ID, {
        sort: 'date',
        order: 'desc',
        limit: 100
      });
      set({ records: response.items as WorkRecord[], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch records:', error);
      set({ isLoading: false });
    }
  },
  
  addRecord: async (recordData) => {
    set({ isLoading: true });
    try {
      const now = new Date().toISOString();
      await table.addItem(TABLE_ID, {
        ...recordData,
        created_at: now,
        updated_at: now
      });
      
      // Refresh records
      await get().fetchRecords();
    } catch (error) {
      console.error('Failed to add record:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateRecord: async (id, updates) => {
    set({ isLoading: true });
    try {
      const record = get().records.find(r => r._id === id);
      if (!record) throw new Error('Record not found');
      
      await table.updateItem(TABLE_ID, {
        _uid: record._uid,
        _id: id,
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      // Refresh records
      await get().fetchRecords();
    } catch (error) {
      console.error('Failed to update record:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  deleteRecord: async (id) => {
    set({ isLoading: true });
    try {
      const record = get().records.find(r => r._id === id);
      if (!record) throw new Error('Record not found');
      
      await table.deleteItem(TABLE_ID, {
        _uid: record._uid,
        _id: id
      });
      
      // Refresh records
      await get().fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  categorizeWithAI: async (records) => {
    // This will be implemented with AI categorization
    // For now, return records as-is
    return records;
  }
}));