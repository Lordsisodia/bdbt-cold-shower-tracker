import { Activity, AlertCircle, Calendar, CheckCircle, Clock, FileText, Mail, Pause, Play, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { AutomatedTipGenerationService } from '../../services/automatedTipGeneration';

interface ScheduledJob {
  id: string;
  job_name: string;
  job_type: string;
  schedule: string;
  last_run?: string;
  next_run?: string;
  status: 'active' | 'paused' | 'error';
  config: any;
}

interface AutomationLog {
  id: string;
  process: string;
  status: string;
  details: any;
  error_message?: string;
  timestamp: string;
}

export const AutomationDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [stats, setStats] = useState({
    tipsGeneratedToday: 0,
    emailsSentToday: 0,
    automationHealth: 100,
    nextGeneration: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomationData();
    const interval = setInterval(loadAutomationData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadAutomationData = async () => {
    try {
      // Load scheduled jobs
      const { data: jobsData } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .order('next_run', { ascending: true });
      
      setJobs(jobsData || []);

      // Load recent logs
      const { data: logsData } = await supabase
        .from('automation_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      
      setLogs(logsData || []);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      
      // Tips generated today
      const { count: tipsCount } = await supabase
        .from('tips')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'automated_generation')
        .gte('created_at', today);

      // Emails sent today
      const { count: emailsCount } = await supabase
        .from('email_tracking')
        .select('*', { count: 'exact', head: true })
        .gte('sent_at', today);

      // Next generation time
      const nextGenJob = jobsData?.find(j => j.job_type === 'tip_generation');
      
      setStats({
        tipsGeneratedToday: tipsCount || 0,
        emailsSentToday: emailsCount || 0,
        automationHealth: calculateHealth(logsData || []),
        nextGeneration: nextGenJob?.next_run || ''
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading automation data:', error);
      setLoading(false);
    }
  };

  const calculateHealth = (logs: AutomationLog[]): number => {
    const recentLogs = logs.slice(0, 10);
    const errorCount = recentLogs.filter(l => l.status === 'error').length;
    return Math.max(0, 100 - (errorCount * 10));
  };

  const handleManualTrigger = async (jobType: string) => {
    try {
      if (jobType === 'tip_generation') {
        const result = await AutomatedTipGenerationService.triggerManualGeneration(10);
        alert(`Generated ${result.successful} tips successfully!`);
      } else if (jobType === 'email_campaign') {
        alert('Email campaign triggered!');
      }
      loadAutomationData();
    } catch (error) {
      alert('Failed to trigger job: ' + error.message);
    }
  };

  const toggleJobStatus = async (job: ScheduledJob) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    
    await supabase
      .from('scheduled_jobs')
      .update({ status: newStatus })
      .eq('id', job.id);
    
    loadAutomationData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600';
      case 'paused':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatSchedule = (schedule: string) => {
    // Convert cron to readable format
    if (schedule === '0 6 * * *') return 'Daily at 6:00 AM';
    if (schedule === '0 9 * * 1') return 'Weekly on Monday at 9:00 AM';
    if (schedule === '0 2 * * *') return 'Daily at 2:00 AM';
    return schedule;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Automation Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and control automated processes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tips Generated Today</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.tipsGeneratedToday}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emails Sent Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.emailsSentToday}</p>
            </div>
            <Mail className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Automation Health</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.automationHealth}%</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next Generation</p>
              <p className="text-lg font-bold text-orange-600 mt-2">
                {stats.nextGeneration ? new Date(stats.nextGeneration).toLocaleTimeString() : 'Not scheduled'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Scheduled Jobs */}
      <Card className="mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Jobs
          </h2>
        </div>
        <div className="divide-y">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900">{job.job_name}</h3>
                  <span className={`text-sm ${getStatusColor(job.status)}`}>
                    {job.status === 'active' ? <CheckCircle className="w-4 h-4 inline" /> : 
                     job.status === 'paused' ? <Pause className="w-4 h-4 inline" /> :
                     <AlertCircle className="w-4 h-4 inline" />}
                    {' '}{job.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>Schedule: {formatSchedule(job.schedule)}</p>
                  <p>Last run: {job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}</p>
                  <p>Next run: {job.next_run ? new Date(job.next_run).toLocaleString() : 'Not scheduled'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleManualTrigger(job.job_type)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleJobStatus(job)}
                >
                  {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity Logs */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="p-4 border-b hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getStatusColor(log.status)}`}>
                      {log.status === 'completed' ? <CheckCircle className="w-4 h-4 inline" /> :
                       log.status === 'error' ? <AlertCircle className="w-4 h-4 inline" /> :
                       <RefreshCw className="w-4 h-4 inline" />}
                      {' '}{log.process}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-gray-600 mt-1">
                      {log.details.successful && `${log.details.successful} tips generated • `}
                      {log.details.failed && `${log.details.failed} failed • `}
                      {log.details.duration_ms && `Duration: ${(log.details.duration_ms / 1000).toFixed(1)}s`}
                    </p>
                  )}
                  {log.error_message && (
                    <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};