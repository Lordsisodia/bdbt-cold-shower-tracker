import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CanvaDesignData, canvaService } from './canvaIntegration';
import { ComprehensiveEnhancedContent, enhancedGrokService } from './enhancedGrokService';
import { integrationManager } from './integrationManager';
import { DatabaseTip } from './tipsDatabaseService';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg' | 'json' | 'markdown' | 'html' | 'docx' | 'csv' | 'canva';
  quality?: 'standard' | 'high' | 'premium';
  includeImages?: boolean;
  includeMetadata?: boolean;
  canvaTemplate?: 'instagram-post' | 'facebook-post' | 'presentation-slide' | 'a4-document';
  customizations?: {
    colorScheme?: 'light' | 'dark' | 'auto';
    fontSize?: number;
    pageSize?: 'A4' | 'Letter' | 'Legal';
    compression?: boolean;
  };
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  fileSize?: number;
  downloadUrl?: string;
  blob?: Blob;
  error?: string;
}

export class ExportService {
  
  /**
   * Main export function - handles all format types
   */
  async exportTip(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'pdf':
          return await this.exportToPDF(tip, options);
        case 'png':
        case 'jpg':
          return await this.exportToImage(tip, options);
        case 'json':
          return await this.exportToJSON(tip, options);
        case 'markdown':
          return await this.exportToMarkdown(tip, options);
        case 'html':
          return await this.exportToHTML(tip, options);
        case 'docx':
          return await this.exportToDocx(tip, options);
        case 'csv':
          return await this.exportToCSV(tip, options);
        case 'canva':
          return await this.exportToCanva(tip, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Export to PDF (multiple quality levels)
   */
  private async exportToPDF(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    let blob: Blob;
    let fileName: string;

    switch (options.quality) {
      case 'premium':
        // Use improved PDF generator with better text wrapping and spacing
        const { improvedPdfGenerator } = await import('./improvedPdfGenerator');
        blob = improvedPdfGenerator.generateProfessionalPDF(tip);
        fileName = `professional_${tip.id}_${this.sanitizeFileName(tip.title)}.pdf`;
        break;
        
      case 'high':
        // Use comprehensive enhanced PDF with Grok content
        blob = await integrationManager.generateComprehensivePDF(tip);
        fileName = `enhanced_${tip.id}_${this.sanitizeFileName(tip.title)}.pdf`;
        break;
        
      default:
        // Standard PDF from template screenshot
        blob = await this.generatePDFFromTemplate(tip);
        fileName = `standard_${tip.id}_${this.sanitizeFileName(tip.title)}.pdf`;
    }

    return {
      success: true,
      fileName,
      blob,
      fileSize: blob.size,
      downloadUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Export template as high-quality image
   */
  private async exportToImage(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    // Create a temporary container with the template
    const container = await this.createTemplateContainer(tip);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: options.quality === 'premium' ? 3 : options.quality === 'high' ? 2 : 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 1600
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, `image/${options.format}`, options.quality === 'premium' ? 0.95 : 0.8);
      });

      const fileName = `${tip.id}_${this.sanitizeFileName(tip.title)}.${options.format}`;

      return {
        success: true,
        fileName,
        blob,
        fileSize: blob.size,
        downloadUrl: URL.createObjectURL(blob)
      };
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * Export as structured JSON
   */
  private async exportToJSON(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    let content: any = {
      tip,
      exportMetadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        format: 'json'
      }
    };

    // Include enhanced content if requested
    if (options.quality === 'premium') {
      const enhancedContent = await enhancedGrokService.generateComprehensiveContent(tip);
      content.enhancedContent = enhancedContent;
    }

    const jsonString = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `${tip.id}_${this.sanitizeFileName(tip.title)}.json`;

    return {
      success: true,
      fileName,
      blob,
      fileSize: blob.size,
      downloadUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Export as Markdown
   */
  private async exportToMarkdown(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    let markdown = this.generateBasicMarkdown(tip);

    // Include enhanced content for premium exports
    if (options.quality === 'premium') {
      const enhancedContent = await enhancedGrokService.generateComprehensiveContent(tip);
      markdown = this.generateEnhancedMarkdown(tip, enhancedContent);
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const fileName = `${tip.id}_${this.sanitizeFileName(tip.title)}.md`;

    return {
      success: true,
      fileName,
      blob,
      fileSize: blob.size,
      downloadUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Export as HTML
   */
  private async exportToHTML(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    let html = this.generateBasicHTML(tip);

    if (options.quality === 'premium') {
      const enhancedContent = await enhancedGrokService.generateComprehensiveContent(tip);
      html = this.generateEnhancedHTML(tip, enhancedContent);
    }

    const blob = new Blob([html], { type: 'text/html' });
    const fileName = `${tip.id}_${this.sanitizeFileName(tip.title)}.html`;

    return {
      success: true,
      fileName,
      blob,
      fileSize: blob.size,
      downloadUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Export as DOCX (Word Document)
   */
  private async exportToDocx(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    // Create basic DOCX structure
    const docxContent = this.generateDocxContent(tip, options.quality === 'premium');
    
    // For now, we'll create an RTF file which Word can open
    const rtfContent = this.convertToRTF(docxContent);
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const fileName = `${tip.id}_${this.sanitizeFileName(tip.title)}.rtf`;

    return {
      success: true,
      fileName,
      blob,
      fileSize: blob.size,
      downloadUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Export to Canva Design
   */
  private async exportToCanva(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    try {
      // Check if user is authenticated with Canva
      if (!canvaService.isAuthenticated()) {
        return {
          success: false,
          fileName: '',
          error: 'Not authenticated with Canva. Please connect your Canva account first.'
        };
      }

      // Prepare tip data for Canva
      const canvaData: CanvaDesignData = {
        tipId: tip.id || 0,
        title: tip.title,
        subtitle: tip.subtitle,
        category: tip.category,
        benefits: [tip.primary_benefit, tip.secondary_benefit, tip.tertiary_benefit],
        whatsIncluded: [
          `${tip.implementation_time} implementation`,
          `${tip.frequency} practice`,
          `${tip.cost} cost`,
          tip.scientific_backing ? 'Science-backed approach' : 'Practical methodology',
          'Step-by-step guidance'
        ],
        colors: this.getCategoryColors(tip.category),
        branding: canvaService.getBrandingData()
      };

      // Create Canva design
      const design = await canvaService.createDesignFromTip(canvaData);

      return {
        success: true,
        fileName: `canva_${tip.id}_${this.sanitizeFileName(tip.title)}.canva`,
        downloadUrl: design.editUrl,
        fileSize: 0, // Canva designs don't have file size
        metadata: {
          designId: design.designId,
          editUrl: design.editUrl,
          exportUrl: design.exportUrl,
          templateType: options.canvaTemplate || 'default'
        }
      };

    } catch (error) {
      return {
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : 'Failed to create Canva design'
      };
    }
  }

  /**
   * Export as CSV (for data analysis)
   */
  private async exportToCSV(tip: DatabaseTip, options: ExportOptions): Promise<ExportResult> {
    const csvData = [
      ['Field', 'Value'],
      ['ID', tip.id?.toString() || ''],
      ['Title', tip.title],
      ['Subtitle', tip.subtitle],
      ['Category', tip.category],
      ['Difficulty', tip.difficulty],
      ['Description', tip.description],
      ['Primary Benefit', tip.primary_benefit],
      ['Secondary Benefit', tip.secondary_benefit],
      ['Tertiary Benefit', tip.tertiary_benefit],
      ['Implementation Time', tip.implementation_time],
      ['Frequency', tip.frequency],
      ['Cost', tip.cost],
      ['Tags', tip.tags],
      ['Scientific Backing', tip.scientific_backing?.toString() || 'false'],
      ['Export Date', new Date().toISOString()]
    ];

    const csvString = csvData.map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const fileName = `${tip.id}_${this.sanitizeFileName(tip.title)}.csv`;

    return {
      success: true,
      fileName,
      blob,
      fileSize: blob.size,
      downloadUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Batch export multiple tips
   */
  async batchExport(
    tips: DatabaseTip[], 
    options: ExportOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      
      if (onProgress) {
        onProgress(i + 1, tips.length);
      }

      try {
        const result = await this.exportTip(tip, options);
        results.push(result);
        
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          success: false,
          fileName: `${tip.id}_${this.sanitizeFileName(tip.title)}.${options.format}`,
          error: error instanceof Error ? error.message : 'Export failed'
        });
      }
    }

    return results;
  }

  /**
   * Create ZIP archive of multiple exports
   */
  async createZipArchive(exportResults: ExportResult[]): Promise<ExportResult> {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add successful exports to zip
    const successfulResults = exportResults.filter(result => result.success && result.blob);
    
    for (const result of successfulResults) {
      if (result.blob) {
        zip.file(result.fileName, result.blob);
      }
    }

    // Generate zip blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const fileName = `bdbt_tips_export_${new Date().toISOString().split('T')[0]}.zip`;

    return {
      success: true,
      fileName,
      blob: zipBlob,
      fileSize: zipBlob.size,
      downloadUrl: URL.createObjectURL(zipBlob)
    };
  }

  // Helper Methods

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
      .substring(0, 50);
  }

  private async createTemplateContainer(tip: DatabaseTip): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 1200px;
      height: 1600px;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    // Create a simple template representation
    container.innerHTML = `
      <div style="padding: 40px; height: 100%; box-sizing: border-box;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 60px 40px; border-radius: 20px; text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 48px; font-weight: bold; margin: 0 0 20px 0;">${tip.title}</h1>
          <p style="font-size: 24px; opacity: 0.9; margin: 0;">${tip.subtitle}</p>
          <div style="margin-top: 40px;">
            <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; margin: 0 10px;">
              ${tip.category.toUpperCase()}
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; margin: 0 10px;">
              ${tip.difficulty}
            </span>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 40px; border-radius: 15px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; font-size: 32px; margin: 0 0 30px 0;">Key Benefits</h2>
          <div style="display: grid; gap: 20px;">
            <div style="background: white; padding: 30px; border-radius: 12px; border-left: 5px solid #6366f1;">
              <h3 style="color: #6366f1; font-size: 20px; margin: 0 0 10px 0;">🎯 Primary Benefit</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6;">${tip.primary_benefit}</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 12px; border-left: 5px solid #8b5cf6;">
              <h3 style="color: #8b5cf6; font-size: 20px; margin: 0 0 10px 0;">💪 Secondary Benefit</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6;">${tip.secondary_benefit}</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 12px; border-left: 5px solid #06b6d4;">
              <h3 style="color: #06b6d4; font-size: 20px; margin: 0 0 10px 0;">🚀 Long-term Impact</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6;">${tip.tertiary_benefit}</p>
            </div>
          </div>
        </div>

        <div style="background: white; padding: 40px; border-radius: 15px; border: 2px solid #e5e7eb;">
          <h2 style="color: #1f2937; font-size: 32px; margin: 0 0 20px 0;">Implementation</h2>
          <p style="color: #4b5563; font-size: 18px; line-height: 1.7; margin-bottom: 30px;">${tip.description}</p>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 30px;">
            <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 10px;">
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">TIME REQUIRED</div>
              <div style="color: #1f2937; font-size: 18px; font-weight: bold;">${tip.implementation_time}</div>
            </div>
            <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 10px;">
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">FREQUENCY</div>
              <div style="color: #1f2937; font-size: 18px; font-weight: bold;">${tip.frequency}</div>
            </div>
            <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 10px;">
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">COST</div>
              <div style="color: #1f2937; font-size: 18px; font-weight: bold;">${tip.cost}</div>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 60px; padding-top: 40px; border-top: 2px solid #e5e7eb;">
          <div style="font-size: 36px; font-weight: bold; color: #6366f1; margin-bottom: 10px;">BDBT</div>
          <div style="color: #6b7280; font-size: 18px;">Better Days, Better Tomorrow</div>
        </div>
      </div>
    `;

    return container;
  }

  private async generatePDFFromTemplate(tip: DatabaseTip): Promise<Blob> {
    const container = await this.createTemplateContainer(tip);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      return pdf.output('blob');
    } finally {
      document.body.removeChild(container);
    }
  }

  private generateBasicMarkdown(tip: DatabaseTip): string {
    return `# ${tip.title}

## ${tip.subtitle}

**Category:** ${tip.category} | **Difficulty:** ${tip.difficulty}

## Description
${tip.description}

## Key Benefits

### 🎯 Primary Benefit
${tip.primary_benefit}

### 💪 Secondary Benefit  
${tip.secondary_benefit}

### 🚀 Long-term Impact
${tip.tertiary_benefit}

## Implementation Details

- **Time Required:** ${tip.implementation_time}
- **Frequency:** ${tip.frequency}
- **Cost:** ${tip.cost}

## Tags
${tip.tags}

---
*Generated by BDBT - Better Days, Better Tomorrow*
*Export Date: ${new Date().toISOString()}*
`;
  }

  private generateEnhancedMarkdown(tip: DatabaseTip, enhanced: ComprehensiveEnhancedContent): string {
    return `# ${tip.title}

> ${enhanced.tagline}

## ${tip.subtitle}

**Category:** ${tip.category} | **Difficulty:** ${tip.difficulty}

## Overview
${enhanced.expandedDescription}

## Detailed Benefits

${enhanced.detailedBenefits.map((benefit, index) => `
### ${benefit.icon} ${benefit.title}
${benefit.description}

**Expected Results:** ${benefit.timeToSee}  
**Effectiveness:** ${benefit.scientificEvidence.effectSize}%  
**Research:** ${benefit.scientificEvidence.studyName}

#### Success Stories
${benefit.userStories.map(story => `- **${story.name} (${story.age}):** ${story.result} *(${story.timeframe})*`).join('\n')}
`).join('\n')}

## Implementation Guide

### Quick Start
${enhanced.implementationGuide.quickStart.overview}

**Setup Time:** ${enhanced.implementationGuide.quickStart.timeRequired}

#### Materials Needed
${enhanced.implementationGuide.quickStart.materials.map(material => 
  `- ${material.item} ${material.cost > 0 ? `($${material.cost})` : '(Free)'} ${material.optional ? '(Optional)' : ''}`
).join('\n')}

### Detailed Steps

${enhanced.implementationGuide.detailedSteps.map((step, index) => `
#### Step ${step.stepNumber}: ${step.title}
${step.description}

**Duration:** ${step.duration} | **Difficulty:** ${'⭐'.repeat(step.difficulty)}/5

##### 💡 Pro Tips
${step.proTips.map(tip => `- ${tip}`).join('\n')}

##### ⚠️ Common Mistakes
${step.commonMistakes.map(mistake => `- ${mistake}`).join('\n')}
`).join('\n')}

## Progress Tracking

### Success Metrics
${enhanced.progressTracking.successMetrics.map(metric => `
#### ${metric.metric}
- **How to Measure:** ${metric.measuringMethod}
- **Frequency:** ${metric.frequency}
- **Targets:** Week 1: ${metric.targetValues.week1} | Month 1: ${metric.targetValues.month1} | Month 3: ${metric.targetValues.month3}
`).join('\n')}

### Milestones
${enhanced.progressTracking.milestones.map(milestone => `
- **Day ${milestone.day}:** ${milestone.title} - ${milestone.description}
`).join('\n')}

## Scientific Evidence

### Research Studies
${enhanced.researchBacking.primaryStudies.map(study => `
- **${study.title}** (${study.year})  
  *${study.authors}*  
  Key Finding: ${study.keyFinding}
`).join('\n')}

### Expert Endorsements
${enhanced.researchBacking.expertEndorsements.map(expert => `
> "${expert.quote}"  
> — **${expert.expert}**, ${expert.credentials}
`).join('\n')}

## Personalization

### For Different Personalities
- **Introverts:** ${enhanced.personalizedVariations.byPersonality.introvert}
- **Extroverts:** ${enhanced.personalizedVariations.byPersonality.extrovert}

### For Different Lifestyles
- **Busy Professionals:** ${enhanced.personalizedVariations.byLifestyle.busyProfessional}
- **Students:** ${enhanced.personalizedVariations.byLifestyle.student}
- **Parents:** ${enhanced.personalizedVariations.byLifestyle.parent}
- **Retirees:** ${enhanced.personalizedVariations.byLifestyle.retiree}

## Troubleshooting

${enhanced.troubleshooting.map(issue => `
### Problem: ${issue.problem}

**Possible Causes:**
${issue.causes.map(cause => `- ${cause}`).join('\n')}

**Solutions:**
${issue.solutions.map(solution => `- ${solution}`).join('\n')}

**Prevention:**
${issue.preventionTips.map(tip => `- ${tip}`).join('\n')}
`).join('\n')}

## Related Content

### Complementary Tips
${enhanced.relatedContent.complementaryTips.map(tip => `- ${tip}`).join('\n')}

### Next Level
${enhanced.relatedContent.nextLevelTips.map(tip => `- ${tip}`).join('\n')}

---
*Generated by BDBT - Better Days, Better Tomorrow*  
*Premium Export with AI Enhancement*  
*Export Date: ${new Date().toISOString()}*
`;
  }

  private generateBasicHTML(tip: DatabaseTip): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tip.title} - BDBT</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px; border-radius: 15px; text-align: center; }
        .benefits { display: grid; gap: 20px; margin: 40px 0; }
        .benefit { background: #f8fafc; padding: 30px; border-radius: 12px; border-left: 5px solid #6366f1; }
        .implementation { background: white; padding: 30px; border: 2px solid #e5e7eb; border-radius: 15px; }
        .footer { text-align: center; margin-top: 60px; padding-top: 40px; border-top: 2px solid #e5e7eb; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${tip.title}</h1>
        <p>${tip.subtitle}</p>
        <div>
            <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin: 0 10px;">
                ${tip.category.toUpperCase()}
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin: 0 10px;">
                ${tip.difficulty}
            </span>
        </div>
    </div>

    <div class="benefits">
        <div class="benefit">
            <h3>🎯 Primary Benefit</h3>
            <p>${tip.primary_benefit}</p>
        </div>
        <div class="benefit">
            <h3>💪 Secondary Benefit</h3>
            <p>${tip.secondary_benefit}</p>
        </div>
        <div class="benefit">
            <h3>🚀 Long-term Impact</h3>
            <p>${tip.tertiary_benefit}</p>
        </div>
    </div>

    <div class="implementation">
        <h2>Implementation</h2>
        <p>${tip.description}</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
            <div style="text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <div style="color: #6b7280; font-size: 12px;">TIME REQUIRED</div>
                <div style="font-weight: bold;">${tip.implementation_time}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <div style="color: #6b7280; font-size: 12px;">FREQUENCY</div>
                <div style="font-weight: bold;">${tip.frequency}</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <div style="color: #6b7280; font-size: 12px;">COST</div>
                <div style="font-weight: bold;">${tip.cost}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <h2>BDBT</h2>
        <p>Better Days, Better Tomorrow</p>
        <p><small>Generated on ${new Date().toLocaleDateString()}</small></p>
    </div>
</body>
</html>`;
  }

  private generateEnhancedHTML(tip: DatabaseTip, enhanced: ComprehensiveEnhancedContent): string {
    // This would be a much more comprehensive HTML with all enhanced content
    // For brevity, returning a structured version
    return this.generateBasicHTML(tip).replace(
      '<div class="implementation">',
      `<div class="enhanced-content">
        <h2>Enhanced Content Available</h2>
        <p>This premium export includes ${enhanced.detailedBenefits.length} detailed benefits, 
        ${enhanced.implementationGuide.detailedSteps.length} implementation steps, and comprehensive tracking tools.</p>
      </div>
      <div class="implementation">`
    );
  }

  private generateDocxContent(tip: DatabaseTip, premium: boolean): string {
    return `${tip.title}\n\n${tip.subtitle}\n\nCategory: ${tip.category}\nDifficulty: ${tip.difficulty}\n\n${tip.description}\n\nBenefits:\n- ${tip.primary_benefit}\n- ${tip.secondary_benefit}\n- ${tip.tertiary_benefit}\n\nImplementation: ${tip.implementation_time} | ${tip.frequency} | ${tip.cost}`;
  }

  private convertToRTF(content: string): string {
    return `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
  }

  private getCategoryColors(category: string) {
    const colorSchemes = {
      health: {
        primary: '#22c55e',
        secondary: '#86efac',
        accent: '#15803d',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
      },
      wealth: {
        primary: '#eab308',
        secondary: '#fde047',
        accent: '#a16207',
        gradient: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)'
      },
      happiness: {
        primary: '#a855f7',
        secondary: '#d8b4fe',
        accent: '#7c3aed',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
      }
    };

    return colorSchemes[category as keyof typeof colorSchemes] || colorSchemes.happiness;
  }
}

export const exportService = new ExportService();