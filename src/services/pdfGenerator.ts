import jsPDF from 'jspdf';
import { Tip } from '../types/tip';
import { GrokEnhancedTip } from './grokApiService';
import { DatabaseTip } from './tipsDatabaseService';

export class PDFGenerator {
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

  generateTipPDF(tip: Tip): Blob {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    // Header with colored background
    this.drawHeader(tip);

    // Title and subtitle
    this.currentY = 80;
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.wrapText(tip.content.title, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    this.currentY += 15;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100);
    this.wrapText(tip.content.subtitle, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    // Description
    this.currentY += 20;
    this.doc.setTextColor(0);
    this.doc.setFontSize(12);
    this.wrapText(tip.content.description, this.margin, this.currentY, this.pageWidth - 2 * this.margin);

    // Key Benefits section
    this.currentY += 25;
    this.drawSection('Key Benefits', [
      tip.content.benefits.primary,
      tip.content.benefits.secondary,
      tip.content.benefits.tertiary
    ]);

    // What's Included section
    this.currentY += 20;
    this.drawSection("What's Included", tip.content.whatsIncluded);

    // Footer
    this.drawFooter(tip);

    return this.doc.output('blob');
  }

  generateCataloguePDF(tips: Tip[]): Blob {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    // Cover page
    this.drawCatalogueCover();
    
    // Table of contents
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawTableOfContents(tips);

    // Individual tips (summary format)
    tips.forEach((tip, index) => {
      if (index % 3 === 0) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      this.drawTipSummary(tip);
    });

    return this.doc.output('blob');
  }

  private drawHeader(tip: Tip) {
    const colors = {
      health: { r: 34, g: 197, b: 94 },
      wealth: { r: 250, g: 204, b: 21 },
      happiness: { r: 168, g: 85, b: 247 }
    };
    
    const color = colors[tip.category];
    this.doc.setFillColor(color.r, color.g, color.b);
    this.doc.rect(0, 0, this.pageWidth, 60, 'F');
    
    // Category badge
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(this.margin, 20, 60, 20, 3, 3, 'F');
    this.doc.setTextColor(color.r, color.g, color.b);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(tip.category.toUpperCase(), this.margin + 30, 33, { align: 'center' });
    
    // Difficulty badge
    this.doc.roundedRect(this.margin + 70, 20, 60, 20, 3, 3, 'F');
    this.doc.text(tip.difficulty.toUpperCase(), this.margin + 100, 33, { align: 'center' });
    
    // Read time
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${tip.content.readTime} min read`, this.pageWidth - this.margin, 30, { align: 'right' });
  }

  private drawSection(title: string, items: string[]) {
    // Check if we need a new page
    if (this.currentY + (items.length * this.lineHeight) + 20 > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      this.doc.text('• ', this.margin + 5, this.currentY);
      this.wrapText(item, this.margin + 15, this.currentY, this.pageWidth - 2 * this.margin - 15);
      this.currentY += 8;
    });
  }

  private drawFooter(tip: Tip) {
    const footerY = this.pageHeight - 20;
    this.doc.setDrawColor(200);
    this.doc.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(100);
    this.doc.text('BDBT - Better Days, Better Tomorrow', this.margin, footerY);
    this.doc.text(`Tip #${tip.id}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  private drawCatalogueCover() {
    // Gradient background effect (simplified)
    this.doc.setFillColor(30, 58, 138);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BDBT Tips & Guides', this.pageWidth / 2, 80, { align: 'center' });
    
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Complete Catalogue', this.pageWidth / 2, 100, { align: 'center' });
    
    // Stats
    this.doc.setFontSize(16);
    this.doc.text('1000+ Tips for Health, Wealth & Happiness', this.pageWidth / 2, 140, { align: 'center' });
    
    // Date
    this.doc.setFontSize(12);
    this.doc.text(new Date().toLocaleDateString(), this.pageWidth / 2, this.pageHeight - 40, { align: 'center' });
  }

  private drawTableOfContents(tips: Tip[]) {
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Table of Contents', this.margin, this.currentY);
    this.currentY += 20;
    
    const categories = ['health', 'wealth', 'happiness'] as const;
    categories.forEach((category) => {
      const categoryTips = tips.filter(tip => tip.category === category);
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(category.charAt(0).toUpperCase() + category.slice(1), this.margin, this.currentY);
      this.currentY += 10;
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${categoryTips.length} tips available`, this.margin + 10, this.currentY);
      this.currentY += 15;
    });
  }

  private drawTipSummary(tip: Tip) {
    const summaryHeight = 80;
    
    // Border
    this.doc.setDrawColor(200);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, summaryHeight);
    
    // Category indicator
    const colors = {
      health: { r: 34, g: 197, b: 94 },
      wealth: { r: 250, g: 204, b: 21 },
      happiness: { r: 168, g: 85, b: 247 }
    };
    const color = colors[tip.category];
    this.doc.setFillColor(color.r, color.g, color.b);
    this.doc.rect(this.margin, this.currentY, 5, summaryHeight, 'F');
    
    // Content
    const contentX = this.margin + 10;
    const contentY = this.currentY + 10;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(tip.content.title, contentX, contentY);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100);
    this.wrapText(tip.content.subtitle, contentX, contentY + 8, this.pageWidth - 2 * this.margin - 20, 2);
    
    // Tags
    this.doc.setFontSize(8);
    this.doc.text(`${tip.category} • ${tip.difficulty} • ${tip.content.readTime} min`, contentX, contentY + 25);
    
    this.currentY += summaryHeight + 10;
    this.doc.setTextColor(0);
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, maxLines?: number) {
    const lines = this.doc.splitTextToSize(text, maxWidth);
    const linesToShow = maxLines ? lines.slice(0, maxLines) : lines;
    
    linesToShow.forEach((line: string, i: number) => {
      this.doc.text(line, x, y + (i * this.lineHeight));
    });
    
    this.currentY = y + (linesToShow.length * this.lineHeight);
    return linesToShow.length;
  }

  // Enhanced PDF generation with Grok content
  generateEnhancedTipPDF(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null): Blob {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    // Convert DatabaseTip to Tip format
    const tipData: Tip = {
      id: tip.id || 0,
      category: tip.category as 'health' | 'wealth' | 'happiness',
      difficulty: tip.difficulty as 'Easy' | 'Moderate' | 'Advanced',
      content: {
        title: tip.title,
        subtitle: tip.subtitle,
        description: enhanced?.enhancedContent.expandedDescription || tip.description,
        benefits: {
          primary: tip.primary_benefit,
          secondary: tip.secondary_benefit,
          tertiary: tip.tertiary_benefit
        },
        implementation: {
          time: tip.implementation_time,
          frequency: tip.frequency,
          cost: tip.cost
        },
        whatsIncluded: enhanced?.enhancedContent.implementationSteps || [],
        readTime: 5,
        tags: tip.tags
      }
    };

    // Generate standard PDF with enhanced content
    this.drawHeader(tipData);
    this.currentY = 80;
    
    // Title and subtitle
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.wrapText(tipData.content.title, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    this.currentY += 15;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100);
    this.wrapText(tipData.content.subtitle, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    // Enhanced description
    this.currentY += 20;
    this.doc.setTextColor(0);
    this.doc.setFontSize(12);
    this.wrapText(tipData.content.description, this.margin, this.currentY, this.pageWidth - 2 * this.margin);

    // Enhanced benefits section
    if (enhanced?.enhancedContent.detailedBenefits) {
      this.currentY += 25;
      this.drawSection('Detailed Benefits', enhanced.enhancedContent.detailedBenefits.slice(0, 5));
    } else {
      this.currentY += 25;
      this.drawSection('Key Benefits', [
        tipData.content.benefits.primary,
        tipData.content.benefits.secondary,
        tipData.content.benefits.tertiary
      ]);
    }

    // Implementation steps
    if (enhanced?.enhancedContent.implementationSteps) {
      this.currentY += 20;
      this.drawSection('Implementation Steps', enhanced.enhancedContent.implementationSteps);
    }

    // Pro tips (if available)
    if (enhanced?.enhancedContent.proTips) {
      this.doc.addPage();
      this.currentY = this.margin;
      this.drawSection('Pro Tips', enhanced.enhancedContent.proTips);
    }

    // Common mistakes (if available)
    if (enhanced?.enhancedContent.commonMistakes) {
      this.currentY += 20;
      this.drawSection('Common Mistakes to Avoid', enhanced.enhancedContent.commonMistakes);
    }

    // Success metrics (if available)
    if (enhanced?.enhancedContent.successMetrics) {
      this.currentY += 20;
      this.drawSection('How to Measure Success', enhanced.enhancedContent.successMetrics);
    }

    // Footer
    this.drawFooter(tipData);

    return this.doc.output('blob');
  }

  // Batch generate PDFs with progress tracking
  async batchGeneratePDFs(
    tips: DatabaseTip[],
    enhanced?: GrokEnhancedTip[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ fileName: string; blob: Blob }[]> {
    const results: { fileName: string; blob: Blob }[] = [];
    
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      const enhancedTip = enhanced?.[i] || null;
      
      try {
        const blob = this.generateEnhancedTipPDF(tip, enhancedTip);
        const fileName = `tip_${tip.id}_${tip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        
        results.push({ fileName, blob });
        
        if (onProgress) {
          onProgress(i + 1, tips.length);
        }
      } catch (error) {
        console.error(`Error generating PDF for tip ${tip.id}:`, error);
      }
    }
    
    return results;
  }

  // Generate mega PDF with all tips
  generateMegaPDF(tips: DatabaseTip[], enhanced?: GrokEnhancedTip[]): Blob {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    // Cover page
    this.drawMegaPDFCover(tips.length);
    
    // Table of contents
    this.doc.addPage();
    this.currentY = this.margin;
    this.drawDetailedTableOfContents(tips);

    // Individual tips
    tips.forEach((tip, index) => {
      this.doc.addPage();
      this.currentY = this.margin;
      
      const enhancedTip = enhanced?.[index] || null;
      this.drawFullTip(tip, enhancedTip, index + 1, tips.length);
    });

    return this.doc.output('blob');
  }

  private drawMegaPDFCover(totalTips: number) {
    // Background
    this.doc.setFillColor(30, 58, 138);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
    
    // Logo area
    this.doc.setFillColor(255, 255, 255);
    this.doc.setFontSize(48);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BDBT', this.pageWidth / 2, 60, { align: 'center' });
    
    // Title
    this.doc.setFontSize(36);
    this.doc.text('Complete Tips Collection', this.pageWidth / 2, 100, { align: 'center' });
    
    // Subtitle
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${totalTips} Tips for Better Days, Better Tomorrow`, this.pageWidth / 2, 120, { align: 'center' });
    
    // Categories breakdown
    this.doc.setFontSize(16);
    const categories = ['Health • Wealth • Happiness'];
    this.doc.text(categories[0], this.pageWidth / 2, 160, { align: 'center' });
    
    // Footer
    this.doc.setFontSize(12);
    this.doc.text('Generated: ' + new Date().toLocaleDateString(), this.pageWidth / 2, this.pageHeight - 40, { align: 'center' });
  }

  private drawDetailedTableOfContents(tips: DatabaseTip[]) {
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Table of Contents', this.margin, this.currentY);
    this.currentY += 20;
    
    // Group by category
    const byCategory = {
      health: tips.filter(t => t.category === 'health'),
      wealth: tips.filter(t => t.category === 'wealth'),
      happiness: tips.filter(t => t.category === 'happiness')
    };
    
    Object.entries(byCategory).forEach(([category, categoryTips]) => {
      if (this.currentY > this.pageHeight - 60) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      // Category header
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.getCategoryColor(category).r, this.getCategoryColor(category).g, this.getCategoryColor(category).b);
      this.doc.text(category.charAt(0).toUpperCase() + category.slice(1) + ` (${categoryTips.length})`, this.margin, this.currentY);
      this.currentY += 10;
      
      // Subcategories
      const subcategories = [...new Set(categoryTips.map(t => t.subcategory))];
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100);
      subcategories.forEach(sub => {
        const count = categoryTips.filter(t => t.subcategory === sub).length;
        this.doc.text(`  • ${sub} (${count} tips)`, this.margin + 10, this.currentY);
        this.currentY += 6;
      });
      
      this.currentY += 10;
      this.doc.setTextColor(0);
    });
  }

  private drawFullTip(tip: DatabaseTip, enhanced: GrokEnhancedTip | null, tipNumber: number, totalTips: number) {
    // Page header
    this.doc.setFontSize(10);
    this.doc.setTextColor(150);
    this.doc.text(`Tip ${tipNumber} of ${totalTips}`, this.margin, 10);
    this.doc.text(tip.category.toUpperCase(), this.pageWidth - this.margin, 10, { align: 'right' });
    
    // Main content
    this.currentY = 30;
    this.doc.setTextColor(0);
    
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.wrapText(tip.title, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    // Subtitle
    this.currentY += 10;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100);
    this.wrapText(tip.subtitle, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    // Metadata
    this.currentY += 15;
    this.doc.setFontSize(10);
    this.doc.text(`Difficulty: ${tip.difficulty} | Time: ${tip.implementation_time} | Cost: ${tip.cost}`, this.margin, this.currentY);
    
    // Description
    this.currentY += 15;
    this.doc.setTextColor(0);
    this.doc.setFontSize(11);
    const description = enhanced?.enhancedContent.expandedDescription || tip.description;
    this.wrapText(description, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    // Benefits
    this.currentY += 15;
    const benefits = enhanced?.enhancedContent.detailedBenefits || [
      tip.primary_benefit,
      tip.secondary_benefit,
      tip.tertiary_benefit
    ];
    this.drawCompactSection('Benefits', benefits.slice(0, 5));
    
    // Implementation
    if (enhanced?.enhancedContent.implementationSteps) {
      this.currentY += 10;
      this.drawCompactSection('How to Implement', enhanced.enhancedContent.implementationSteps.slice(0, 5));
    }
  }

  private drawCompactSection(title: string, items: string[]) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 6;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      this.doc.text('• ', this.margin + 5, this.currentY);
      this.wrapText(item, this.margin + 10, this.currentY, this.pageWidth - 2 * this.margin - 10);
      this.currentY += 6;
    });
  }

  private getCategoryColor(category: string): { r: number; g: number; b: number } {
    const colors = {
      health: { r: 34, g: 197, b: 94 },
      wealth: { r: 250, g: 204, b: 21 },
      happiness: { r: 168, g: 85, b: 247 }
    };
    return colors[category as keyof typeof colors] || { r: 0, g: 0, b: 0 };
  }
}

export const pdfGenerator = new PDFGenerator();