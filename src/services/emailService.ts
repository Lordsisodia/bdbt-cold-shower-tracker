export interface EmailSubscription {
  email: string;
  preferences: {
    weeklyTips: boolean;
    categoryUpdates: boolean;
    productUpdates: boolean;
  };
  subscribedAt: string;
  source: string; // 'pdf_download', 'newsletter_signup', etc.
  tipId?: string;
  tipTitle?: string;
}

export interface EmailStats {
  totalSubscribers: number;
  weeklyTipsSubscribers: number;
  categorySubscribers: { [key: string]: number };
  recentSubscriptions: EmailSubscription[];
}

class EmailService {
  private subscribers: EmailSubscription[] = [];

  // Subscribe user to email list
  async subscribeUser(subscription: Omit<EmailSubscription, 'subscribedAt'>): Promise<void> {
    // In a real app, this would integrate with:
    // - Mailchimp API
    // - ConvertKit API  
    // - SendGrid API
    // - Custom email service
    
    const newSubscription: EmailSubscription = {
      ...subscription,
      subscribedAt: new Date().toISOString()
    };

    // Check if email already exists
    const existingIndex = this.subscribers.findIndex(s => s.email === subscription.email);
    
    if (existingIndex >= 0) {
      // Update existing subscription preferences
      this.subscribers[existingIndex] = {
        ...this.subscribers[existingIndex],
        preferences: subscription.preferences,
        subscribedAt: new Date().toISOString() // Update timestamp
      };
    } else {
      // Add new subscription
      this.subscribers.push(newSubscription);
    }

    // Store in localStorage for persistence in demo
    localStorage.setItem('bdbt_email_subscribers', JSON.stringify(this.subscribers));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Email subscription successful:', subscription.email);
    
    // In production, this would trigger:
    // 1. Welcome email with PDF attachment
    // 2. Add to email list segments based on preferences
    // 3. Track conversion event in analytics
  }

  // Get subscription stats
  async getStats(): Promise<EmailStats> {
    // Load from localStorage
    const stored = localStorage.getItem('bdbt_email_subscribers');
    if (stored) {
      this.subscribers = JSON.parse(stored);
    }

    const categorySubscribers: { [key: string]: number } = {};
    let weeklyTipsCount = 0;

    this.subscribers.forEach(sub => {
      if (sub.preferences.weeklyTips) {
        weeklyTipsCount++;
      }
      
      if (sub.preferences.categoryUpdates && sub.tipId) {
        // Extract category from tipId or source
        const category = this.extractCategoryFromSubscription(sub);
        if (category) {
          categorySubscribers[category] = (categorySubscribers[category] || 0) + 1;
        }
      }
    });

    return {
      totalSubscribers: this.subscribers.length,
      weeklyTipsSubscribers: weeklyTipsCount,
      categorySubscribers,
      recentSubscriptions: this.subscribers
        .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())
        .slice(0, 10)
    };
  }

  // Send welcome email with PDF (mock)
  private async sendWelcomeEmail(email: string, tipTitle: string, pdfBlob: Blob): Promise<void> {
    // In production, this would:
    // 1. Generate email template with PDF attachment
    // 2. Send via email service API
    // 3. Track email delivery and opens
    
    console.log(`📧 Welcome email sent to ${email} with PDF: ${tipTitle}`);
    
    // Simulate email delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Unsubscribe user
  async unsubscribe(email: string): Promise<void> {
    this.subscribers = this.subscribers.filter(s => s.email !== email);
    localStorage.setItem('bdbt_email_subscribers', JSON.stringify(this.subscribers));
    
    console.log('✅ User unsubscribed:', email);
  }

  // Update subscription preferences
  async updatePreferences(email: string, preferences: EmailSubscription['preferences']): Promise<void> {
    const index = this.subscribers.findIndex(s => s.email === email);
    if (index >= 0) {
      this.subscribers[index].preferences = preferences;
      localStorage.setItem('bdbt_email_subscribers', JSON.stringify(this.subscribers));
    }
  }

  // Get subscriber by email
  async getSubscriber(email: string): Promise<EmailSubscription | null> {
    const stored = localStorage.getItem('bdbt_email_subscribers');
    if (stored) {
      this.subscribers = JSON.parse(stored);
    }
    
    return this.subscribers.find(s => s.email === email) || null;
  }

  // Extract category from subscription data
  private extractCategoryFromSubscription(subscription: EmailSubscription): string | null {
    // This would be more sophisticated in production
    // For now, return a default based on source or tipId
    if (subscription.source === 'pdf_download' && subscription.tipTitle) {
      // Simple keyword matching - in production would use tip metadata
      const title = subscription.tipTitle.toLowerCase();
      if (title.includes('health') || title.includes('fitness') || title.includes('wellness')) {
        return 'health';
      }
      if (title.includes('money') || title.includes('wealth') || title.includes('finance')) {
        return 'wealth';
      }
      if (title.includes('happiness') || title.includes('joy') || title.includes('mindfulness')) {
        return 'happiness';
      }
    }
    return null;
  }

  // Integration methods for production
  async integrateWithMailchimp(apiKey: string, listId: string): Promise<void> {
    // Would implement Mailchimp API integration
    throw new Error('Mailchimp integration not implemented - requires API key');
  }

  async integrateWithConvertKit(apiKey: string, formId: string): Promise<void> {
    // Would implement ConvertKit API integration
    throw new Error('ConvertKit integration not implemented - requires API key');
  }

  async integrateWithSendGrid(apiKey: string, listId: string): Promise<void> {
    // Would implement SendGrid API integration
    throw new Error('SendGrid integration not implemented - requires API key');
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Helper function for PDF download with email capture
export const handlePDFDownloadWithEmail = async (
  email: string,
  preferences: EmailSubscription['preferences'],
  tipData: {
    id: string;
    title: string;
    category: string;
  },
  pdfBlob: Blob
): Promise<void> => {
  // Subscribe user
  await emailService.subscribeUser({
    email,
    preferences,
    source: 'pdf_download',
    tipId: tipData.id,
    tipTitle: tipData.title
  });

  // Trigger PDF download
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tipData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Track download event
  console.log('📊 PDF download completed:', {
    email,
    tipTitle: tipData.title,
    timestamp: new Date().toISOString()
  });
};