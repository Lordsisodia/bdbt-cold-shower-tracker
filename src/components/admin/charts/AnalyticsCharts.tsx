import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface LineChartProps {
  data: ChartData[];
  dataKey: string;
  color?: string;
  height?: number;
}

export const AnalyticsLineChart: React.FC<LineChartProps> = ({ 
  data, 
  dataKey, 
  color = '#3B82F6',
  height = 300 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" />
        <YAxis stroke="#6B7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: 'none',
            borderRadius: '8px',
            color: '#F3F4F6'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface BarChartProps {
  data: ChartData[];
  dataKey: string;
  color?: string;
  height?: number;
}

export const AnalyticsBarChart: React.FC<BarChartProps> = ({ 
  data, 
  dataKey, 
  color = '#10B981',
  height = 300 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#6B7280" />
        <YAxis stroke="#6B7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: 'none',
            borderRadius: '8px',
            color: '#F3F4F6'
          }}
        />
        <Legend />
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface PieChartProps {
  data: ChartData[];
  height?: number;
  colors?: string[];
}

export const AnalyticsPieChart: React.FC<PieChartProps> = ({ 
  data, 
  height = 300,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: 'none',
            borderRadius: '8px',
            color: '#F3F4F6'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Real-time update hook
export const useRealtimeChart = (initialData: ChartData[], updateInterval = 5000) => {
  const [data, setData] = React.useState(initialData);

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setData(prevData => 
        prevData.map(item => ({
          ...item,
          value: item.value + Math.floor(Math.random() * 10 - 5)
        }))
      );
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return data;
};