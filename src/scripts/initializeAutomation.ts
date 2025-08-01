import { supabase } from '../lib/supabase';
import { AutomatedTipGenerationService } from '../services/automatedTipGeneration';
import { EmailCampaignService } from '../services/emailCampaignService';

/**
 * Initialize all automation services
 * This should be called when the application starts
 */
export const initializeAutomation = async () => {
  try {
    console.log('🚀 Initializing automation services...');

    // Start the tip generation scheduler
    await AutomatedTipGenerationService.scheduleDailyGeneration();
    console.log('✅ Tip generation scheduler started');

    // Start the email campaign scheduler
    await EmailCampaignService.scheduleCampaigns();
    console.log('✅ Email campaign scheduler started');

    // Log successful initialization
    console.log('🎉 All automation services initialized successfully');

    // Run initial checks
    await runHealthChecks();

  } catch (error) {
    console.error('❌ Failed to initialize automation services:', error);
    // Continue running the app even if automation fails
  }
};

/**
 * Run health checks on automation services
 */
const runHealthChecks = async () => {
  try {
    // Check database connectivity
    const { data, error } = await supabase
      .from('scheduled_jobs')
      .select('count')
      .single();

    if (error) {
      console.warn('⚠️ Database health check failed:', error);
    } else {
      console.log('✅ Database connectivity verified');
    }

    // Check for any stuck jobs
    const now = new Date();
    const { data: overdueJobs } = await supabase
      .from('scheduled_jobs')
      .select('*')
      .eq('status', 'active')
      .lt('next_run', now.toISOString());

    if (overdueJobs && overdueJobs.length > 0) {
      console.warn(`⚠️ Found ${overdueJobs.length} overdue jobs`);
      // Could trigger them here if needed
    }

  } catch (error) {
    console.error('Health check error:', error);
  }
};

/**
 * Shutdown automation services gracefully
 */
export const shutdownAutomation = async () => {
  console.log('Shutting down automation services...');
  // Add cleanup logic here if needed
};

// For manual testing in development
if (import.meta.env.DEV) {
  (window as any).automation = {
    triggerTipGeneration: () => AutomatedTipGenerationService.triggerManualGeneration(5),
    runHealthChecks,
    initializeAutomation
  };
}