import { TrackedDay } from '../lib/supabase';

export interface ExportData {
  trackedDays: TrackedDay[];
  exportDate: string;
  version: string;
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
}

// Convert tracked days to CSV format
export const exportToCSV = (data: ExportData): string => {
  const headers = [
    'Date',
    'Completed',
    'Extra Cold',
    'Felt Amazing',
    'Duration (minutes)',
    'Temperature',
    'Mood Before',
    'Mood After',
    'Notes'
  ].join(',');

  const rows = data.trackedDays.map(day => [
    day.date,
    day.completed ? 'Yes' : 'No',
    day.extra_cold ? 'Yes' : 'No',
    day.felt_amazing ? 'Yes' : 'No',
    day.duration_minutes || '',
    day.temperature || '',
    day.mood_before || '',
    day.mood_after || '',
    `"${day.notes || ''}"`
  ].join(','));

  return [headers, ...rows].join('\n');
};

// Convert tracked days to JSON format
export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

// Generate PDF content (would need a PDF library like jsPDF)
export const exportToPDF = async (data: ExportData): Promise<Blob> => {
  // For now, return a simple text-based PDF-like content
  // In a real implementation, you'd use jsPDF or similar
  const content = `
COLD SHOWER CHALLENGE REPORT
Generated: ${data.exportDate}

STATISTICS:
- Total Days Tracked: ${data.totalDays}
- Days Completed: ${data.completedDays}
- Success Rate: ${((data.completedDays / data.totalDays) * 100).toFixed(1)}%
- Current Streak: ${data.currentStreak} days
- Longest Streak: ${data.longestStreak} days

DAILY LOG:
${data.trackedDays.map(day => `
${day.date}: ${day.completed ? '✅' : '❌'} ${day.extra_cold ? '❄️' : ''} ${day.felt_amazing ? '🔥' : ''}
${day.notes ? `Notes: ${day.notes}` : ''}
`).join('')}

Generated with BDBT Cold Shower Tracker
  `;

  return new Blob([content], { type: 'text/plain' });
};

// Download file helper
export const downloadFile = (content: string | Blob, filename: string, type: string) => {
  const blob = typeof content === 'string' ? new Blob([content], { type }) : content;
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Calculate statistics from tracked days
export const calculateStats = (trackedDays: TrackedDay[]) => {
  const completedDays = trackedDays.filter(d => d.completed);
  
  // Calculate current streak
  const sortedDays = [...trackedDays]
    .filter(d => d.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let currentStreak = 0;
  const today = new Date();
  let currentDate = new Date(today);
  
  // Check consecutive days from today backwards
  while (currentDate >= new Date(Math.min(...trackedDays.map(d => new Date(d.date).getTime())))) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayData = trackedDays.find(d => d.date === dateStr);
    
    if (dayData?.completed) {
      currentStreak++;
    } else {
      break;
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  
  for (const day of sortedDays.reverse()) {
    const currentDate = new Date(day.date);
    
    if (lastDate && currentDate.getTime() - lastDate.getTime() === 24 * 60 * 60 * 1000) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = currentDate;
  }
  
  return {
    totalDays: trackedDays.length,
    completedDays: completedDays.length,
    currentStreak,
    longestStreak,
    successRate: trackedDays.length > 0 ? (completedDays.length / trackedDays.length) * 100 : 0,
    averageMoodBefore: completedDays.reduce((sum, d) => sum + (d.mood_before || 0), 0) / completedDays.length || 0,
    averageMoodAfter: completedDays.reduce((sum, d) => sum + (d.mood_after || 0), 0) / completedDays.length || 0,
    averageDuration: completedDays.reduce((sum, d) => sum + (d.duration_minutes || 0), 0) / completedDays.length || 0,
    averageTemperature: completedDays.reduce((sum, d) => sum + (d.temperature || 0), 0) / completedDays.length || 0,
    extraColdDays: completedDays.filter(d => d.extra_cold).length,
    amazingDays: completedDays.filter(d => d.felt_amazing).length
  };
};

// Main export function
export const exportData = async (
  trackedDays: TrackedDay[], 
  format: 'csv' | 'json' | 'pdf'
): Promise<void> => {
  const stats = calculateStats(trackedDays);
  
  const exportData: ExportData = {
    trackedDays,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    totalDays: stats.totalDays,
    completedDays: stats.completedDays,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak
  };

  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (format) {
    case 'csv':
      const csvContent = exportToCSV(exportData);
      downloadFile(csvContent, `cold-shower-data-${timestamp}.csv`, 'text/csv');
      break;
      
    case 'json':
      const jsonContent = exportToJSON(exportData);
      downloadFile(jsonContent, `cold-shower-data-${timestamp}.json`, 'application/json');
      break;
      
    case 'pdf':
      const pdfBlob = await exportToPDF(exportData);
      downloadFile(pdfBlob, `cold-shower-report-${timestamp}.txt`, 'text/plain');
      break;
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};