import { emailService } from './emailService';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'subscribed' | 'unsubscribed' | 'pending' | 'cleaned';
  source: 'website' | 'pdf_download' | 'popup' | 'manual';
  subscriptionDate: string;
  lastActivityDate?: string;
  tags?: string[];
  preferences: {
    healthTips: boolean;
    wealthTips: boolean;
    happinessTips: boolean;
    weeklyDigest: boolean;
    productUpdates: boolean;
    specialOffers: boolean;
  };
  metadata?: {
    location?: string;
    referrer?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  previewText?: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  scheduledDate?: string;
  sentDate?: string;
  createdDate: string;
  updatedDate: string;
  type: 'regular' | 'welcome' | 'digest' | 'promotional' | 'announcement';
  tags?: string[];
  targetAudience?: {
    categories?: string[];
    tags?: string[];
    minSubscriptionDays?: number;
    lastActivityDays?: number;
  };
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
  };
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'welcome' | 'digest' | 'promotional' | 'tip-of-the-week' | 'custom';
  htmlContent: string;
  textContent: string;
  variables: string[];
  previewImage?: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface NewsletterAnalytics {
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribersThisMonth: number;
  unsubscribedThisMonth: number;
  averageOpenRate: number;
  averageClickRate: number;
  topPerformingCampaigns: Array<{
    id: string;
    title: string;
    openRate: number;
    clickRate: number;
    sentDate: string;
  }>;
  subscriberGrowth: Array<{
    date: string;
    subscribers: number;
    unsubscribes: number;
    netGrowth: number;
  }>;
  engagementByCategory: {
    health: { subscribers: number; avgOpenRate: number; avgClickRate: number };
    wealth: { subscribers: number; avgOpenRate: number; avgClickRate: number };
    happiness: { subscribers: number; avgOpenRate: number; avgClickRate: number };
  };
}

class NewsletterService {
  private readonly STORAGE_KEY = 'bdbt_newsletter';
  // API integrations should be handled server-side for security
  private readonly API_ENDPOINTS = {
    mailchimp: '', // Moved to server-side
    convertkit: '', // Moved to server-side
  };
  private readonly API_KEYS = {
    mailchimp: '', // SECURITY: API keys should never be in client-side code
    convertkit: '', // SECURITY: API keys should never be in client-side code
  };

  // Platform integration methods
  private async integrateWithMailchimp(subscriber: NewsletterSubscriber): Promise<boolean> {
    if (!this.API_ENDPOINTS.mailchimp || !this.API_KEYS.mailchimp) {
      console.warn('Mailchimp API not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.API_ENDPOINTS.mailchimp}/lists/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEYS.mailchimp}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: subscriber.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: subscriber.firstName || '',
            LNAME: subscriber.lastName || '',
          },
          tags: subscriber.tags || [],
          interests: {
            health: subscriber.preferences.healthTips,
            wealth: subscriber.preferences.wealthTips,
            happiness: subscriber.preferences.happinessTips,
          },
          source: subscriber.source,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Mailchimp integration error:', error);
      return false;
    }
  }

  private async integrateWithConvertKit(subscriber: NewsletterSubscriber): Promise<boolean> {
    if (!this.API_ENDPOINTS.convertkit || !this.API_KEYS.convertkit) {
      console.warn('ConvertKit API not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.API_ENDPOINTS.convertkit}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.API_KEYS.convertkit,
          email: subscriber.email,
          first_name: subscriber.firstName,
          fields: {
            last_name: subscriber.lastName,
            source: subscriber.source,
            health_tips: subscriber.preferences.healthTips,
            wealth_tips: subscriber.preferences.wealthTips,
            happiness_tips: subscriber.preferences.happinessTips,
          },
          tags: subscriber.tags,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('ConvertKit integration error:', error);
      return false;
    }
  }

  // Core subscriber management
  async subscribeUser(
    email: string,
    preferences: NewsletterSubscriber['preferences'],
    metadata?: {
      firstName?: string;
      lastName?: string;
      source?: string;
      referrer?: string;
      tags?: string[];
    }
  ): Promise<NewsletterSubscriber> {
    const subscriber: NewsletterSubscriber = {
      id: this.generateId(),
      email: email.toLowerCase(),
      firstName: metadata?.firstName,
      lastName: metadata?.lastName,
      status: 'subscribed',
      source: (metadata?.source as any) || 'website',
      subscriptionDate: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
      tags: metadata?.tags || [],
      preferences,
      metadata: {
        referrer: metadata?.referrer || document.referrer,
        ipAddress: 'client-side', // Would be set server-side in production
        userAgent: navigator.userAgent,
      },
    };

    // Store locally
    const subscribers = await this.getSubscribers();
    const existingIndex = subscribers.findIndex(s => s.email === email);
    
    if (existingIndex >= 0) {
      // Update existing subscriber
      subscribers[existingIndex] = { ...subscribers[existingIndex], ...subscriber };
    } else {
      subscribers.push(subscriber);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      subscribers,
      campaigns: await this.getCampaigns(),
      templates: await this.getTemplates(),
    }));

