/**
 * Dynamic PDF Service
 * Loads PDF generation libraries on-demand to reduce initial bundle size
 */

import { Tip } from '../types/tip';
import { GrokEnhancedTip } from './grokApiService';
import { DatabaseTip } from './tipsDatabaseService';

class DynamicPdfService {
  private pdfGeneratorCache: any = null;
  private enhancedPdfGeneratorCache: any = null;
  private improvedPdfGeneratorCache: any = null;

  /**
   * Dynamically load the standard PDF generator
   */
  private async loadPdfGenerator() {
    if (!this.pdfGeneratorCache) {
      const module = await import('./pdfGenerator');
      this.pdfGeneratorCache = module.PDFGenerator;
    }
    return this.pdfGeneratorCache;
  }

  /**
   * Dynamically load the enhanced PDF generator
   */
  private async loadEnhancedPdfGenerator() {
    if (!this.enhancedPdfGeneratorCache) {
      const module = await import('./enhancedPdfGenerator');
      this.enhancedPdfGeneratorCache = module.EnhancedPDFGenerator;
    }
    return this.enhancedPdfGeneratorCache;
  }

  /**
   * Dynamically load the improved PDF generator
   */
  private async loadImprovedPdfGenerator() {
    if (!this.improvedPdfGeneratorCache) {
      const module = await import('./improvedPdfGenerator');
      this.improvedPdfGeneratorCache = module.ImprovedPDFGenerator;
    }
    return this.improvedPdfGeneratorCache;
  }

  /**
   * Generate a standard PDF for a tip
   */
  async generateTipPDF(tip: Tip): Promise<Blob> {
    const PDFGenerator = await this.loadPdfGenerator();
    const generator = new PDFGenerator();
    return generator.generateTipPDF(tip);
  }

  /**
   * Generate an enhanced PDF for a Grok-enhanced tip
   */
  async generateEnhancedTipPDF(enhancedTip: GrokEnhancedTip, originalTip: DatabaseTip): Promise<Blob> {
    const EnhancedPDFGenerator = await this.loadEnhancedPdfGenerator();
    const generator = new EnhancedPDFGenerator();
    return generator.generateEnhancedTipPDF(enhancedTip, originalTip);
  }

  /**
   * Generate an improved PDF with better layout
   */
  async generateImprovedTipPDF(tip: DatabaseTip): Promise<Blob> {
    const ImprovedPDFGenerator = await this.loadImprovedPdfGenerator();
    const generator = new ImprovedPDFGenerator();
    return generator.generateTipPDF(tip);
  }

  /**
   * Generate batch PDFs with progress tracking
   */
  async generateBatchPDFs(
    tips: DatabaseTip[], 
    type: 'standard' | 'enhanced' | 'improved' = 'improved',
    onProgress?: (completed: number, total: number) => void
  ): Promise<Blob[]> {
    const results: Blob[] = [];
    
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      
      try {
        let pdfBlob: Blob;
        
        switch (type) {
          case 'enhanced':
            // For enhanced, we'd need to enhance the tip first
            // This is a placeholder - you'd implement the enhancement logic
            pdfBlob = await this.generateImprovedTipPDF(tip);
            break;
          case 'improved':
            pdfBlob = await this.generateImprovedTipPDF(tip);
            break;
          default:
            // Convert DatabaseTip to Tip format for standard generator
            const standardTip: Tip = {
              id: tip.id.toString(),
              title: tip.title,
              category: tip.category,
              difficulty: tip.difficulty as 'Easy' | 'Moderate' | 'Advanced',
              content: {
                description: tip.description,
                benefits: [tip.primary_benefit, tip.secondary_benefit, tip.tertiary_benefit].filter(Boolean),
                instructions: [tip.main_instruction, tip.secondary_instruction, tip.tertiary_instruction].filter(Boolean),
                resources: []
              }
            };
            pdfBlob = await this.generateTipPDF(standardTip);
        }
        
        results.push(pdfBlob);
        
        if (onProgress) {
          onProgress(i + 1, tips.length);
        }
      } catch (error) {
        console.error(`Error generating PDF for tip ${tip.id}:`, error);
        // Continue with other PDFs even if one fails
      }
    }
    
    return results;
  }

  /**
   * Create a ZIP file with multiple PDFs
   */
  async createPdfZip(tips: DatabaseTip[], type: 'standard' | 'enhanced' | 'improved' = 'improved'): Promise<Blob> {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    const pdfBlobs = await this.generateBatchPDFs(tips, type);
    
    pdfBlobs.forEach((pdfBlob, index) => {
      const tip = tips[index];
      const filename = `${tip.category}-${tip.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      zip.file(filename, pdfBlob);
    });
    
    return await zip.generateAsync({ type: 'blob' });
  }
}

// Export singleton instance
export const dynamicPdfService = new DynamicPdfService();
export default dynamicPdfService;