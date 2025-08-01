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
    this.margin = 24; // Increased for better breathing room
    this.currentY = this.margin;
    this.lineHeight = 8; // Improved line spacing for readability
  }

  generateTipPDF(tip: Tip): Blob {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    // Draw improved header with title at top
    this.drawImprovedHeader(tip);

    // Description with modern typography and formatting
    this.currentY += 8;
    
    // Description section with improved readability
    const descriptionAreaWidth = this.pageWidth - 2 * this.margin;
    const optimalLineLength = Math.min(descriptionAreaWidth, 400); // Optimal reading line length
    const descriptionX = this.margin + (descriptionAreaWidth - optimalLineLength) / 2;
    
    // Lead paragraph styling (modern approach)
    this.doc.setFontSize(14); // Larger for lead paragraph
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(31, 41, 55); // High contrast for readability
    
    // Better line height for body text
    const originalLineHeight = this.lineHeight;
    this.lineHeight = 9; // Increased for better readability
    
    this.wrapText(tip.content.description, descriptionX, this.currentY, optimalLineLength);
    
    // Restore original line height
    this.lineHeight = originalLineHeight;

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

  private drawImprovedHeader(tip: Tip) {
    // Modern 2025 design with sophisticated color palette
    const colors = {
      health: { 
        primary: { r: 16, g: 185, b: 129 }, // Modern emerald
        secondary: { r: 236, g: 253, b: 245 }, // Light emerald
        accent: { r: 5, g: 150, b: 105 } // Darker emerald
      },
      wealth: { 
        primary: { r: 245, g: 158, b: 11 }, // Modern amber
        secondary: { r: 255, g: 251, b: 235 }, // Light amber
        accent: { r: 217, g: 119, b: 6 } // Darker amber
      },
      happiness: { 
        primary: { r: 139, g: 92, b: 246 }, // Modern violet
        secondary: { r: 245, g: 243, b: 255 }, // Light violet
        accent: { r: 124, g: 58, b: 237 } // Darker violet
      }
    };
    
    const colorScheme = colors[tip.category];
    
    // Calculate dynamic header using golden ratio principles
    let headerHeight = 140;
    const titleLength = tip.content.title.length;
    const subtitleLength = tip.content.subtitle.length;
    
    // More sophisticated height calculation
    if (titleLength > 50 || subtitleLength > 70) headerHeight = 160;
    if (titleLength > 80 || subtitleLength > 100) headerHeight = 180;
    if (titleLength > 120 || subtitleLength > 140) headerHeight = 200;
    
    // Modern gradient-like background effect (simulated with subtle tones)
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, this.pageWidth, headerHeight, 'F');
    
    // Subtle background pattern using secondary color
    this.doc.setFillColor(colorScheme.secondary.r, colorScheme.secondary.g, colorScheme.secondary.b);
    this.doc.rect(0, 0, this.pageWidth, headerHeight, 'F');
    
    // Modern accent design - vertical stripe following golden ratio
    const accentWidth = this.pageWidth * 0.618 * 0.01; // ~4px using golden ratio
    this.doc.setFillColor(colorScheme.primary.r, colorScheme.primary.g, colorScheme.primary.b);
    this.doc.rect(0, 0, accentWidth, headerHeight, 'F');
    
    // Brand section with improved typography hierarchy
    this.doc.setTextColor(55, 65, 81); // Modern neutral gray
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BDBT', this.margin, 24);
    
    // Tagline with modern spacing
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text('BETTER DAYS, BETTER TOMORROW', this.margin, 32);
    
    // Title with sophisticated typography scale
    this.currentY = 52;
    this.doc.setTextColor(17, 24, 39); // Nearly black for high contrast
    
    // Typography scale based on modern design systems
    let titleFontSize = 32; // Larger base size
    if (titleLength > 40) titleFontSize = 28;
    if (titleLength > 60) titleFontSize = 24;
    if (titleLength > 90) titleFontSize = 22;
    
    this.doc.setFontSize(titleFontSize);
    this.doc.setFont('helvetica', 'bold');
    const titleLines = this.wrapTextWithReturn(tip.content.title, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    // Subtitle with improved spacing using modular scale
    this.currentY += Math.max(titleLines * 10, 16);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99); // Medium gray for hierarchy
    const subtitleLines = this.wrapTextWithReturn(tip.content.subtitle, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    // Modern metadata design with card-like elements
    const metaY = headerHeight - 36;
    const cardHeight = 24;
    const cardSpacing = 8;
    
    // Category card with modern shadow effect (simulated)
    this.drawModernCard(this.margin, metaY, 80, cardHeight, colorScheme.primary, tip.category.toUpperCase());
    
    // Difficulty card
    const difficultyColor = { r: 75, g: 85, b: 99 }; // Neutral
    this.drawModernCard(this.margin + 88, metaY, 80, cardHeight, difficultyColor, tip.difficulty.toUpperCase());
    
    // Read time card
    const timeColor = { r: 107, g: 114, b: 128 }; // Light neutral
    this.drawModernCard(this.pageWidth - this.margin - 88, metaY, 88, cardHeight, timeColor, `${tip.content.readTime} MIN READ`);
    
    // Subtle separator line using golden ratio positioning
    const lineY = headerHeight - 8;
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, lineY, this.pageWidth - this.margin, lineY);
    
    this.currentY = headerHeight + 16; // More generous spacing
  }

  private drawModernCard(x: number, y: number, width: number, height: number, color: {r: number, g: number, b: number}, text: string) {
    // Card background with subtle shadow effect
    this.doc.setFillColor(color.r, color.g, color.b);
    this.doc.roundedRect(x, y, width, height, 6, 6, 'F');
    
    // Text with proper centering
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, x + width/2, y + height/2 + 2, { align: 'center' });
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
    // More accurate space estimation using modern design principles
    const estimatedLinesPerItem = 2.5;
    const sectionPadding = 32; // Generous padding following modern design
    const estimatedSpace = (items.length * estimatedLinesPerItem * this.lineHeight) + sectionPadding + 40;
    
    // Smart page break with better footer margin
    if (this.currentY + estimatedSpace > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = this.margin + 8;
    }

    // Modern section header with sophisticated typography
    this.currentY += 16; // Breathing room before section
    
    // Section number/icon (visual hierarchy improvement)
    this.doc.setFillColor(17, 24, 39);
    this.doc.circle(this.margin + 6, this.currentY - 2, 2, 'F');
    
    // Section title with modern typography scale
    this.doc.setFontSize(20); // Larger for better hierarchy
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39); // High contrast black
    this.doc.text(title, this.margin + 16, this.currentY);
    
    // Modern underline using golden ratio proportions
    const underlineWidth = Math.min(title.length * 8, this.pageWidth * 0.382); // Golden ratio
    this.doc.setDrawColor(209, 213, 219);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin + 16, this.currentY + 4, this.margin + 16 + underlineWidth, this.currentY + 4);
    
    this.currentY += 24; // Modern spacing
    
    // Content area with improved grid system
    const contentAreaWidth = this.pageWidth - 2 * this.margin;
    const itemIndent = 20; // Consistent indentation
    
    items.forEach((item, index) => {
      // Intelligent page break detection
      const estimatedItemLines = Math.ceil(item.length / 85);
      const itemHeight = Math.max(16, estimatedItemLines * this.lineHeight + 8);
      
      if (this.currentY + itemHeight > this.pageHeight - 80) {
        this.doc.addPage();
        this.currentY = this.margin + 8;
      }
      
      // Modern card-like design for each item
      const cardPadding = 12;
      const cardMargin = 4;
      const cardHeight = Math.max(20, itemHeight + cardPadding);
      
      // Subtle card background with modern shadow simulation
      if (index % 2 === 0) {
        this.doc.setFillColor(249, 250, 251); // Very light neutral
        this.doc.roundedRect(this.margin - cardMargin, this.currentY - cardPadding/2, contentAreaWidth + 2*cardMargin, cardHeight, 4, 4, 'F');
      }
      
      // Modern bullet point design
      const bulletX = this.margin + 12;
      const bulletY = this.currentY + 2;
      
      // Gradient-like bullet (simulated with multiple circles)
      this.doc.setFillColor(75, 85, 99);
      this.doc.circle(bulletX, bulletY, 2.5, 'F');
      this.doc.setFillColor(107, 114, 128);
      this.doc.circle(bulletX, bulletY, 1.5, 'F');
      
      // Item text with improved typography
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(55, 65, 81); // Modern neutral for readability
      
      const textStartY = this.currentY;
      const linesUsed = this.wrapTextWithReturn(
        item, 
        this.margin + itemIndent, 
        this.currentY, 
        contentAreaWidth - itemIndent - 8
      );
      
      // Consistent spacing using modular scale
      const actualHeight = this.currentY - textStartY;
      this.currentY = textStartY + Math.max(actualHeight, 16) + 8;
    });
    
    // Section separator with modern design
    this.currentY += 16;
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    const separatorY = this.currentY;
    this.doc.line(this.margin + 20, separatorY, this.pageWidth - this.margin - 20, separatorY);
    
    this.currentY += 16; // Generous spacing after section
  }

  private drawFooter(tip: Tip) {
    const footerHeight = 32;
    const footerY = this.pageHeight - footerHeight;
    
    // Modern footer background with subtle gradient effect
    this.doc.setFillColor(249, 250, 251);
    this.doc.rect(0, footerY, this.pageWidth, footerHeight, 'F');
    
    // Elegant top border with modern styling
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(1);
    this.doc.line(0, footerY, this.pageWidth, footerY);
    
    // Brand section with improved hierarchy
    this.doc.setFontSize(11);
    this.doc.setTextColor(17, 24, 39);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BDBT', this.margin, footerY + 14);
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text('Better Days, Better Tomorrow', this.margin, footerY + 22);
    
    // Center - Website with modern styling
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    this.doc.text('www.bdbt.com', this.pageWidth / 2, footerY + 18, { align: 'center' });
    
    // Right side - Tip info with modern card design
    const tipCardWidth = 60;
    const tipCardHeight = 20;
    const tipCardX = this.pageWidth - this.margin - tipCardWidth;
    const tipCardY = footerY + 6;
    
    // Tip number card
    this.doc.setFillColor(55, 65, 81);
    this.doc.roundedRect(tipCardX, tipCardY, tipCardWidth, tipCardHeight, 4, 4, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`TIP #${tip.id}`, tipCardX + tipCardWidth/2, tipCardY + tipCardHeight/2 + 2, { align: 'center' });
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

  private wrapTextWithReturn(text: string, x: number, y: number, maxWidth: number, maxLines?: number): number {
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
      id: (tip.id || 0).toString(),
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
        whatsIncluded: enhanced?.enhancedContent.implementationSteps || [],
        readTime: 5
      },
      tags: tip.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      downloadCount: 0
    };

    // Generate enhanced PDF with improved header
    this.drawImprovedHeader(tipData);
    
    // Enhanced description
    this.currentY += 25;
    this.doc.setTextColor(60, 60, 60);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
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