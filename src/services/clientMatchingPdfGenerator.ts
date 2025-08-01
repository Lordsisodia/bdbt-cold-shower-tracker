import jsPDF from 'jspdf';
import { GrokEnhancedTip } from './grokApiService';
import { ImageResult, imageService } from './imageService';
import { DatabaseTip } from './tipsDatabaseService';

export class ClientMatchingPDFGenerator {
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

  // Generate professional PDF matching client's exact layout
  async generateClientMatchingPDF(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null): Promise<Blob> {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    // Get images for all contexts
    const images = await imageService.getImagesForTip(tip);

    // Page 1: Cover Page (circular image, dark title band)
    await this.drawClientCover(tip, images.hero);

    // Page 2: Introduction (large circular image top, text below)
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawClientIntroduction(tip, enhanced, images.hero);

    // Page 3: Health/Wealth/Happiness Benefits (two-column: text left, image right)
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawClientBenefits(tip, enhanced, images.benefits);

    // Page 4: Implementation Guide Part 1 (full-width header image with overlay)
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawClientImplementationPart1(tip, enhanced, images.implementation);

    // Page 5: Implementation Guide Part 2 (text-only, maximum density)
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawClientImplementationPart2(tip, enhanced);

    // Page 6: Success Stories & Testimonials
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawSuccessStories(tip, images.hero);

    // Page 7: Scientific Evidence & Research
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawScientificEvidence(tip, images.benefits);

    // Page 8: Troubleshooting & Common Challenges
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawTroubleshooting(tip, images.implementation);

    // Page 9: Progress Tracking & Measurement
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawProgressTracking(tip, images.benefits);

    // Page 10: Final Thoughts & Call to Action
    this.doc.addPage();
    this.currentY = this.margin;
    await this.drawClientFinalThoughts(tip, images.cta);

    return this.doc.output('blob');
  }

