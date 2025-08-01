import jsPDF from 'jspdf';
import { GrokEnhancedTip } from './grokApiService';
import { DatabaseTip } from './tipsDatabaseService';

export class EnhancedPDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 7;
  }

  // Generate professional tip PDF matching client's layout requirements
  generateProfessionalTipPDF(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null): Blob {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    const colors = this.getCategoryColors(tip.category);

    // Page 1: Professional Cover (client-style)
    this.drawClientStyleCover(tip, colors);

    // Page 2: Introduction & Overview
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawIntroductionPage(tip, colors);

    // Page 3: Comprehensive Benefits List
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawComprehensiveBenefits(tip, colors);

    // Page 4-6: Implementation Guide (30+ steps)
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawDetailedImplementation(tip, colors);

    // Page 7: Progress Tracking
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawProgressTrackingSimple(tip, colors);

    // Page 8: Troubleshooting & Tips
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawTroubleshooting(tip, colors);

    // Page 9: Resources & Next Steps
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawResourcesAndNextSteps(tip, colors);

    return this.doc.output('blob');
  }

  // Premium cover page with gradient background effect
  private drawPremiumCover(tip: DatabaseTip, colors: any) {
    // Gradient background simulation using rectangles
    const gradientSteps = 20;
    const stepHeight = this.pageHeight / gradientSteps;
    
    for (let i = 0; i < gradientSteps; i++) {
      const alpha = 1 - (i / gradientSteps) * 0.3;
      const r = Math.round(colors.primary.r + (colors.accent.r - colors.primary.r) * (i / gradientSteps));
      const g = Math.round(colors.primary.g + (colors.accent.g - colors.primary.g) * (i / gradientSteps));
      const b = Math.round(colors.primary.b + (colors.accent.b - colors.primary.b) * (i / gradientSteps));
      
      this.doc.setFillColor(r, g, b);
      this.doc.rect(0, i * stepHeight, this.pageWidth, stepHeight, 'F');
    }

    // Decorative elements
    this.doc.setFillColor(255, 255, 255, 0.1);
    this.doc.circle(this.pageWidth - 30, 30, 50, 'F');
    this.doc.circle(-20, this.pageHeight - 50, 80, 'F');

    // Category badge with rounded rectangle
    this.doc.setFillColor(255, 255, 255, 0.9);
    this.doc.roundedRect(this.pageWidth / 2 - 40, 40, 80, 25, 12, 12, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text(`${tip.category.toUpperCase()} • ${tip.difficulty.toUpperCase()}`, 
                  this.pageWidth / 2, 55, { align: 'center' });

    // Main title with enhanced typography
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    
    // Split long titles across multiple lines
    const titleLines = this.doc.splitTextToSize(tip.title, this.pageWidth - 60);
    const titleStartY = 120;
    titleLines.forEach((line: string, index: number) => {
      this.doc.text(line, this.pageWidth / 2, titleStartY + (index * 42), { align: 'center' });
    });

    // Subtitle with better spacing
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(255, 255, 255, 0.9);
    
    const subtitleY = titleStartY + (titleLines.length * 42) + 20;
    const subtitleLines = this.doc.splitTextToSize(tip.subtitle, this.pageWidth - 80);
    subtitleLines.forEach((line: string, index: number) => {
      this.doc.text(line, this.pageWidth / 2, subtitleY + (index * 22), { align: 'center' });
    });

    // Implementation details with icons (using symbols)
    const detailsY = subtitleY + (subtitleLines.length * 22) + 40;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(255, 255, 255, 0.8);

    // Time icon and text
    this.doc.setFillColor(255, 255, 255, 0.2);
    this.doc.circle(this.pageWidth / 2 - 60, detailsY, 15, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.text('⏱', this.pageWidth / 2 - 64, detailsY + 5, { align: 'center' });
    this.doc.setFontSize(12);
    this.doc.text(tip.implementation_time, this.pageWidth / 2 - 60, detailsY + 20, { align: 'center' });

    // Cost icon and text
    this.doc.setFillColor(255, 255, 255, 0.2);
    this.doc.circle(this.pageWidth / 2, detailsY, 15, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.text('💰', this.pageWidth / 2 - 4, detailsY + 5, { align: 'center' });
    this.doc.setFontSize(12);
    this.doc.text(tip.cost, this.pageWidth / 2, detailsY + 20, { align: 'center' });

    // Frequency icon and text
    this.doc.setFillColor(255, 255, 255, 0.2);
    this.doc.circle(this.pageWidth / 2 + 60, detailsY, 15, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.text('📅', this.pageWidth / 2 + 56, detailsY + 5, { align: 'center' });
    this.doc.setFontSize(12);
    this.doc.text(tip.frequency, this.pageWidth / 2 + 60, detailsY + 20, { align: 'center' });

    // BDBT Branding
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('BDBT', this.pageWidth / 2, this.pageHeight - 40, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(255, 255, 255, 0.8);
    this.doc.text('Better Days, Better Tomorrow', this.pageWidth / 2, this.pageHeight - 25, { align: 'center' });
  }

  // Enhanced benefits page with visual hierarchy
  private drawEnhancedBenefits(tip: DatabaseTip, enhanced: GrokEnhancedTip | null, colors: any) {
    // Gradient header background
    const gradientSteps = 10;
    const headerHeight = 80;
    const stepHeight = headerHeight / gradientSteps;
    
    for (let i = 0; i < gradientSteps; i++) {
      const alpha = 1 - (i / gradientSteps) * 0.2;
      const r = Math.round(colors.primary.r + (colors.secondary.r - colors.primary.r) * (i / gradientSteps));
      const g = Math.round(colors.primary.g + (colors.secondary.g - colors.primary.g) * (i / gradientSteps));
      const b = Math.round(colors.primary.b + (colors.secondary.b - colors.primary.b) * (i / gradientSteps));
      
      this.doc.setFillColor(r, g, b);
      this.doc.rect(0, i * stepHeight, this.pageWidth, stepHeight, 'F');
    }

    // Decorative elements in header
    this.doc.setFillColor(255, 255, 255, 0.1);
    this.doc.circle(this.pageWidth - 40, 20, 30, 'F');
    this.doc.circle(40, headerHeight - 20, 25, 'F');

    // Header text with shadow effect
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0, 0.2);
    this.doc.text('Key Benefits', this.pageWidth / 2 + 2, 42, { align: 'center' });
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Key Benefits', this.pageWidth / 2, 40, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(255, 255, 255, 0.9);
    this.doc.text('Transform your life with these proven advantages', this.pageWidth / 2, 58, { align: 'center' });

    this.currentY = headerHeight + 25;

    // Benefits with enhanced visual design
    const benefits = enhanced?.enhancedContent?.detailedBenefits?.slice(0, 4) || [
      tip.primary_benefit,
      tip.secondary_benefit,
      tip.tertiary_benefit,
      'Long-term sustainable improvement'
    ];

    const benefitIcons = ['🎯', '💪', '🚀', '⭐'];
    const benefitTitles = ['Primary Impact', 'Secondary Boost', 'Long-term Growth', 'Bonus Effect'];

    benefits.forEach((benefit, index) => {
      if (this.currentY > this.pageHeight - 80) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      const cardHeight = 70;
      const cardY = this.currentY;

      // Benefit card with gradient background
      const cardGradientSteps = 5;
      const cardStepHeight = cardHeight / cardGradientSteps;
      
      for (let i = 0; i < cardGradientSteps; i++) {
        const intensity = 250 - (i * 5);
        this.doc.setFillColor(intensity, intensity, intensity);
        this.doc.roundedRect(this.margin, cardY + (i * cardStepHeight), 
                           this.pageWidth - 2 * this.margin, cardStepHeight, 
                           i === 0 ? 12 : 0, i === 0 ? 12 : 0, 'F');
      }

      // Card border with category color
      this.doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.setLineWidth(2);
      this.doc.roundedRect(this.margin, cardY, this.pageWidth - 2 * this.margin, cardHeight, 12, 12);

      // Colored accent corner (triangle)
      this.doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
      this.doc.lines([
        [30, 0],
        [-30, 30],
        [0, -30]
      ], this.margin, cardY, [1, 1], 'F');

      // Large benefit icon with background circle
      this.doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b, 0.1);
      this.doc.circle(this.margin + 35, cardY + 35, 25, 'F');
      
      this.doc.setFontSize(24);
      this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.text(benefitIcons[index], this.margin + 35, cardY + 42, { align: 'center' });

      // Benefit number badge
      this.doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b);
      this.doc.circle(this.pageWidth - this.margin - 25, cardY + 20, 15, 'F');
      
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text((index + 1).toString(), this.pageWidth - this.margin - 25, cardY + 26, { align: 'center' });

      // Benefit title
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.text(benefitTitles[index], this.margin + 70, cardY + 20);

      // Benefit description with better formatting
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      
      const benefitLines = this.doc.splitTextToSize(benefit, this.pageWidth - 120);
      benefitLines.forEach((line: string, lineIndex: number) => {
        this.doc.text(line, this.margin + 70, cardY + 35 + (lineIndex * 5));
      });

      // Progress bar visualization
      this.doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b, 0.3);
      this.doc.roundedRect(this.margin + 70, cardY + 55, this.pageWidth - this.margin - 100, 6, 3, 3, 'F');
      
      const progressWidth = Math.min((index + 1) * 30, this.pageWidth - this.margin - 100);
      this.doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.roundedRect(this.margin + 70, cardY + 55, progressWidth, 6, 3, 3, 'F');

      this.currentY += cardHeight + 15;
    });

    // Enhanced scientific backing section
    if (tip.scientific_backing || enhanced?.enhancedContent) {
      this.currentY += 10;
      
      // Research evidence card
      this.doc.setFillColor(59, 130, 246, 0.05);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 55, 12, 12, 'F');
      
      this.doc.setDrawColor(59, 130, 246);
      this.doc.setLineWidth(1);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 55, 12, 12);

      // Research icon
      this.doc.setFillColor(59, 130, 246, 0.1);
      this.doc.circle(this.margin + 25, this.currentY + 27, 18, 'F');
      
      this.doc.setFontSize(18);
      this.doc.setTextColor(59, 130, 246);
      this.doc.text('🔬', this.margin + 25, this.currentY + 33, { align: 'center' });

      // Research title
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(59, 130, 246);
      this.doc.text('Evidence-Based Approach', this.margin + 50, this.currentY + 20);
      
      // Research description
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      this.doc.text('This tip is backed by scientific research, peer-reviewed studies,', 
                    this.margin + 50, this.currentY + 35);
      this.doc.text('and evidence-based practices from leading experts in the field.', 
                    this.margin + 50, this.currentY + 47);

      // Research stats
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(59, 130, 246);
      this.doc.text('📊 95% effectiveness rate', this.pageWidth - this.margin - 60, this.currentY + 35);
      this.doc.text('⏱️ Results in 2-4 weeks', this.pageWidth - this.margin - 60, this.currentY + 47);
    }

    // Bottom decorative wave pattern
    this.doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b, 0.1);
    for (let i = 0; i < this.pageWidth; i += 20) {
      this.doc.circle(i, this.pageHeight - 10, 8, 'F');
    }
    
    // Footer accent bar
    this.doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b);
    this.doc.rect(0, this.pageHeight - 5, this.pageWidth, 5, 'F');
  }

  // Implementation guide with step-by-step visual design
  private drawImplementationGuide(tip: DatabaseTip, enhanced: GrokEnhancedTip | null, colors: any) {
    // Header
    this.doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    this.doc.rect(0, 0, this.pageWidth, 60, 'F');
    
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Implementation Guide', this.pageWidth / 2, 35, { align: 'center' });

    this.currentY = 80;

    // Quick stats box
    this.doc.setFillColor(255, 255, 255);
    this.doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.setLineWidth(2);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 8, 8, 'FD');

    const statsWidth = (this.pageWidth - 2 * this.margin) / 3;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    // Time
    this.doc.text('TIME REQUIRED', this.margin + statsWidth/2, this.currentY + 12, { align: 'center' });
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(tip.implementation_time, this.margin + statsWidth/2, this.currentY + 25, { align: 'center' });

    // Frequency
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('FREQUENCY', this.margin + statsWidth + statsWidth/2, this.currentY + 12, { align: 'center' });
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(tip.frequency, this.margin + statsWidth + statsWidth/2, this.currentY + 25, { align: 'center' });

    // Cost
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('COST', this.margin + 2 * statsWidth + statsWidth/2, this.currentY + 12, { align: 'center' });
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(tip.cost, this.margin + 2 * statsWidth + statsWidth/2, this.currentY + 25, { align: 'center' });

    this.currentY += 50;

    // Implementation steps
    const steps = enhanced?.enhancedContent?.implementationSteps || [
      'Read through this guide completely',
      'Set up your environment or materials',
      'Start with the basic version',
      'Track your progress daily',
      'Adjust based on results'
    ];

    steps.forEach((step, index) => {
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Step connector line (except for first step)
      if (index > 0) {
        this.doc.setDrawColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
        this.doc.setLineWidth(3);
        this.doc.line(this.margin + 20, this.currentY - 15, this.margin + 20, this.currentY + 5);
      }

      // Step number circle
      this.doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.circle(this.margin + 20, this.currentY + 10, 12, 'F');
      
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text((index + 1).toString(), this.margin + 20, this.currentY + 15, { align: 'center' });

      // Step content box
      this.doc.setFillColor(249, 250, 251);
      this.doc.roundedRect(this.margin + 35, this.currentY, this.pageWidth - this.margin - 45, 30, 5, 5, 'F');

      // Step text
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      
      const stepLines = this.doc.splitTextToSize(step, this.pageWidth - this.margin - 55);
      stepLines.forEach((line: string, lineIndex: number) => {
        this.doc.text(line, this.margin + 40, this.currentY + 12 + (lineIndex * 6));
      });

      this.currentY += 40;
    });

    // Pro tips section
    if (enhanced?.enhancedContent?.proTips) {
      this.currentY += 10;
      
      this.doc.setFillColor(16, 185, 129, 0.1);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 60, 8, 8, 'F');
      
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(16, 185, 129);
      this.doc.text('💡 Pro Tips', this.margin + 10, this.currentY + 15);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      
      enhanced.enhancedContent.proTips.slice(0, 3).forEach((tip, index) => {
        this.doc.text(`• ${tip}`, this.margin + 10, this.currentY + 30 + (index * 8));
      });
    }
  }

  // Progress tracking page with visual elements
  private drawProgressTracking(tip: DatabaseTip, enhanced: GrokEnhancedTip | null, colors: any) {
    // Header
    this.doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b);
    this.doc.rect(0, 0, this.pageWidth, 60, 'F');
    
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Track Your Progress', this.pageWidth / 2, 35, { align: 'center' });

    this.currentY = 80;

    // Success metrics
    if (enhanced?.enhancedContent?.successMetrics) {
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.text('📊 Success Metrics', this.margin, this.currentY);
      
      this.currentY += 20;
      
      enhanced.enhancedContent.successMetrics.forEach((metric, index) => {
        this.doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b, 0.2);
        this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 5, 5, 'F');
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(60, 60, 60);
        this.doc.text(`✓ ${metric}`, this.margin + 10, this.currentY + 15);
        
        this.currentY += 30;
      });
    }

    // Weekly tracker
    this.currentY += 20;
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('📅 Weekly Tracker', this.margin, this.currentY);
    
    this.currentY += 25;
    
    // Draw weekly calendar grid
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const cellWidth = (this.pageWidth - 2 * this.margin) / 7;
    const cellHeight = 25;
    
    // Headers
    days.forEach((day, index) => {
      this.doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
      this.doc.rect(this.margin + index * cellWidth, this.currentY, cellWidth, cellHeight, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(day, this.margin + index * cellWidth + cellWidth/2, this.currentY + 15, { align: 'center' });
    });
    
    // Grid for 4 weeks
    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 7; day++) {
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(this.margin + day * cellWidth, this.currentY + cellHeight + week * cellHeight, cellWidth, cellHeight);
      }
    }

    this.currentY += cellHeight * 5 + 20;

    // Common mistakes section
    if (enhanced?.enhancedContent?.commonMistakes) {
      this.doc.setFillColor(239, 68, 68, 0.1);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80, 8, 8, 'F');
      
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(239, 68, 68);
      this.doc.text('⚠️ Common Mistakes to Avoid', this.margin + 10, this.currentY + 15);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      
      enhanced.enhancedContent.commonMistakes.slice(0, 4).forEach((mistake, index) => {
        this.doc.text(`• ${mistake}`, this.margin + 10, this.currentY + 30 + (index * 10));
      });
    }
  }

  // Call to action page
  private drawCallToAction(tip: DatabaseTip, colors: any) {
    // Full page background
    this.doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Decorative elements
    this.doc.setFillColor(255, 255, 255, 0.1);
    this.doc.circle(-30, 50, 60, 'F');
    this.doc.circle(this.pageWidth + 20, this.pageHeight - 80, 80, 'F');

    // Main content
    this.doc.setFontSize(40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Ready to Transform', this.pageWidth / 2, 80, { align: 'center' });
    this.doc.text('Your Life?', this.pageWidth / 2, 120, { align: 'center' });

    // Next steps box
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(this.margin + 10, 150, this.pageWidth - 2 * this.margin - 20, 80, 12, 12, 'F');
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    this.doc.text('Your Next Steps:', this.margin + 20, 170);
    
    const steps = [
      '1. Start implementing today',
      '2. Track your daily progress',
      '3. Join our community for support',
      '4. Share your success story'
    ];
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    
    steps.forEach((step, index) => {
      this.doc.text(step, this.margin + 20, 190 + (index * 12));
    });

    // QR Code placeholder
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(this.pageWidth / 2 - 25, 250, 50, 50, 8, 8, 'F');
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('QR CODE', this.pageWidth / 2, 280, { align: 'center' });

    // BDBT Branding
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('BDBT', this.pageWidth / 2, 330, { align: 'center' });
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Better Days, Better Tomorrow', this.pageWidth / 2, 345, { align: 'center' });
    this.doc.text('www.bdbt.com', this.pageWidth / 2, 360, { align: 'center' });
  }

  // Get enhanced category colors
  private getCategoryColors(category: string) {
    const colors = {
      health: {
        primary: { r: 34, g: 197, b: 94 },
        secondary: { r: 134, g: 239, b: 172 },
        accent: { r: 21, g: 128, b: 61 }
      },
      wealth: {
        primary: { r: 234, g: 179, b: 8 },
        secondary: { r: 253, g: 224, b: 71 },
        accent: { r: 161, g: 98, b: 7 }
      },
      happiness: {
        primary: { r: 168, g: 85, b: 247 },
        secondary: { r: 216, g: 180, b: 254 },
        accent: { r: 124, g: 58, b: 237 }
      }
    };
    return colors[category as keyof typeof colors] || colors.health;
  }

  // Batch generate enhanced PDFs
  async batchGenerateEnhancedPDFs(
    tips: DatabaseTip[],
    enhanced?: GrokEnhancedTip[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ fileName: string; blob: Blob }[]> {
    const results: { fileName: string; blob: Blob }[] = [];
    
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      const enhancedTip = enhanced?.[i] || null;
      
      try {
        const blob = await this.generatePremiumTipPDF(tip, enhancedTip);
        const fileName = `premium_tip_${tip.id}_${tip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        
        results.push({ fileName, blob });
        
        if (onProgress) {
          onProgress(i + 1, tips.length);
        }
      } catch (error) {
        console.error(`Error generating enhanced PDF for tip ${tip.id}:`, error);
      }
    }
    
    return results;
  }

  // NEW METHODS - Professional layout matching client PDF

  private drawProfessionalCover(tip: DatabaseTip) {
    // Clean white background
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Top brand section - small BDBT
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');  
    this.doc.setTextColor(50, 50, 50);
    this.doc.text('BDBT', this.margin, 25);

    // Large title section with dark background
    const titleBoxHeight = 80;
    const titleBoxY = 60;
    
    // Dark background for title
    this.doc.setFillColor(44, 62, 80);
    this.doc.rect(0, titleBoxY, this.pageWidth, titleBoxHeight, 'F');

    // Title text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    
    const titleLines = this.doc.splitTextToSize(tip.title.toUpperCase(), this.pageWidth - 2 * this.margin);
    let titleY = titleBoxY + 30;
    titleLines.forEach((line: string) => {
      this.doc.text(line, this.pageWidth / 2, titleY, { align: 'center' });
      titleY += 12;
    });

    // Subtitle below title box
    this.doc.setTextColor(150, 150, 150);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(tip.subtitle, this.pageWidth / 2, titleBoxY + titleBoxHeight + 25, { align: 'center' });

    // Large BDBT logo/brand in center
    this.doc.setFontSize(72);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('BDBT', this.pageWidth / 2, this.pageHeight / 2 + 20, { align: 'center' });

    // Bottom section with subtitle repeated
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(tip.subtitle, this.pageWidth / 2, this.pageHeight - 40, { align: 'center' });
  }

  private drawIntroduction(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null) {
    // Page header
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(150, 120, 100);
    this.doc.text('INTRODUCTION', this.margin, 40);

    this.currentY = 60;

    // Introduction text
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const introText = enhanced?.enhancedContent.expandedDescription || tip.description;
    this.wrapText(introText, this.margin, this.currentY, this.pageWidth - 2 * this.margin);

    // Footer with social handle
    this.drawSocialFooter();
  }

  private drawCategoryBenefits(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null) {
    const categoryColors = {
      health: { r: 34, g: 197, b: 94, name: 'HEALTH' },
      wealth: { r: 250, g: 204, b: 21, name: 'WEALTH' },
      happiness: { r: 168, g: 85, b: 247, name: 'HAPPINESS' }
    };

    const categoryData = categoryColors[tip.category as keyof typeof categoryColors] || categoryColors.health;

    // Category header with color
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(categoryData.r, categoryData.g, categoryData.b);
    this.doc.text(categoryData.name, this.margin, 40);
    
    this.doc.setFontSize(36);
    this.doc.text('BENEFITS', this.margin, 70);

    this.currentY = 100;

    // Benefits list with checkmarks
    const benefits = enhanced?.enhancedContent.detailedBenefits || [
      tip.primary_benefit,
      tip.secondary_benefit, 
      tip.tertiary_benefit
    ];

    benefits.forEach((benefit, index) => {
      if (this.currentY > this.pageHeight - 60) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Checkmark
      this.doc.setFontSize(14);
      this.doc.setTextColor(categoryData.r, categoryData.g, categoryData.b);
      this.doc.text('✓', this.margin, this.currentY);

      // Benefit title (first part before any punctuation)
      const benefitParts = benefit.split(/[:.]/);
      const benefitTitle = benefitParts[0];
      const benefitDesc = benefitParts.slice(1).join(':').trim();

      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(benefitTitle, this.margin + 15, this.currentY);

      // Benefit description
      if (benefitDesc) {
        this.currentY += 6;
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(80, 80, 80);
        this.wrapText(benefitDesc, this.margin + 15, this.currentY, this.pageWidth - this.margin - 30);
      }

      this.currentY += 15;
    });

    this.drawSocialFooter();
  }

  private drawImplementationSteps(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null) {
    // Title page for implementation
    this.doc.setFillColor(44, 62, 80);
    this.doc.rect(0, 40, this.pageWidth, 80, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('30 PRACTICAL AND', this.pageWidth / 2, 70, { align: 'center' });
    this.doc.text('ACTIONABLE WAYS TO', this.pageWidth / 2, 90, { align: 'center' });
    this.doc.text('IMPLEMENT THIS TIP', this.pageWidth / 2, 110, { align: 'center' });

    // First 7 numbered steps
    this.currentY = 150;
    const steps = enhanced?.enhancedContent.implementationSteps || this.generateDefaultSteps(tip);
    
    for (let i = 0; i < Math.min(7, steps.length); i++) {
      this.drawNumberedStep(i + 1, steps[i]);
    }

    this.drawSocialFooter();

    // Continue on next page with remaining steps
    if (steps.length > 7) {
      this.doc.addPage();
      this.currentY = this.margin;

      for (let i = 7; i < Math.min(20, steps.length); i++) {
        this.drawNumberedStep(i + 1, steps[i]);
      }

      this.drawSocialFooter();
    }

    // Third page if more than 20 steps
    if (steps.length > 20) {
      this.doc.addPage();
      this.currentY = this.margin;

      for (let i = 20; i < steps.length; i++) {
        this.drawNumberedStep(i + 1, steps[i]);
      }

      this.drawSocialFooter();
    }
  }

  private drawNumberedStep(number: number, step: string) {
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    // Circle number
    this.doc.setFillColor(44, 62, 80);
    this.doc.circle(this.margin + 8, this.currentY - 3, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(number.toString(), this.margin + 8, this.currentY, { align: 'center' });

    // Step text
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.wrapText(step, this.margin + 25, this.currentY, this.pageWidth - this.margin - 35);

    this.currentY += 20;
  }

  private drawFinalThoughts(tip: DatabaseTip) {
    // Header
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(150, 120, 100);
    this.doc.text('FINAL THOUGHTS', this.pageWidth / 2, 60, { align: 'center' });

    this.currentY = 100;

    // Final thoughts text
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const finalText = `This tip is about more than just ${tip.category}. It's about getting the most from what you already have available, and using that leverage to live better. ${tip.title} helps you avoid friction, reduce waste, and stick to the routines that make you feel your best. The approach is simple and the transformation comes when you use it with purpose.`;
    
    this.wrapText(finalText, this.margin, this.currentY, this.pageWidth - 2 * this.margin);

    this.drawSocialFooter();
  }

  private generateDefaultSteps(tip: DatabaseTip): string[] {
    return [
      `Start implementing ${tip.title.toLowerCase()} today to see immediate benefits`,
      `Set aside ${tip.implementation_time} ${tip.frequency.toLowerCase()} for this practice`,
      `Track your progress and note how it makes you feel`,
      `Share this tip with someone who could benefit from it`,
      `Create a routine around this practice to build consistency`,
      `Use reminders or alerts to help establish the habit`,
      `Celebrate small wins along the way to stay motivated`,
      `Adjust the approach based on what works best for your lifestyle`,
      `Focus on the long-term benefits rather than short-term challenges`,
      `Be patient with yourself as you develop this new habit`,
      `Document your journey to see your progress over time`,  
      `Find an accountability partner to help you stay on track`,
      `Start small and gradually increase the intensity or frequency`,
      `Identify and remove barriers that might prevent success`,
      `Reward yourself for consistency and milestone achievements`,
      `Learn from setbacks and use them as opportunities to improve`,
      `Connect this habit to your larger health, wealth, or happiness goals`,
      `Share your success story to inspire others`,
      `Continue refining the approach based on your results`,
      `Make this practice a permanent part of your better tomorrow`,
      `Review your progress weekly and adjust as needed`,
      `Connect with others who share similar goals`,
      `Use technology and apps to support your habit`,
      `Create environmental cues that trigger the behavior`,
      `Practice self-compassion when facing challenges`,
      `Celebrate progress, not just perfection`,
      `Build flexibility into your routine for busy days`,
      `Track both process and outcome metrics`,
      `Share your knowledge with others to reinforce learning`,
      `Make this practice a lifelong commitment to growth`
    ];
  }

  private drawSocialFooter() {
    const footerY = this.pageHeight - 15;
    
    // Background bar
    this.doc.setFillColor(220, 220, 220);
    this.doc.rect(0, footerY - 10, this.pageWidth, 25, 'F');
    
    // Social handle
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('📷 @BigDaddysBigTips', this.pageWidth / 2, footerY, { align: 'center' });
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, maxLines?: number): number {
    const lines = this.doc.splitTextToSize(text, maxWidth);
    const linesToShow = maxLines ? lines.slice(0, maxLines) : lines;
    
    linesToShow.forEach((line: string, i: number) => {
      this.doc.text(line, x, y + (i * this.lineHeight));
    });
    
    this.currentY = y + (linesToShow.length * this.lineHeight);
    return linesToShow.length;
  }

  // Batch generation method
  async batchGenerateProfessionalPDFs(
    tips: DatabaseTip[],
    enhanced?: GrokEnhancedTip[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ fileName: string; blob: Blob }[]> {
    const results: { fileName: string; blob: Blob }[] = [];
    
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      const enhancedTip = enhanced?.[i] || null;
      
      try {
        const blob = this.generateProfessionalTipPDF(tip, enhancedTip);
        const fileName = `professional_tip_${tip.id}_${tip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        
        results.push({ fileName, blob });
        
        if (onProgress) {
          onProgress(i + 1, tips.length);
        }
      } catch (error) {
        console.error(`Error generating professional PDF for tip ${tip.id}:`, error);
      }
    }
    
    return results;
  }

  // NEW: Client-style cover page
  private drawClientStyleCover(tip: DatabaseTip, colors: any) {
    // Clean, professional header
    this.doc.setFillColor(colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 60, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.currentY = 35;
    this.doc.text(tip.title, this.margin, this.currentY);
    
    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.currentY += 12;
    this.doc.text(tip.subtitle, this.margin, this.currentY);
    
    // Category badge
    this.doc.setFillColor(255, 255, 255, 0.2);
    this.doc.roundedRect(this.margin, 70, 60, 20, 3, 3, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(tip.category.toUpperCase(), this.margin + 5, 82);
    
    // Main content area
    this.doc.setTextColor(0, 0, 0);
    this.currentY = 110;
    
    // Overview box
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80, 'F');
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80);
    
    // Overview content
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Quick Overview', this.margin + 10, this.currentY + 15);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Time Required: ${tip.implementation_time}`, this.margin + 10, this.currentY + 30);
    this.doc.text(`Frequency: ${tip.frequency}`, this.margin + 10, this.currentY + 42);
    this.doc.text(`Cost: ${tip.cost}`, this.margin + 10, this.currentY + 54);
    this.doc.text(`Difficulty: ${tip.difficulty}`, this.margin + 10, this.currentY + 66);
    
    // Footer
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('BDBT - Better Days, Better Tomorrow', this.margin, this.pageHeight - 20);
  }

  // NEW: Professional introduction page
  private drawIntroductionPage(tip: DatabaseTip, colors: any) {
    // Header
    this.doc.setFillColor(colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Introduction', this.margin, 20);
    
    this.currentY = 50;
    this.doc.setTextColor(0, 0, 0);
    
    // Main description
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const description = `${tip.description} This comprehensive guide will walk you through everything you need to know to successfully implement this life-changing habit.`;
    this.addWrappedText(description, this.pageWidth - 2 * this.margin);
    
    this.currentY += 20;
    
    // What you'll learn section
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('What You\'ll Learn:', this.margin, this.currentY);
    this.currentY += 15;
    
    const learningPoints = [
      'The science behind why this works',
      'Step-by-step implementation guide',
      'How to track your progress effectively',
      'Common mistakes and how to avoid them',
      'Advanced techniques for optimization',
      'Long-term strategies for success'
    ];
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    learningPoints.forEach((point) => {
      this.doc.setFillColor(colors.primary);
      this.doc.circle(this.margin + 3, this.currentY - 2, 2, 'F');
      this.doc.text(point, this.margin + 12, this.currentY);
      this.currentY += 12;
    });
  }

  // NEW: Comprehensive benefits page
  private drawComprehensiveBenefits(tip: DatabaseTip, colors: any) {
    // Header
    this.doc.setFillColor(colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Benefits & Results', this.margin, 20);
    
    this.currentY = 50;
    this.doc.setTextColor(0, 0, 0);
    
    const benefits = [
      { title: 'Immediate Benefits (1-7 days)', benefit: tip.primary_benefit, icon: '⚡' },
      { title: 'Short-term Benefits (1-4 weeks)', benefit: tip.secondary_benefit, icon: '📈' },
      { title: 'Long-term Benefits (1+ months)', benefit: tip.tertiary_benefit, icon: '🚀' }
    ];
    
    benefits.forEach((item, index) => {
      // Benefit card
      this.doc.setFillColor(245, 245, 245);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50, 'F');
      this.doc.setDrawColor(colors.secondary);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50);
      
      // Icon and title
      this.doc.setFontSize(16);
      this.doc.text(item.icon, this.margin + 8, this.currentY + 15);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(item.title, this.margin + 20, this.currentY + 15);
      
      // Benefit description
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.benefit, this.margin + 8, this.currentY + 30);
      
      this.currentY += 65;
    });
  }

  // NEW: Detailed implementation with 30+ steps
  private drawDetailedImplementation(tip: DatabaseTip, colors: any) {
    // Header
    this.doc.setFillColor(colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Implementation Guide', this.margin, 20);
    
    this.currentY = 50;
    this.doc.setTextColor(0, 0, 0);
    
    // Generate comprehensive implementation steps
    const steps = this.generateImplementationSteps(tip);
    
    steps.forEach((step, index) => {
      if (this.currentY > this.pageHeight - 40) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      // Step number
      this.doc.setFillColor(colors.primary);
      this.doc.circle(this.margin + 8, this.currentY + 5, 6, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text((index + 1).toString(), this.margin + 5, this.currentY + 8);
      
      // Step content
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(step, this.margin + 20, this.currentY + 8);
      
      this.currentY += 15;
    });
  }

  // NEW: Progress tracking page (renamed to avoid duplicate)
  private drawProgressTrackingSimple(tip: DatabaseTip, colors: any) {
    // Header
    this.doc.setFillColor(colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Track Your Progress', this.margin, 20);
    
    this.currentY = 50;
    this.doc.setTextColor(0, 0, 0);
    
    // Daily tracker template
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('30-Day Progress Tracker', this.margin, this.currentY);
    this.currentY += 20;
    
    // Create a grid for tracking
    const cellWidth = 20;
    const cellHeight = 15;
    const cols = 7;
    const rows = 5;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = this.margin + col * cellWidth;
        const y = this.currentY + row * cellHeight;
        const day = row * cols + col + 1;
        
        if (day <= 30) {
          this.doc.rect(x, y, cellWidth, cellHeight);
          this.doc.setFontSize(8);
          this.doc.text(day.toString(), x + 2, y + 10);
        }
      }
    }
    
    this.currentY += rows * cellHeight + 30;
    
    // Success metrics
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Success Metrics to Track:', this.margin, this.currentY);
    this.currentY += 15;
    
    const metrics = [
      'Daily completion (Yes/No)',
      'Quality of implementation (1-10)',
      'Energy level after (1-10)',
      'Overall mood impact (1-10)',
      'Weekly reflection notes'
    ];
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    metrics.forEach(metric => {
      this.doc.text(`□ ${metric}`, this.margin, this.currentY);
      this.currentY += 15;
    });
  }

  // NEW: Troubleshooting page
  private drawTroubleshooting(tip: DatabaseTip, colors: any) {
    // Header
    this.doc.setFillColor(colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Troubleshooting & FAQ', this.margin, 20);
    
    this.currentY = 50;
    this.doc.setTextColor(0, 0, 0);
    
    const troubleshooting = [
      {
        problem: 'I keep forgetting to do it',
        solution: 'Set up environmental cues and smartphone reminders. Link it to an existing habit.'
      },
      {
        problem: 'I don\'t see results quickly enough',
        solution: 'Focus on the daily process rather than results. Track small wins and celebrate consistency.'
      },
      {
        problem: 'It feels too difficult',
        solution: 'Start with a smaller version. Even 1 minute is better than nothing. Build momentum gradually.'
      },
      {
        problem: 'I miss days and feel like giving up',
        solution: 'Missing days is normal. The key is getting back on track immediately, not perfection.'
      }
    ];
    
    troubleshooting.forEach(item => {
      if (this.currentY > this.pageHeight - 60) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      // Problem
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(colors.accent);
      this.doc.text(`Q: ${item.problem}`, this.margin, this.currentY);
      this.currentY += 12;
      
      // Solution
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`A: ${item.solution}`, this.margin, this.currentY);
      this.currentY += 20;
    });
  }

  // NEW: Resources and next steps
  private drawResourcesAndNextSteps(tip: DatabaseTip, colors: any) {
    // Header
    this.doc.setFillColor(colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Resources & Next Steps', this.margin, 20);
    
    this.currentY = 50;
    this.doc.setTextColor(0, 0, 0);
    
    // Recommended resources
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recommended Resources:', this.margin, this.currentY);
    this.currentY += 20;
    
    const resources = [
      'BDBT Mobile App - Track your progress daily',
      'BDBT Community - Connect with others on the same journey',
      'BDBT Podcast - Weekly motivation and advanced tips',
      'BDBT Blueprint - Comprehensive life optimization system'
    ];
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    resources.forEach(resource => {
      this.doc.text(`• ${resource}`, this.margin, this.currentY);
      this.currentY += 12;
    });
    
    this.currentY += 20;
    
    // Next steps
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Your Next Steps:', this.margin, this.currentY);
    this.currentY += 20;
    
    const nextSteps = [
      'Complete the 30-day challenge using the tracker',
      'Join the BDBT community for support and accountability',
      'Explore related tips in the same category',
      'Consider upgrading to BDBT Premium for advanced features'
    ];
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    nextSteps.forEach((step, index) => {
      this.doc.text(`${index + 1}. ${step}`, this.margin, this.currentY);
      this.currentY += 12;
    });
    
    // Footer
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('© BDBT - Better Days, Better Tomorrow | www.bdbt.com', this.margin, this.pageHeight - 20);
  }

  // Helper: Generate comprehensive implementation steps
  private generateImplementationSteps(tip: DatabaseTip): string[] {
    return [
      'Set a specific time for daily practice',
      'Prepare all necessary materials in advance',
      'Create environmental cues to remind yourself',
      'Start with a 2-minute version to build momentum',
      'Track completion in a visible location',
      'Connect the habit to an existing routine',
      'Identify your motivation and write it down',
      'Plan for obstacles and create backup strategies',
      'Find an accountability partner or system',
      'Celebrate small wins along the way',
      'Focus on consistency over perfection',
      'Gradually increase intensity or duration',
      'Monitor your energy levels and mood',
      'Adjust timing based on what works best',
      'Create a reward system for weekly progress',
      'Learn from setbacks without judgment',
      'Share your journey with supportive people',
      'Document insights and breakthroughs',
      'Review and refine your approach weekly',
      'Build flexibility into your routine',
      'Focus on the process, not just results',
      'Use visualization techniques for motivation',
      'Prepare for challenging days in advance',
      'Create multiple ways to practice',
      'Track qualitative improvements',
      'Connect with others doing the same thing',
      'Read success stories for inspiration',
      'Identify your peak performance times',
      'Build recovery strategies for missed days',
      'Plan your progression for months 2-3',
      'Set up systems for long-term maintenance'
    ];
  }
}

export const enhancedPdfGenerator = new EnhancedPDFGenerator();