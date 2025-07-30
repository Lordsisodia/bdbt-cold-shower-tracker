// Form submission utilities

export interface NewsletterSubmission {
  email: string;
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

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const submitNewsletter = async (data: NewsletterSubmission): Promise<boolean> => {
  try {
    // Simulate API call
    await delay(1000);
    
    // In a real app, you'd send this to your backend
    console.log('Newsletter submission:', data);
    
    // Mock success response
    return Math.random() > 0.1; // 90% success rate for demo
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return false;
  }
};

export const submitContact = async (data: ContactSubmission): Promise<boolean> => {
  try {
    // Simulate API call
    await delay(1500);
    
    // In a real app, you'd send this to your backend
    console.log('Contact form submission:', data);
    
    // Mock success response
    return Math.random() > 0.1; // 90% success rate for demo
  } catch (error) {
    console.error('Contact form submission error:', error);
    return false;
  }
};

export const submitGetStarted = async (data: GetStartedSubmission): Promise<boolean> => {
  try {
    // Simulate API call
    await delay(2000);
    
    // In a real app, you'd send this to your backend/auth service
    console.log('Get Started submission:', data);
    
    // Mock success response
    return Math.random() > 0.05; // 95% success rate for demo
  } catch (error) {
    console.error('Get Started submission error:', error);
    return false;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const showSuccessToast = (message: string) => {
  // In a real app, you'd use a toast library like react-hot-toast
  alert(`✅ Success: ${message}`);
};

export const showErrorToast = (message: string) => {
  // In a real app, you'd use a toast library like react-hot-toast
  alert(`❌ Error: ${message}`);
};