    // Integrate with external platforms
    try {
      await Promise.allSettled([
        this.integrateWithMailchimp(subscriber),
        this.integrateWithConvertKit(subscriber),
      ]);
    } catch (error) {
      console.warn('External platform integration failed:', error);
    }

    // Also subscribe to email service
    try {
      await emailService.subscribeUser({
        email,
        preferences: {
          healthTips: preferences.healthTips,
          wealthTips: preferences.wealthTips,
          happinessTips: preferences.happinessTips,
          weeklyDigest: preferences.weeklyDigest,
          productUpdates: preferences.productUpdates,
        },
        source: subscriber.source,
      });
    } catch (error) {
      console.warn('Email service integration failed:', error);
    }

    return subscriber;
  }

  async unsubscribeUser(email: string, reason?: string): Promise<boolean> {
    const subscribers = await this.getSubscribers();
    const subscriberIndex = subscribers.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
    
    if (subscriberIndex === -1) {
      return false;
    }

    subscribers[subscriberIndex].status = 'unsubscribed';
    subscribers[subscriberIndex].lastActivityDate = new Date().toISOString();
    
    await this.saveData({ subscribers });

    // Log unsubscribe reason
    const unsubscribeLog = JSON.parse(localStorage.getItem(`${this.STORAGE_KEY}_unsubscribes`) || '[]');
    unsubscribeLog.push({
      email,
      reason,
      date: new Date().toISOString(),
    });
    localStorage.setItem(`${this.STORAGE_KEY}_unsubscribes`, JSON.stringify(unsubscribeLog));

    return true;
  }

  async updateSubscriberPreferences(
    email: string,
    preferences: Partial<NewsletterSubscriber['preferences']>
  ): Promise<boolean> {
    const subscribers = await this.getSubscribers();
    const subscriberIndex = subscribers.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
    
    if (subscriberIndex === -1) {
      return false;
    }

    subscribers[subscriberIndex].preferences = {
      ...subscribers[subscriberIndex].preferences,
      ...preferences,
    };
    subscribers[subscriberIndex].lastActivityDate = new Date().toISOString();
    
    await this.saveData({ subscribers });
    return true;
  }

  // Campaign management
  async createCampaign(campaign: Omit<NewsletterCampaign, 'id' | 'createdDate' | 'updatedDate'>): Promise<NewsletterCampaign> {
    const newCampaign: NewsletterCampaign = {
      ...campaign,
      id: this.generateId(),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    const campaigns = await this.getCampaigns();
    campaigns.push(newCampaign);
    
    await this.saveData({ campaigns });
    return newCampaign;
  }

  async updateCampaign(campaignId: string, updates: Partial<NewsletterCampaign>): Promise<boolean> {
    const campaigns = await this.getCampaigns();
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) {
      return false;
    }

    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...updates,
      updatedDate: new Date().toISOString(),
    };
    
    await this.saveData({ campaigns });
    return true;
  }

  async sendCampaign(campaignId: string): Promise<boolean> {
    const campaigns = await this.getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign || campaign.status !== 'draft') {
      return false;
    }

    // Get target audience
    const subscribers = await this.getTargetAudience(campaign.targetAudience || {});
    
    if (subscribers.length === 0) {
      return false;
    }

    // Update campaign status
    await this.updateCampaign(campaignId, {
      status: 'sent',
      sentDate: new Date().toISOString(),
      metrics: {
        sent: subscribers.length,
        delivered: subscribers.length, // Assume all delivered for mock
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
      },
    });

    // In production, this would integrate with actual email sending service
    console.log(`Mock: Sent campaign "${campaign.title}" to ${subscribers.length} subscribers`);
    
    return true;
  }

  // Template management
  async createTemplate(template: Omit<NewsletterTemplate, 'id' | 'createdDate' | 'updatedDate'>): Promise<NewsletterTemplate> {
    const newTemplate: NewsletterTemplate = {
      ...template,
      id: this.generateId(),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    const templates = await this.getTemplates();
    templates.push(newTemplate);
    
    await this.saveData({ templates });
    return newTemplate;
  }

  // Analytics and reporting
  async getAnalytics(): Promise<NewsletterAnalytics> {
    const subscribers = await this.getSubscribers();
    const campaigns = await this.getCampaigns();
    
    const activeSubscribers = subscribers.filter(s => s.status === 'subscribed');
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const newThisMonth = subscribers.filter(s => 
      new Date(s.subscriptionDate) >= thisMonth && s.status === 'subscribed'
    ).length;
    
    const unsubscribedThisMonth = subscribers.filter(s => 
      s.status === 'unsubscribed' && 
      s.lastActivityDate && 
      new Date(s.lastActivityDate) >= thisMonth
    ).length;

    const sentCampaigns = campaigns.filter(c => c.status === 'sent' && c.metrics);
    const avgOpenRate = sentCampaigns.length > 0 
      ? sentCampaigns.reduce((sum, c) => sum + (c.metrics?.openRate || 0), 0) / sentCampaigns.length
      : 0;
    const avgClickRate = sentCampaigns.length > 0
      ? sentCampaigns.reduce((sum, c) => sum + (c.metrics?.clickRate || 0), 0) / sentCampaigns.length
      : 0;

    return {
      totalSubscribers: subscribers.length,
      activeSubscribers: activeSubscribers.length,
      newSubscribersThisMonth: newThisMonth,
      unsubscribedThisMonth,
      averageOpenRate: avgOpenRate,
      averageClickRate: avgClickRate,
      topPerformingCampaigns: sentCampaigns
        .sort((a, b) => (b.metrics?.openRate || 0) - (a.metrics?.openRate || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          title: c.title,
          openRate: c.metrics?.openRate || 0,
          clickRate: c.metrics?.clickRate || 0,
          sentDate: c.sentDate || '',
        })),
      subscriberGrowth: this.generateGrowthData(subscribers),
      engagementByCategory: {
        health: this.getCategoryEngagement(activeSubscribers, 'healthTips'),
        wealth: this.getCategoryEngagement(activeSubscribers, 'wealthTips'),
        happiness: this.getCategoryEngagement(activeSubscribers, 'happinessTips'),
      },
    };
  }

  // Utility methods
  private async getSubscribers(): Promise<NewsletterSubscriber[]> {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return data.subscribers || [];
  }

  private async getCampaigns(): Promise<NewsletterCampaign[]> {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return data.campaigns || [];
  }

  private async getTemplates(): Promise<NewsletterTemplate[]> {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return data.templates || this.getDefaultTemplates();
  }

  private async saveData(updates: {
    subscribers?: NewsletterSubscriber[];
    campaigns?: NewsletterCampaign[];
    templates?: NewsletterTemplate[];
  }): Promise<void> {
    const currentData = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const newData = { ...currentData, ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newData));
  }

  private async getTargetAudience(criteria: NewsletterCampaign['targetAudience']): Promise<NewsletterSubscriber[]> {
    const subscribers = await this.getSubscribers();
    
    return subscribers.filter(subscriber => {
      if (subscriber.status !== 'subscribed') return false;
      
      // Filter by categories
      if (criteria?.categories?.length) {
        const hasCategory = criteria.categories.some(category => {
          switch (category) {
            case 'health': return subscriber.preferences.healthTips;
            case 'wealth': return subscriber.preferences.wealthTips;
            case 'happiness': return subscriber.preferences.happinessTips;
            default: return false;
          }
        });
        if (!hasCategory) return false;
      }
      
      // Filter by tags
      if (criteria?.tags?.length) {
        const hasTags = criteria.tags.some(tag => subscriber.tags?.includes(tag));
        if (!hasTags) return false;
      }
      
      // Filter by subscription age
      if (criteria?.minSubscriptionDays) {
        const subscriptionAge = Date.now() - new Date(subscriber.subscriptionDate).getTime();
        const daysSinceSubscription = subscriptionAge / (1000 * 60 * 60 * 24);
        if (daysSinceSubscription < criteria.minSubscriptionDays) return false;
      }
      
      // Filter by last activity
      if (criteria?.lastActivityDays && subscriber.lastActivityDate) {
        const lastActivity = Date.now() - new Date(subscriber.lastActivityDate).getTime();
        const daysSinceActivity = lastActivity / (1000 * 60 * 60 * 24);
        if (daysSinceActivity > criteria.lastActivityDays) return false;
      }
      
      return true;
    });
  }

  private generateGrowthData(subscribers: NewsletterSubscriber[]): NewsletterAnalytics['subscriberGrowth'] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const newSubscribers = subscribers.filter(s => 
        s.status === 'subscribed' &&
        new Date(s.subscriptionDate) >= dayStart &&
        new Date(s.subscriptionDate) < dayEnd
      ).length;

      const unsubscribes = subscribers.filter(s => 
        s.status === 'unsubscribed' &&
        s.lastActivityDate &&
        new Date(s.lastActivityDate) >= dayStart &&
        new Date(s.lastActivityDate) < dayEnd
      ).length;

      return {
        date,
        subscribers: newSubscribers,
        unsubscribes,
        netGrowth: newSubscribers - unsubscribes,
      };
    });
  }

  private getCategoryEngagement(
    subscribers: NewsletterSubscriber[], 
    category: keyof NewsletterSubscriber['preferences']
  ): { subscribers: number; avgOpenRate: number; avgClickRate: number } {
    const categorySubscribers = subscribers.filter(s => s.preferences[category]);
    
    return {
      subscribers: categorySubscribers.length,
      avgOpenRate: Math.random() * 40 + 20, // Mock data
      avgClickRate: Math.random() * 10 + 2, // Mock data
    };
  }

  private getDefaultTemplates(): NewsletterTemplate[] {
    return [
      {
        id: 'welcome-template',
        name: 'Welcome Email',
        description: 'Welcome new subscribers to BDBT',
        category: 'welcome',
        htmlContent: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #2563eb;">Welcome to BDBT!</h1>
            <p>Hi {{firstName}},</p>
            <p>Welcome to the Better Daily Better Tomorrow community! We're excited to have you on board.</p>
            <p>You'll receive:</p>
            <ul>
              <li>Weekly curated tips for health, wealth, and happiness</li>
              <li>Exclusive PDF guides and resources</li>
              <li>Early access to new features</li>
            </ul>
            <p>Get started by exploring our latest tips!</p>
            <a href="{{siteUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Explore Tips</a>
          </div>
        `,
        textContent: `Welcome to BDBT!\n\nHi {{firstName}},\n\nWelcome to the Better Daily Better Tomorrow community! We're excited to have you on board.\n\nYou'll receive:\n- Weekly curated tips for health, wealth, and happiness\n- Exclusive PDF guides and resources\n- Early access to new features\n\nGet started by exploring our latest tips at {{siteUrl}}`,
        variables: ['firstName', 'siteUrl'],
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        id: 'weekly-digest-template',
        name: 'Weekly Digest',
        description: 'Weekly roundup of best tips',
        category: 'digest',
        htmlContent: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #2563eb;">Your Weekly BDBT Digest</h1>
            <p>Hi {{firstName}},</p>
            <p>Here are this week's top tips to help you build a better tomorrow:</p>
            {{weeklyTips}}
            <p>Don't forget to download the PDF guides for detailed implementation!</p>
            <a href="{{siteUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Tips</a>
          </div>
        `,
        textContent: `Your Weekly BDBT Digest\n\nHi {{firstName}},\n\nHere are this week's top tips to help you build a better tomorrow:\n\n{{weeklyTips}}\n\nDon't forget to download the PDF guides for detailed implementation!\n\nView all tips at {{siteUrl}}`,
        variables: ['firstName', 'weeklyTips', 'siteUrl'],
        isActive: true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    ];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Public API methods
  async getSubscriberCount(): Promise<number> {
    const subscribers = await this.getSubscribers();
    return subscribers.filter(s => s.status === 'subscribed').length;
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const subscribers = await this.getSubscribers();
    return subscribers.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getCampaignById(campaignId: string): Promise<NewsletterCampaign | null> {
    const campaigns = await this.getCampaigns();
    return campaigns.find(c => c.id === campaignId) || null;
  }

  async getTemplateById(templateId: string): Promise<NewsletterTemplate | null> {
    const templates = await this.getTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  // Integration status
  getIntegrationStatus(): {
    mailchimp: boolean;
    convertkit: boolean;
    local: boolean;
  } {
    return {
      mailchimp: !!(this.API_ENDPOINTS.mailchimp && this.API_KEYS.mailchimp),
      convertkit: !!(this.API_ENDPOINTS.convertkit && this.API_KEYS.convertkit),
      local: true,
    };
  }
}

export const newsletterService = new NewsletterService();