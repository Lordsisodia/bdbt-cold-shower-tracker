// Form submission utilities with proper Supabase integration
import { supabase } from '../lib/supabase';

export interface NewsletterSubmission {
  email: string;
  name?: string;
  source?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  partnershipType?: string;
  message: string;
}

export interface GetStartedSubmission {
  name: string;
  email: string;
  goals: string[];
  experience: string;
  agreeToTerms: boolean;
}

// Form validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateRequired = (value: string): boolean => {
  return value && value.trim().length > 0;
};

export const validateName = (name: string): boolean => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

export const validateMessage = (message: string): boolean => {
  return message && message.trim().length >= 10 && message.trim().length <= 2000;
};

// Form validation with detailed error messages
export const validateNewsletterForm = (data: NewsletterSubmission): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (data.name && data.name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateContactForm = (data: ContactSubmission): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateName(data.name)) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!validateMessage(data.message)) {
    errors.push('Message must be between 10 and 2000 characters');
  }
  
  if (data.company && data.company.trim().length > 255) {
    errors.push('Company name must be less than 255 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateGetStartedForm = (data: GetStartedSubmission): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateName(data.name)) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.goals || data.goals.length === 0) {
    errors.push('Please select at least one goal');
  }
  
  if (!data.experience || data.experience.trim().length === 0) {
    errors.push('Please select your experience level');
  }
  
  if (!data.agreeToTerms) {
    errors.push('You must agree to the terms and conditions');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const submitNewsletter = async (data: NewsletterSubmission): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate data before submission
    const validation = validateNewsletterForm(data);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Check rate limit
    if (!checkRateLimit('newsletter', data.email.trim().toLowerCase())) {
      return { success: false, error: 'Please wait before submitting again' };
    }

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', data.email.trim().toLowerCase())
      .single();

    if (existingSubscriber) {
      return { success: false, error: 'This email is already subscribed to our newsletter' };
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: data.email.trim().toLowerCase(),
        name: data.name ? sanitizeInput(data.name.trim()) : null,
        source: data.source || 'website',
        status: 'active'
      });

    if (error) {
      console.error('Newsletter submission error:', error);
      return { success: false, error: 'Failed to subscribe. Please try again later.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
};

export const submitContact = async (data: ContactSubmission): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate data before submission
    const validation = validateContactForm(data);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Check rate limit
    if (!checkRateLimit('contact', data.email.trim().toLowerCase())) {
      return { success: false, error: 'Please wait before submitting again' };
    }

    // Insert contact submission
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: sanitizeInput(data.name.trim()),
        email: data.email.trim().toLowerCase(),
        company: data.company ? sanitizeInput(data.company.trim()) : null,
        partnership_type: data.partnershipType || null,
        message: sanitizeInput(data.message.trim()),
        status: 'new'
      });

    if (error) {
      console.error('Contact form submission error:', error);
      return { success: false, error: 'Failed to submit your message. Please try again later.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
};

export const submitGetStarted = async (data: GetStartedSubmission): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate data before submission
    const validation = validateGetStartedForm(data);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Check rate limit
    if (!checkRateLimit('get_started', data.email.trim().toLowerCase())) {
      return { success: false, error: 'Please wait before submitting again' };
    }

    // Check if submission already exists
    const { data: existingSubmission } = await supabase
      .from('get_started_submissions')
      .select('id')
      .eq('email', data.email.trim().toLowerCase())
      .single();

    if (existingSubmission) {
      return { success: false, error: 'A submission with this email already exists' };
    }

    // Insert get started submission
    const { error } = await supabase
      .from('get_started_submissions')
      .insert({
        name: sanitizeInput(data.name.trim()),
        email: data.email.trim().toLowerCase(),
        goals: data.goals,
        experience_level: data.experience,
        agree_to_terms: data.agreeToTerms,
        status: 'new'
      });

    if (error) {
      console.error('Get Started submission error:', error);
      return { success: false, error: 'Failed to submit your information. Please try again later.' };
    }

    // Also subscribe to newsletter if not already subscribed
    const { error: newsletterError } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: data.email.trim().toLowerCase(),
        name: sanitizeInput(data.name.trim()),
        source: 'get_started',
        status: 'active'
      }, {
        onConflict: 'email'
      });

    if (newsletterError) {
      console.warn('Newsletter subscription failed:', newsletterError);
      // Don't fail the whole process for newsletter subscription
    }

    return { success: true };
  } catch (error) {
    console.error('Get Started submission error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
};

// Toast notification functions
// These should be replaced with a proper toast library like react-hot-toast
export const showSuccessToast = (message: string) => {
  // In a production app, replace with proper toast library
  console.log(`✅ Success: ${message}`);
  // Temporary alert for demo purposes
  if (typeof window !== 'undefined') {
    alert(`✅ Success: ${message}`);
  }
};

export const showErrorToast = (message: string) => {
  // In a production app, replace with proper toast library
  console.error(`❌ Error: ${message}`);
  // Temporary alert for demo purposes
  if (typeof window !== 'undefined') {
    alert(`❌ Error: ${message}`);
  }
};

// Rate limiting helper (client-side protection)
const submissionTimes = new Map<string, number>();
const RATE_LIMIT_MS = 60000; // 1 minute between submissions for same form type

export const checkRateLimit = (formType: string, email: string): boolean => {
  const key = `${formType}-${email}`;
  const lastSubmission = submissionTimes.get(key);
  const now = Date.now();
  
  if (lastSubmission && (now - lastSubmission) < RATE_LIMIT_MS) {
    return false;
  }
  
  submissionTimes.set(key, now);
  return true;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });
};