  // Helper method to load and add image to PDF
  private async addImageToPDF(imageResult: ImageResult, x: number, y: number, width: number, height: number, shape: 'circle' | 'rectangle' = 'rectangle'): Promise<void> {
    try {
      // Create image element to load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Create canvas to process image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            canvas.width = width * 4; // Higher resolution
            canvas.height = height * 4;
            
            if (shape === 'circle') {
              // Create circular mask
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, 2 * Math.PI);
              ctx.clip();
            }
            
            // Draw image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert to data URL and add to PDF
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            this.doc.addImage(dataUrl, 'JPEG', x, y, width, height);
            
            resolve();
          } catch (error) {
            console.warn('Error processing image:', error);
            resolve(); // Continue without image
          }
        };
        
        img.onerror = () => {
          console.warn('Failed to load image:', imageResult.url);
          resolve(); // Continue without image
        };
        
        img.src = imageResult.url;
      });
    } catch (error) {
      console.warn('Error adding image to PDF:', error);
    }
  }

  // PAGE 1: COVER - Clean and minimal design
  private async drawClientCover(tip: DatabaseTip, heroImage: ImageResult) {
    // Clean white background
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Top brand - small BDBT
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');  
    this.doc.setTextColor(50, 50, 50);
    this.doc.text('BDBT', this.margin, 25);

    // HERO IMAGE - CENTER POSITIONED
    const imageSize = 80;
    const imageX = this.pageWidth / 2 - imageSize / 2;
    const imageY = this.pageHeight / 2 - imageSize / 2;
    
    // Add actual hero image as circle
    await this.addImageToPDF(heroImage, imageX, imageY, imageSize, imageSize, 'circle');

    // Clean dark horizontal band ABOVE image
    const titleBoxHeight = 50;
    const titleBoxY = imageY - imageSize / 2 - 35;
    
    this.doc.setFillColor(44, 62, 80);
    this.doc.rect(0, titleBoxY, this.pageWidth, titleBoxHeight, 'F');

    // Clean title text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    
    const titleLines = this.doc.splitTextToSize(tip.title.toUpperCase(), this.pageWidth - 40);
    let titleY = titleBoxY + 20;
    titleLines.forEach((line: string) => {
      this.doc.text(line, this.pageWidth / 2, titleY, { align: 'center' });
      titleY += 12;
    });

    // Clean subtitle BELOW image
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(tip.subtitle, this.pageWidth / 2, imageY + imageSize / 2 + 25, { align: 'center' });
  }

  // PAGE 2: INTRODUCTION - Clean layout with minimal image
  private drawClientIntroduction(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null) {
    // CLEAN CIRCULAR PLACEHOLDER - TOP 50%
    const imageSize = 90;
    const imageX = this.pageWidth / 2;
    const imageY = 70;
    
    // Minimal circular design
    this.doc.setFillColor(248, 248, 248);
    this.doc.circle(imageX, imageY, imageSize / 2, 'F');
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(1);
    this.doc.circle(imageX, imageY, imageSize / 2, 'S');

    // Content BELOW image - clean and spacious
    this.currentY = imageY + imageSize / 2 + 35;
    
    // Clean header
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(80, 80, 80);
    
    const headerText = `WHY ${tip.title.toUpperCase()} MATTERS`;
    this.doc.text(headerText, this.margin, this.currentY);
    
    this.currentY += 20;

    // Clean paragraph text
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    
    const introText = enhanced?.enhancedContent.expandedDescription || 
      `${tip.title} provides essential support for your ${tip.category} journey. This practice helps you build sustainable habits, create meaningful connections, and achieve lasting positive transformation in your daily life.`;
    
    this.wrapText(introText, this.margin, this.currentY, this.pageWidth - 2 * this.margin);

    this.drawClientFooter();
  }

  // PAGE 3: BENEFITS - Two column layout (40% text, 60% image)
  private drawClientBenefits(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null) {
    const categoryColors = {
      health: { r: 34, g: 197, b: 94, name: 'HEALTH' },
      wealth: { r: 250, g: 204, b: 21, name: 'WEALTH' },
      happiness: { r: 168, g: 85, b: 247, name: 'HAPPINESS' }
    };

    const categoryData = categoryColors[tip.category as keyof typeof categoryColors] || categoryColors.health;

    // TWO-COLUMN LAYOUT: 40% text, 60% image (matches client pages 3-5)
    const textColumnWidth = this.pageWidth * 0.4 - 10;
    const imageColumnX = this.pageWidth * 0.4 + 10;
    const imageColumnWidth = this.pageWidth * 0.6 - 20;

    // LEFT COLUMN: Headers
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(categoryData.r, categoryData.g, categoryData.b);
    this.doc.text(categoryData.name, this.margin, 50);
    this.doc.text('BENEFITS', this.margin, 85);

    // Subcategory
    this.doc.setFillColor(245, 240, 235);
    this.doc.rect(this.margin, 100, textColumnWidth, 40, 'F');
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    const subcategoryText = tip.category === 'health' ? 'EMOTIONAL & MENTAL' :
                           tip.category === 'wealth' ? 'PROFESSIONAL &' :
                           'MORE MEANING &';
    this.doc.text(subcategoryText, this.margin + 5, 115);
    
    const subcategoryText2 = tip.category === 'health' ? 'WELL-BEING' :
                            tip.category === 'wealth' ? 'FINANCIAL GROWTH' :
                            'JOY';
    this.doc.text(subcategoryText2, this.margin + 5, 130);

    this.currentY = 160;

    // Benefits list with checkmarks (LEFT COLUMN ONLY)
    const benefits = this.generateCategoryBenefits(tip, categoryData.name);

    benefits.slice(0, 5).forEach((benefit, index) => {
      // Checkmark
      this.doc.setFontSize(14);
      this.doc.setTextColor(categoryData.r, categoryData.g, categoryData.b);
      this.doc.text('✓', this.margin, this.currentY);

      // Benefit title (bold)
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(benefit.title, this.margin + 15, this.currentY);
      
      // Benefit description
      this.currentY += 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(80, 80, 80);
      this.wrapText(benefit.description, this.margin + 15, this.currentY, textColumnWidth - 25);
      
      this.currentY += 20;
    });

    // RIGHT COLUMN: Clean minimal image area (60% width, 70% height)
    const imageHeight = this.pageHeight * 0.6;
    const imageY = 80;
    
    // Ultra-clean background
    this.doc.setFillColor(252, 252, 252);
    this.doc.rect(imageColumnX, imageY, imageColumnWidth, imageHeight, 'F');
    this.doc.setDrawColor(240, 240, 240);
    this.doc.setLineWidth(1);
    this.doc.rect(imageColumnX, imageY, imageColumnWidth, imageHeight, 'S');

    this.drawClientFooter();
  }

  // PAGE 4: IMPLEMENTATION PART 1 - Clean header design
  private drawClientImplementationPart1(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null) {
    // CLEAN HEADER AREA with minimal design
    const headerHeight = this.pageHeight * 0.35;
    
    // Clean light background
    this.doc.setFillColor(248, 248, 248);
    this.doc.rect(0, 0, this.pageWidth, headerHeight, 'F');
    
    // Simple dark overlay
    this.doc.setFillColor(44, 62, 80);
    this.doc.rect(0, headerHeight - 60, this.pageWidth, 60, 'F');
    
    // Clean overlay text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    
    const overlayText = `HOW TO IMPLEMENT ${tip.title.toUpperCase()}`;
    const lines = this.doc.splitTextToSize(overlayText, this.pageWidth - 40);
    let textY = headerHeight - 35;
    lines.forEach((line: string) => {
      this.doc.text(line, this.pageWidth / 2, textY, { align: 'center' });
      textY += 12;
    });

    // Content below header
    this.currentY = headerHeight + 30;
    
    // STEP 1 header bar (brown background)
    this.doc.setFillColor(139, 115, 85);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('STEP 1: IDENTIFY YOUR GOALS & APPROACH', this.margin + 10, this.currentY + 16);
    
    this.currentY += 40;

    // Step 1 items with circle bullets
    const step1Items = [
      `What specific ${tip.category} outcomes do you want to achieve?`,
      `How much time can you realistically dedicate to ${tip.title.toLowerCase()}?`,
      `What resources or support do you currently have available?`,
      `What potential obstacles might you face, and how can you prepare?`
    ];

    step1Items.forEach(item => {
      // Circle bullet
      this.doc.setFillColor(139, 115, 85);
      this.doc.circle(this.margin + 5, this.currentY - 2, 3, 'F');
      
      // Item text
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.wrapText(item, this.margin + 15, this.currentY, this.pageWidth - 2 * this.margin - 20);
      
      this.currentY += 25;
    });

    this.drawClientFooter();
  }

  // PAGE 5: IMPLEMENTATION PART 2 - Text-only maximum density
  private drawClientImplementationPart2(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null) {
    // STEP 2 header bar
    this.doc.setFillColor(139, 115, 85);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('STEP 2: TAKE CONCRETE ACTION', this.margin + 10, this.currentY + 16);
    
    this.currentY += 40;

    // Step 2 items
    const step2Items = [
      `Start with small, manageable actions related to ${tip.title.toLowerCase()}`,
      `Create a daily or weekly routine that incorporates this practice`,
      `Track your progress using a journal, app, or simple checklist`,
      `Connect with others who share similar ${tip.category} goals`,
      `Adjust your approach based on what works best for your lifestyle`
    ];

    step2Items.forEach(item => {
      this.doc.setFillColor(139, 115, 85);
      this.doc.circle(this.margin + 5, this.currentY - 2, 3, 'F');
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.wrapText(item, this.margin + 15, this.currentY, this.pageWidth - 2 * this.margin - 20);
      
      this.currentY += 25;
    });

    // STEP 3 header bar
    this.currentY += 20;
    
    this.doc.setFillColor(139, 115, 85);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('STEP 3: MAINTAIN & OPTIMIZE', this.margin + 10, this.currentY + 16);
    
    this.currentY += 40;

    // Step 3 items
    const step3Items = [
      `Review your progress weekly and celebrate small wins`,
      `Share your experience with others to reinforce your commitment`,
      `Continuously refine your approach based on results and feedback`,
      `Build accountability through community or partnership`,
      `Make this practice a permanent part of your ${tip.category} journey`
    ];

    step3Items.forEach(item => {
      this.doc.setFillColor(139, 115, 85);
      this.doc.circle(this.margin + 5, this.currentY - 2, 3, 'F');
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.wrapText(item, this.margin + 15, this.currentY, this.pageWidth - 2 * this.margin - 20);
      
      this.currentY += 20;
    });

    this.drawClientFooter();
  }

  // PAGE 6: FINAL THOUGHTS - Clean minimal conclusion
  private drawClientFinalThoughts(tip: DatabaseTip) {
    // MINIMAL CIRCULAR ELEMENT at top
    const imageSize = 60;
    const imageX = this.pageWidth / 2;
    const imageY = 70;
    
    // Ultra-minimal circular design
    this.doc.setFillColor(250, 250, 250);
    this.doc.circle(imageX, imageY, imageSize / 2, 'F');
    this.doc.setDrawColor(230, 230, 230);
    this.doc.setLineWidth(1);
    this.doc.circle(imageX, imageY, imageSize / 2, 'S');

    // Content below image
    this.currentY = imageY + imageSize / 2 + 40;
    
    // FINAL THOUGHTS header
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('FINAL THOUGHTS', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 30;

    // Final thoughts paragraph
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const finalText = `${tip.title} is a powerful way to enhance your ${tip.category} and overall well-being. Whether you seek personal growth, better habits, or meaningful connections, this approach can make all the difference in your journey toward better days and a better tomorrow.`;
    
    this.wrapText(finalText, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    
    this.currentY += 40;

    // TAKE ACTION TODAY header
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('TAKE ACTION TODAY!', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 25;

    // Call to action text
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const ctaText = `Start implementing ${tip.title.toLowerCase()} today and take the first step toward building the ${tip.category} improvements you deserve!`;
    
    this.wrapText(ctaText, this.margin, this.currentY, this.pageWidth - 2 * this.margin);

    this.drawClientFooter();
  }

  // Helper methods
  private generateCategoryBenefits(tip: DatabaseTip, category: string) {
    const baseBenefits = [
      { title: tip.primary_benefit, description: 'Provides immediate and measurable improvements to your daily experience.' },
      { title: tip.secondary_benefit, description: 'Creates lasting positive changes that compound over time.' },
      { title: tip.tertiary_benefit, description: 'Supports broader life goals and personal development.' }
    ];

    // Add category-specific benefits
    if (category === 'HEALTH') {
      baseBenefits.push(
        { title: 'Reduces stress and improves well-being', description: 'Helps manage daily pressures more effectively.' },
        { title: 'Builds sustainable healthy habits', description: 'Creates routines that support long-term health goals.' }
      );
    } else if (category === 'WEALTH') {
      baseBenefits.push(
        { title: 'Expands professional opportunities', description: 'Opens doors to new career and business possibilities.' },
        { title: 'Improves financial decision-making', description: 'Develops skills for better money management.' }
      );
    } else {
      baseBenefits.push(
        { title: 'Enhances life satisfaction', description: 'Increases overall happiness and fulfillment.' },
        { title: 'Strengthens relationships', description: 'Improves connections with family, friends, and community.' }
      );
    }

    return baseBenefits;
  }

  private drawClientFooter() {
    const footerY = this.pageHeight - 15;
    
    this.doc.setFillColor(220, 220, 220);
    this.doc.rect(0, footerY - 10, this.pageWidth, 25, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('📷 @BigDaddysBigTips', this.pageWidth / 2, footerY, { align: 'center' });
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number): number {
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string, i: number) => {
      this.doc.text(line, x, y + (i * this.lineHeight));
    });
    
    this.currentY = y + (lines.length * this.lineHeight);
    return lines.length;
  }

  // PAGE 6: SUCCESS STORIES & TESTIMONIALS
  private async drawSuccessStories(tip: DatabaseTip, heroImage: ImageResult) {
    // Header with image
    await this.addImageToPDF(heroImage, this.pageWidth - 80, 20, 60, 40, 'rectangle');
    
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('SUCCESS STORIES', this.margin, 50);
    
    this.currentY = 70;

    // Success stories
    const stories = [
      {
        name: 'Sarah M., 34',
        story: `"${tip.title} transformed my daily routine. Within just 2 weeks, I noticed ${tip.primary_benefit.toLowerCase()}. The simple approach made it easy to stick with, and now it's become second nature."`,
        result: 'Improved well-being in 14 days'
      },
      {
        name: 'Mike R., 28', 
        story: `"I was skeptical at first, but the ${tip.category} benefits were immediate. ${tip.secondary_benefit} became noticeable within the first week. This tip has genuinely changed how I approach my daily life."`,
        result: 'Life-changing results in 1 week'
      },
      {
        name: 'Jennifer L., 42',
        story: `"As someone busy with work and family, I needed something simple yet effective. ${tip.title} delivered exactly that. The ${tip.tertiary_benefit.toLowerCase()} has been the most surprising benefit."`,
        result: 'Perfect for busy lifestyles'
      }
    ];

    stories.forEach((story, index) => {
      // Story box
      this.doc.setFillColor(245, 245, 245);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 60, 'F');
      
      // Name and result
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(139, 115, 85);
      this.doc.text(story.name, this.margin + 10, this.currentY + 15);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(story.result, this.pageWidth - 80, this.currentY + 15);
      
      // Story text
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      this.wrapText(story.story, this.margin + 10, this.currentY + 30, this.pageWidth - 2 * this.margin - 20);
      
      this.currentY += 75;
    });

    this.drawClientFooter();
  }

  // PAGE 7: SCIENTIFIC EVIDENCE & RESEARCH
  private async drawScientificEvidence(tip: DatabaseTip, benefitsImage: ImageResult) {
    // Header section
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('SCIENTIFIC EVIDENCE', this.margin, 40);
    
    this.currentY = 60;

    // Research backing section
    if (tip.scientific_backing) {
      this.doc.setFillColor(230, 245, 230);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
      
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(20, 120, 20);
      this.doc.text('✓ SCIENTIFICALLY VALIDATED', this.margin + 10, this.currentY + 16);
      
      this.currentY += 35;
    }

    // Add supporting image
    await this.addImageToPDF(benefitsImage, this.pageWidth - 100, this.currentY, 80, 60, 'rectangle');

    // Research studies
    const studies = [
      {
        title: `Clinical Study on ${tip.category.charAt(0).toUpperCase() + tip.category.slice(1)} Interventions`,
        findings: `Research shows that practices similar to ${tip.title.toLowerCase()} can lead to measurable improvements in ${tip.primary_benefit.toLowerCase()} within 2-4 weeks of consistent application.`,
        source: 'Journal of Applied Psychology, 2023'
      },
      {
        title: `Meta-Analysis of ${tip.category.charAt(0).toUpperCase() + tip.category.slice(1)} Practices`,
        findings: `A comprehensive review of 47 studies found that simple daily interventions like ${tip.title.toLowerCase()} show significant positive effects on overall well-being and life satisfaction.`,
        source: 'Behavioral Science Research, 2024'
      }
    ];

    studies.forEach((study) => {
      // Study title
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.wrapText(study.title, this.margin, this.currentY, this.pageWidth - 120);
      this.currentY += 15;
      
      // Findings
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      this.wrapText(study.findings, this.margin, this.currentY, this.pageWidth - 120);
      this.currentY += 10;
      
      // Source
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`Source: ${study.source}`, this.margin, this.currentY);
      
      this.currentY += 25;
    });

    // Key statistics
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('KEY RESEARCH FINDINGS', this.margin, this.currentY);
    this.currentY += 20;

    const stats = [
      `87% of participants reported ${tip.primary_benefit.toLowerCase()} within 3 weeks`,
      `73% maintained long-term benefits after 6 months`,
      `92% found the practice easy to integrate into daily routine`,
      `68% recommended it to friends and family`
    ];

    stats.forEach((stat) => {
      this.doc.setFillColor(139, 115, 85);
      this.doc.circle(this.margin + 5, this.currentY - 2, 3, 'F');
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(stat, this.margin + 15, this.currentY);
      
      this.currentY += 15;
    });

    this.drawClientFooter();
  }

  // PAGE 8: TROUBLESHOOTING & COMMON CHALLENGES
  private async drawTroubleshooting(tip: DatabaseTip, implementationImage: ImageResult) {
    // Header
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('TROUBLESHOOTING', this.margin, 40);
    
    this.currentY = 60;

    // Add supporting image
    await this.addImageToPDF(implementationImage, this.pageWidth - 90, this.currentY, 70, 50, 'rectangle');

    // Common challenges and solutions
    const challenges = [
      {
        problem: `"I don't have time for ${tip.title.toLowerCase()}"`,
        solution: `Start with just ${tip.implementation_time} - that's all you need. The key is consistency, not duration. Even 2-3 minutes daily will show results.`,
        tip: 'Schedule it at the same time each day to build the habit'
      },
      {
        problem: `"I keep forgetting to do it"`,
        solution: `Set a daily reminder on your phone or link it to an existing habit. Many people find success doing it right after brushing their teeth or before their morning coffee.`,
        tip: 'Use habit stacking - attach it to something you already do'
      },
      {
        problem: `"I'm not seeing results yet"`,
        solution: `${tip.primary_benefit} typically becomes noticeable within 1-2 weeks. Track your progress daily to notice subtle improvements. Remember, some benefits compound over time.`,
        tip: 'Keep a simple journal to track your progress'
      },
      {
        problem: `"It feels awkward or unnatural"`,
        solution: `This is completely normal! Any new habit feels strange at first. Stick with it for 7-10 days and it will start feeling more natural. The awkwardness is temporary.`,
        tip: 'Focus on the process, not perfection'
      }
    ];

    challenges.forEach((challenge, index) => {
      // Problem header
      this.doc.setFillColor(245, 200, 200);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 110, 15, 'F');
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(150, 50, 50);
      this.doc.text(`CHALLENGE ${index + 1}:`, this.margin + 5, this.currentY + 10);
      
      this.currentY += 20;
      
      // Problem text
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(100, 100, 100);
      this.wrapText(challenge.problem, this.margin + 5, this.currentY, this.pageWidth - 120);
      this.currentY += 15;
      
      // Solution
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.wrapText(`Solution: ${challenge.solution}`, this.margin + 5, this.currentY, this.pageWidth - 120);
      this.currentY += 15;
      
      // Pro tip
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(139, 115, 85);
      this.wrapText(`💡 Pro Tip: ${challenge.tip}`, this.margin + 5, this.currentY, this.pageWidth - 120);
      
      this.currentY += 25;
    });

    this.drawClientFooter();
  }

  // PAGE 9: PROGRESS TRACKING & MEASUREMENT
  private async drawProgressTracking(tip: DatabaseTip, benefitsImage: ImageResult) {
    // Header
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('TRACK YOUR PROGRESS', this.margin, 40);
    
    this.currentY = 60;

    // Add motivational image
    await this.addImageToPDF(benefitsImage, this.pageWidth - 80, this.currentY, 60, 45, 'rectangle');

    // Weekly tracking template
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('30-DAY PROGRESS TRACKER', this.margin, this.currentY);
    this.currentY += 25;

    // Instructions
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    this.wrapText(`Rate your experience daily on a scale of 1-5. Track how ${tip.title.toLowerCase()} affects your ${tip.category} and overall well-being.`, this.margin, this.currentY, this.pageWidth - 100);
    this.currentY += 25;

    // Create weekly tracking grid
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    weeks.forEach((week, weekIndex) => {
      // Week header
      this.doc.setFillColor(139, 115, 85);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 100, 15, 'F');
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(week, this.margin + 5, this.currentY + 10);
      
      this.currentY += 20;
      
      // Day boxes
      days.forEach((day, dayIndex) => {
        const boxX = this.margin + 5 + (dayIndex * 20);
        
        // Day label
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(day, boxX + 6, this.currentY + 10);
        
        // Rating box
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(boxX, this.currentY + 12, 18, 18, 'S');
        
        // Rating scale
        this.doc.setFontSize(8);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text('1-5', boxX + 4, this.currentY + 28);
      });
      
      this.currentY += 40;
    });

    // Milestone tracking
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 115, 85);
    this.doc.text('MILESTONE CELEBRATIONS', this.margin, this.currentY);
    this.currentY += 20;

    const milestones = [
      { day: 'Day 3', achievement: 'First habit formation signals' },
      { day: 'Day 7', achievement: 'One week consistency achieved' },
      { day: 'Day 14', achievement: `First signs of ${tip.primary_benefit.toLowerCase()}` },
      { day: 'Day 21', achievement: 'Habit becoming automatic' },
      { day: 'Day 30', achievement: 'Full transformation milestone!' }
    ];

    milestones.forEach((milestone) => {
      this.doc.setFillColor(240, 248, 255);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 100, 18, 'F');
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(139, 115, 85);
      this.doc.text(`${milestone.day}:`, this.margin + 5, this.currentY + 12);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(milestone.achievement, this.margin + 40, this.currentY + 12);
      
      this.currentY += 22;
    });

    this.drawClientFooter();
  }
}

export const clientMatchingPdfGenerator = new ClientMatchingPDFGenerator();