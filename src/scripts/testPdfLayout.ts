import { PDFGenerator } from '../services/pdfGenerator';
import { Tip } from '../types/tip';

// Create realistic test data that represents various content lengths
const createTestTip = (scenario: 'short' | 'medium' | 'long'): Tip => {
  const baseData = {
    id: "test-001",
    category: 'health' as const,
    difficulty: 'Moderate' as const,
    tags: ['mindfulness', 'breathing', 'stress-relief', 'wellness'],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 0,
    downloadCount: 0
  };

  switch (scenario) {
    case 'short':
      return {
        ...baseData,
        content: {
          title: "Quick Morning Stretch",
          subtitle: "5-minute energizing routine",
          description: "A simple morning stretch routine to wake up your body and mind. Perfect for busy mornings.",
          benefits: {
            primary: "Increased flexibility",
            secondary: "Better posture",
            tertiary: "Enhanced mood"
          },
          whatsIncluded: [
            "Step-by-step guide",
            "Video demonstrations",
            "Progress tracker"
          ],
          readTime: 3
        }
      };

    case 'medium':
      return {
        ...baseData,
        content: {
          title: "Comprehensive Mindfulness Meditation Practice for Daily Stress Management",
          subtitle: "Evidence-based techniques for reducing anxiety and improving mental clarity through structured meditation sessions",
          description: "This comprehensive mindfulness meditation practice combines ancient wisdom with modern neuroscience to help you develop a sustainable daily practice. Learn to observe your thoughts without judgment, cultivate present-moment awareness, and build resilience against life's challenges. The program includes guided sessions, breathing techniques, and practical applications for workplace stress management.",
          benefits: {
            primary: "Significantly reduced stress levels and improved emotional regulation",
            secondary: "Enhanced focus, concentration, and cognitive performance in daily tasks",
            tertiary: "Better sleep quality and overall mental health improvement"
          },
          whatsIncluded: [
            "21-day progressive meditation program with daily guidance",
            "Audio recordings for all meditation sessions and breathing exercises",
            "Printable meditation logs and progress tracking sheets",
            "Quick 5-minute desk meditation techniques for work breaks",
            "Troubleshooting guide for common meditation challenges"
          ],
          readTime: 8
        }
      };

    case 'long':
      return {
        ...baseData,
        content: {
          title: "The Complete Guide to Transforming Your Life Through Advanced Holistic Health Practices: A Comprehensive System for Physical, Mental, and Emotional Wellness",
          subtitle: "Master the art of holistic living with this evidence-based, step-by-step system that integrates nutrition, movement, mindfulness, and lifestyle optimization for lasting transformation and peak performance",
          description: "This revolutionary holistic health system represents years of research and practical application, bringing together the most effective strategies from functional medicine, behavioral psychology, and ancient wisdom traditions. You'll discover how to create sustainable lifestyle changes that work with your body's natural rhythms, optimize your energy levels throughout the day, and build resilience against modern stressors. The program addresses everything from circadian rhythm optimization and micronutrient balancing to stress management and emotional intelligence development. Each component is designed to synergistically enhance the others, creating a compound effect that accelerates your progress toward optimal health. Whether you're dealing with chronic fatigue, anxiety, digestive issues, or simply want to perform at your highest level, this comprehensive approach provides the tools and knowledge you need to transform your life from the inside out.",
          benefits: {
            primary: "Complete transformation of energy levels, mental clarity, and physical vitality through scientifically-backed protocols that address root causes rather than symptoms",
            secondary: "Dramatic improvement in sleep quality, stress resilience, and emotional balance using integrated approaches that work synergistically to optimize your entire system",
            tertiary: "Long-term sustainable health practices that prevent chronic disease, enhance longevity, and maintain peak performance throughout your lifetime"
          },
          whatsIncluded: [
            "Comprehensive 90-day transformation program with weekly milestones and daily action steps",
            "Complete nutritional optimization guide including meal plans, supplement protocols, and timing strategies",
            "Advanced movement and exercise systems tailored to your specific needs and fitness level",
            "Mindfulness and stress management techniques including meditation, breathwork, and cognitive reframing",
            "Sleep optimization protocols including environment setup, timing, and recovery strategies",
            "Detailed tracking systems and assessment tools to measure progress across all health metrics",
            "Troubleshooting guides for common challenges and plateaus during your transformation journey",
            "Community access and expert support for accountability and motivation throughout the program",
            "Lifetime access to all materials including future updates and bonus content as available"
          ],
          readTime: 15
        }
      };
  }
};

// Test function to generate PDFs with different content lengths
export const testPdfLayouts = () => {
  const generator = new PDFGenerator();
  
  const scenarios = ['short', 'medium', 'long'] as const;
  const results: { scenario: string; blob: Blob }[] = [];
  
  scenarios.forEach(scenario => {
    const testTip = createTestTip(scenario);
    const blob = generator.generateTipPDF(testTip);
    results.push({ scenario, blob });
    
    console.log(`Generated ${scenario} content PDF:`, {
      titleLength: testTip.content.title.length,
      subtitleLength: testTip.content.subtitle.length,
      descriptionLength: testTip.content.description.length,
      benefitsCount: 3,
      whatsIncludedCount: testTip.content.whatsIncluded.length
    });
  });
  
  return results;
};

// Browser-compatible test function
export const downloadTestPdfs = () => {
  const results = testPdfLayouts();
  
  results.forEach(({ scenario, blob }) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-pdf-${scenario}-content.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

// Node.js compatible test function
export const saveTestPdfs = async () => {
  const results = testPdfLayouts();
  
  // This would require fs module in Node.js environment
  console.log('Test PDFs generated. Use downloadTestPdfs() in browser environment to download files.');
  return results;
};