import jsPDF from 'jspdf';
import { DatabaseTip } from './tipsDatabaseService';

export class ImprovedPDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private contentWidth: number;
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = 25;
    this.contentWidth = this.pageWidth - (2 * this.margin);
    this.currentY = this.margin;
    this.lineHeight = 7;
  }

  generateProfessionalPDF(tip: DatabaseTip): Blob {
    this.doc = new jsPDF();
    const colors = this.getCategoryColors(tip.category);

    // Page 1: Professional Cover
    this.createCoverPage(tip, colors);

    // Page 2: Introduction
    this.doc.addPage();
    this.createIntroductionPage(tip, colors);

    // Page 3: Benefits
    this.doc.addPage();
    this.createBenefitsPage(tip, colors);

    // Page 4: Implementation Guide
    this.doc.addPage();
    this.createImplementationPage(tip, colors);

    // Page 5: Progress Tracking
    this.doc.addPage();
    this.createProgressPage(tip, colors);

    return this.doc.output('blob');
  }

  // Helper function to wrap text properly
  private wrapText(text: string, maxWidth: number): string[] {
    return this.doc.splitTextToSize(text, maxWidth);
  }

  // Helper function to draw wrapped text with proper spacing
  private drawWrappedText(text: string, x: number, y: number, maxWidth: number, lineHeight: number = 7): number {
    const lines = this.wrapText(text, maxWidth);
    lines.forEach((line, index) => {
      this.doc.text(line, x, y + (index * lineHeight));
    });
    return y + (lines.length * lineHeight);
  }

  // Page 1: Cover Page with proper spacing
  private createCoverPage(tip: DatabaseTip, colors: any) {
    // Background gradient effect
    this.drawGradientBackground(colors.primary, colors.accent);

    // White content area
    const contentY = 60;
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(20, contentY, this.pageWidth - 40, 180, 10, 10, 'F');

    // Title (wrapped if needed)
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const titleY = this.drawWrappedText(tip.title, 30, contentY + 30, this.pageWidth - 60, 10);

    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const subtitleY = this.drawWrappedText(tip.subtitle, 30, titleY + 10, this.pageWidth - 60, 7);

    // Category badge
    const badgeY = subtitleY + 20;
    this.doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.roundedRect(30, badgeY, 80, 25, 5, 5, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(tip.category.toUpperCase(), 70, badgeY + 16, { align: 'center' });

    // Quick stats
    const statsY = badgeY + 40;
    this.doc.setTextColor(50, 50, 50);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const stats = [
      { label: 'Time Required:', value: tip.implementation_time },
      { label: 'Frequency:', value: tip.frequency },
      { label: 'Investment:', value: tip.cost },
      { label: 'Difficulty:', value: tip.difficulty }
    ];

    stats.forEach((stat, index) => {
      const y = statsY + (index * 15);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(stat.label, 30, y);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(stat.value, 90, y);
    });

    // Footer
    this.drawFooter('Start Your Journey Today', 1);
  }

  // Page 2: Introduction with proper text wrapping
  private createIntroductionPage(tip: DatabaseTip, colors: any) {
    this.currentY = this.margin;

    // Header
    this.drawPageHeader('Introduction', colors.primary);
    this.currentY = 50;

    // Main description with proper wrapping
    this.doc.setFontSize(12);
    this.doc.setTextColor(60, 60, 60);
    this.currentY = this.drawWrappedText(
      tip.description || 'This practice will transform your daily routine and help you achieve lasting positive changes.',
      this.margin,
      this.currentY,
      this.contentWidth,
      8
    );

    // Why This Works section
    this.currentY += 20;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Why This Works', this.margin, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    const reasons = [
      'Based on proven scientific principles',
      'Easy to implement in your daily routine',
      'Requires minimal time investment',
      'Delivers measurable results'
    ];

    reasons.forEach(reason => {
      this.doc.text('• ' + reason, this.margin + 10, this.currentY);
      this.currentY += 10;
    });

    // What to Expect section
    this.currentY += 20;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('What to Expect', this.margin, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    const expectations = [
      'Week 1: Initial adjustment and habit formation',
      'Week 2-4: Noticeable improvements in daily life',
      'Month 2-3: Significant positive changes',
      'Long-term: Lasting transformation and growth'
    ];

    expectations.forEach(expectation => {
      this.currentY = this.drawWrappedText(expectation, this.margin + 10, this.currentY, this.contentWidth - 20);
      this.currentY += 5;
    });

    this.drawFooter('Understanding the Foundation', 2);
  }

  // Page 3: Benefits with visual elements
  private createBenefitsPage(tip: DatabaseTip, colors: any) {
    this.currentY = this.margin;

    // Header
    this.drawPageHeader('Key Benefits', colors.primary);
    this.currentY = 50;

    // Three main benefits with icons and proper spacing
    const benefits = [
      {
        title: 'Primary Benefit',
        content: tip.primary_benefit,
        icon: '🎯'
      },
      {
        title: 'Secondary Benefit',
        content: tip.secondary_benefit,
        icon: '💪'
      },
      {
        title: 'Long-term Impact',
        content: tip.tertiary_benefit,
        icon: '🚀'
      }
    ];

    benefits.forEach((benefit, index) => {
      // Benefit box
      const boxHeight = 50;
      this.doc.setFillColor(245, 245, 245);
      this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, boxHeight, 5, 5, 'F');
      
      // Icon
      this.doc.setFontSize(20);
      this.doc.text(benefit.icon, this.margin + 10, this.currentY + 25);

      // Title
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.text(benefit.title, this.margin + 35, this.currentY + 18);

      // Content (wrapped)
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      this.drawWrappedText(benefit.content, this.margin + 35, this.currentY + 30, this.contentWidth - 45, 7);

      this.currentY += boxHeight + 15;
    });

    // Additional benefits section
    this.currentY += 10;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Additional Benefits', this.margin, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    const additionalBenefits = [
      'Improved overall well-being',
      'Enhanced productivity and focus',
      'Better stress management',
      'Increased confidence and motivation'
    ];

    additionalBenefits.forEach(benefit => {
      this.doc.text('✓ ' + benefit, this.margin + 10, this.currentY);
      this.currentY += 10;
    });

    this.drawFooter('Transform Your Life', 3);
  }

  // Page 4: Implementation Guide
  private createImplementationPage(tip: DatabaseTip, colors: any) {
    this.currentY = this.margin;

    // Header
    this.drawPageHeader('Implementation Guide', colors.primary);
    this.currentY = 50;

    // Getting Started section
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Getting Started', this.margin, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    // Step-by-step guide
    const steps = [
      'Set aside ' + tip.implementation_time + ' for this practice',
      'Choose a consistent time that works with your schedule',
      'Start with the basics and gradually build up',
      'Track your progress daily for best results',
      'Be patient and consistent with your practice'
    ];

    steps.forEach((step, index) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Step ${index + 1}:`, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.currentY = this.drawWrappedText(step, this.margin + 35, this.currentY, this.contentWidth - 45);
      this.currentY += 10;
    });

    // Pro Tips section
    this.currentY += 15;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Pro Tips', this.margin, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    const proTips = [
      'Start small and build consistency before increasing intensity',
      'Use reminders or alarms to maintain your practice',
      'Find an accountability partner for better results',
      'Celebrate small wins along the way'
    ];

    proTips.forEach(tip => {
      this.currentY = this.drawWrappedText('💡 ' + tip, this.margin, this.currentY, this.contentWidth);
      this.currentY += 8;
    });

    this.drawFooter('Your Action Plan', 4);
  }

  // Page 5: Progress Tracking
  private createProgressPage(tip: DatabaseTip, colors: any) {
    this.currentY = this.margin;

    // Header
    this.drawPageHeader('Track Your Progress', colors.primary);
    this.currentY = 50;

    // Weekly checklist
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Week 1 Checklist', this.margin, this.currentY);

    this.currentY += 15;

    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      // Checkbox
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(this.margin, this.currentY - 5, 10, 10);
      
      // Day label
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      this.doc.text(day, this.margin + 15, this.currentY);
      
      this.currentY += 15;
    });

    // Milestones section
    this.currentY += 20;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Key Milestones', this.margin, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    const milestones = [
      { time: '1 Week:', achievement: 'Habit formation begins' },
      { time: '2 Weeks:', achievement: 'Noticeable improvements' },
      { time: '1 Month:', achievement: 'Significant progress' },
      { time: '3 Months:', achievement: 'Lasting transformation' }
    ];

    milestones.forEach(milestone => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(milestone.time, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(milestone.achievement, this.margin + 40, this.currentY);
      this.currentY += 12;
    });

    // Notes section
    this.currentY += 20;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Notes & Reflections', this.margin, this.currentY);
    
    this.currentY += 10;
    // Draw lines for notes
    for (let i = 0; i < 5; i++) {
      this.doc.setDrawColor(220, 220, 220);
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 10;
    }

    this.drawFooter('Measure Your Success', 5);
  }

  // Helper: Draw gradient background
  private drawGradientBackground(primaryColor: any, accentColor: any) {
    const steps = 20;
    const stepHeight = this.pageHeight / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.round(primaryColor.r + (accentColor.r - primaryColor.r) * ratio);
      const g = Math.round(primaryColor.g + (accentColor.g - primaryColor.g) * ratio);
      const b = Math.round(primaryColor.b + (accentColor.b - primaryColor.b) * ratio);
      
      this.doc.setFillColor(r, g, b);
      this.doc.rect(0, i * stepHeight, this.pageWidth, stepHeight, 'F');
    }
  }

  // Helper: Draw page header
  private drawPageHeader(title: string, color: any) {
    this.doc.setFillColor(color.r, color.g, color.b);
    this.doc.rect(0, 0, this.pageWidth, 35, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageWidth / 2, 22, { align: 'center' });
  }

  // Helper: Draw footer
  private drawFooter(text: string, pageNumber: number) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(text, this.pageWidth / 2, this.pageHeight - 15, { align: 'center' });
    this.doc.text(`Page ${pageNumber}`, this.pageWidth - this.margin, this.pageHeight - 15, { align: 'right' });
  }

  // Get category colors
  private getCategoryColors(category: string) {
    const colorSchemes = {
      health: {
        primary: { r: 34, g: 197, b: 94 },
        accent: { r: 21, g: 128, b: 61 },
        light: { r: 134, g: 239, b: 172 }
      },
      wealth: {
        primary: { r: 234, g: 179, b: 8 },
        accent: { r: 161, g: 98, b: 7 },
        light: { r: 253, g: 224, b: 71 }
      },
      happiness: {
        primary: { r: 168, g: 85, b: 247 },
        accent: { r: 124, g: 58, b: 237 },
        light: { r: 216, g: 180, b: 254 }
      }
    };

    return colorSchemes[category as keyof typeof colorSchemes] || colorSchemes.happiness;
  }
}

export const improvedPdfGenerator = new ImprovedPDFGenerator();