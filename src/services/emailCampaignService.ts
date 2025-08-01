import { supabase } from '../lib/supabase';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  template_id: string;
  segment: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  scheduled_for?: string;
  sent_count: number;
  open_rate?: number;
  click_rate?: number;
}

interface EmailTracking {
  campaign_id: string;
  recipient_email: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  unsubscribed_at?: string;
}

export class EmailCampaignService {
  // Email template management
  static async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...template,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Campaign management
  static async createCampaign(campaign: {
    name: string;
    template_id: string;
    segment: string;
    scheduled_for?: string;
  }): Promise<Campaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({
        ...campaign,
        status: campaign.scheduled_for ? 'scheduled' : 'draft',
        sent_count: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Campaign scheduler
  static async scheduleCampaigns() {
    const checkInterval = 5 * 60 * 1000; // Check every 5 minutes

    setInterval(async () => {
      try {
        const now = new Date().toISOString();
        
        // Get scheduled campaigns that are due
        const { data: dueCampaigns } = await supabase
          .from('email_campaigns')
          .select('*')
          .eq('status', 'scheduled')
          .lte('scheduled_for', now);

        if (dueCampaigns && dueCampaigns.length > 0) {
          for (const campaign of dueCampaigns) {
            await this.executeCampaign(campaign);
          }
        }
      } catch (error) {
        console.error('Campaign scheduler error:', error);
      }
    }, checkInterval);

    console.log('Email campaign scheduler started');
  }

  // Execute a campaign
  private static async executeCampaign(campaign: Campaign) {
    try {
      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({ status: 'active' })
        .eq('id', campaign.id);

      // Get recipients based on segment
      const recipients = await this.getRecipientsBySegment(campaign.segment);
      
      // Get template
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', campaign.template_id)
        .single();

      if (!template) throw new Error('Template not found');

      // Send emails in batches
      const batchSize = 50;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        await this.sendEmailBatch(campaign, template, batch);
        
        // Update sent count
        await supabase
          .from('email_campaigns')
          .update({ sent_count: i + batch.length })
          .eq('id', campaign.id);
      }

      // Mark campaign as completed
      await supabase
        .from('email_campaigns')
        .update({ status: 'completed' })
        .eq('id', campaign.id);

    } catch (error) {
      console.error(`Campaign ${campaign.id} execution failed:`, error);
      
      await supabase
        .from('email_campaigns')
        .update({ status: 'paused' })
        .eq('id', campaign.id);
    }
  }

  // Get recipients by segment
  private static async getRecipientsBySegment(segment: string): Promise<any[]> {
    let query = supabase
      .from('user_profiles')
      .select('id, email, full_name, subscription_tier')
      .eq('email_preferences', true);

    switch (segment) {
      case 'all':
        // No additional filters
        break;
      case 'premium':
        query = query.in('subscription_tier', ['premium', 'enterprise']);
        break;
      case 'free':
        query = query.eq('subscription_tier', 'free');
        break;
      case 'active':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('last_active', thirtyDaysAgo);
        break;
      case 'new':
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', sevenDaysAgo);
        break;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Send email batch
  private static async sendEmailBatch(
    campaign: Campaign, 
    template: EmailTemplate, 
    recipients: any[]
  ) {
    const emailPromises = recipients.map(async (recipient) => {
      try {
        // Replace template variables
        const personalizedContent = this.personalizeTemplate(template, recipient);
        
        // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
        // For now, we'll simulate sending
        await this.simulateSendEmail(recipient.email, template.subject, personalizedContent);
        
        // Track email
        await this.trackEmail({
          campaign_id: campaign.id,
          recipient_email: recipient.email,
          sent_at: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error);
      }
    });

    await Promise.all(emailPromises);
  }

  // Personalize template
  private static personalizeTemplate(template: EmailTemplate, recipient: any): string {
    let content = template.content;
    
    // Replace common variables
    content = content.replace(/{{name}}/g, recipient.full_name || 'Valued Customer');
    content = content.replace(/{{email}}/g, recipient.email);
    content = content.replace(/{{subscription}}/g, recipient.subscription_tier || 'free');
    
    // Add unsubscribe link
    const unsubscribeToken = this.generateUnsubscribeToken(recipient.email);
    content = content.replace(/{{unsubscribe_link}}/g, 
      `${process.env.VITE_APP_URL}/unsubscribe?token=${unsubscribeToken}`
    );
    
    return content;
  }

  // Simulate sending email (replace with actual email service)
  private static async simulateSendEmail(to: string, subject: string, content: string) {
    console.log(`Sending email to ${to}: ${subject}`);
    // In production, integrate with SendGrid, AWS SES, etc.
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
  }

  // Email tracking
  private static async trackEmail(tracking: EmailTracking) {
    await supabase
      .from('email_tracking')
      .insert(tracking);
  }

  // Track email open
  static async trackOpen(trackingId: string) {
    await supabase
      .from('email_tracking')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', trackingId);
  }

  // Track link click
  static async trackClick(trackingId: string) {
    await supabase
      .from('email_tracking')
      .update({ clicked_at: new Date().toISOString() })
      .eq('id', trackingId);
  }

  // Handle unsubscribe
  static async handleUnsubscribe(token: string) {
    const email = this.decodeUnsubscribeToken(token);
    
    if (!email) throw new Error('Invalid unsubscribe token');

    // Update user preferences
    await supabase
      .from('user_profiles')
      .update({ email_preferences: false })
      .eq('email', email);

    // Track unsubscribe
    await supabase
      .from('email_tracking')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('recipient_email', email);

    return email;
  }

  // Generate unsubscribe token
  private static generateUnsubscribeToken(email: string): string {
    // In production, use proper encryption
    return Buffer.from(email).toString('base64');
  }

  // Decode unsubscribe token
  private static decodeUnsubscribeToken(token: string): string {
    try {
      return Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      return '';
    }
  }

  // Get campaign analytics
  static async getCampaignAnalytics(campaignId: string) {
    const { data: tracking } = await supabase
      .from('email_tracking')
      .select('*')
      .eq('campaign_id', campaignId);

    if (!tracking) return null;

    const total = tracking.length;
    const opened = tracking.filter(t => t.opened_at).length;
    const clicked = tracking.filter(t => t.clicked_at).length;
    const unsubscribed = tracking.filter(t => t.unsubscribed_at).length;

    return {
      total_sent: total,
      open_rate: total > 0 ? (opened / total) * 100 : 0,
      click_rate: total > 0 ? (clicked / total) * 100 : 0,
      unsubscribe_rate: total > 0 ? (unsubscribed / total) * 100 : 0,
      engagement_rate: total > 0 ? ((opened + clicked) / (total * 2)) * 100 : 0
    };
  }

  // Default email templates
  static getDefaultTemplates(): Partial<EmailTemplate>[] {
    return [
      {
        name: 'Welcome Email',
        subject: 'Welcome to BDBT - Your Daily Business Tips Journey Begins!',
        content: `
Hi {{name}},

Welcome to Business Daily Best Tips! We're thrilled to have you join our community of ambitious business professionals.

Here's what you can expect:
- Daily curated business tips delivered to your dashboard
- Actionable insights across productivity, marketing, finance, and more
- Exclusive content for {{subscription}} members

Get started by exploring your dashboard and creating your first collection.

Best regards,
The BDBT Team

{{unsubscribe_link}}
        `,
        variables: ['name', 'subscription', 'unsubscribe_link']
      },
      {
        name: 'Weekly Digest',
        subject: 'Your Weekly Business Tips Digest',
        content: `
Hi {{name}},

Here are this week's top business tips based on your interests:

[Weekly tips would be inserted here]

Visit your dashboard to see all tips and create custom collections.

Happy learning!
The BDBT Team

{{unsubscribe_link}}
        `,
        variables: ['name', 'unsubscribe_link']
      }
    ];
  }
}