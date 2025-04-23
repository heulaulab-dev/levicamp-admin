/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuth';

// Define types for the export state
interface ExportState {
  isExporting: boolean;
  
  // API Methods
  exportBookings: () => Promise<string | null>;
  exportRefunds: () => Promise<string | null>;
}

// Track if we're currently exporting to prevent duplicate requests
let isExportingInProgress = false;

export const useExport = create<ExportState>((set) => {
  // Helper function to handle API errors
  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(`Error: ${defaultMessage}`, error);
    const errorDescription = error.response?.data?.error?.description;
    const errorMessage =
      errorDescription || error.response?.data?.message || defaultMessage;

    if (error.response?.status === 429) {
      console.log('Rate limit exceeded');
      toast.error('Too many requests. Please try again later.');
    } else {
      toast.error(errorMessage);
    }

    set({ isExporting: false });
    return null;
  };

  // Helper function to make authenticated API requests for exports
  const makeExportRequest = async <T>(endpoint: string): Promise<T | null> => {
    if (isExportingInProgress) {
      console.log('Export already in progress, skipping duplicate request');
    }

    isExportingInProgress = true;
    const currentToken = useAuthStore.getState().token;
    
    try {
      set({ isExporting: true });

      const response = await api.get(endpoint,  {
        headers: {
          Authorization: `Bearer ${currentToken}`
        },
        responseType: 'blob' // For handling file downloads
      });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      const today = new Date().toISOString().split('T')[0];
      let filename = `export-${today}.xlsx`;
      if (endpoint.includes('booking')) {
        filename = `levicamp_booking_list_export_${today}.xlsx`;
      } else if (endpoint.includes('refund')) {
        filename = `levicamp_refund_list_export_${today}.xlsx`;
      }
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      set({ isExporting: false });
      return url as unknown as T;
    } catch (error: any) {
      return handleApiError(error, `Failed to export data`);
    } finally {
      isExportingInProgress = false;
      set({ isExporting: false });
    }
  };

  return {
    // State
    isExporting: false,
    
    // Export bookings data
    exportBookings: async () => {
      return makeExportRequest<string>('/exports/booking');
    },
    
    // Export refunds data
    exportRefunds: async () => {
      return makeExportRequest<string>('/exports/refund');
    }
  };
});