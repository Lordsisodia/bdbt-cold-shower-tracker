#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Full tips import script
class FullTipsImporter {
  constructor() {
    this.projectUrl = 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
    this.serviceRoleKey = 'sb_secret_O-_c-mbsICfrzIcXSBW45Q_lisfrQP2';
    this.supabase = createClient(this.projectUrl, this.serviceRoleKey);
    this.batchSize = 10; // Import in batches to avoid overwhelming the API
  }

  async getCurrentTipCount() {
    try {
      const { data, error, count } = await this.supabase
        .from('bdbt_tips')
        .select('id', { count: 'exact', head: true });

      if (error) throw new Error(error.message);
      return count || 0;
    } catch (err) {
      console.error('Error getting tip count:', err.message);
      return 0;
    }
  }

  async importTipsBatch(tips, startIndex) {
    const results = [];
    console.log(`📚 Importing batch ${Math.floor(startIndex / this.batchSize) + 1}: tips ${startIndex + 1}-${startIndex + tips.length}`);

    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      const globalIndex = startIndex + i;

      try {
        const tipData = {
          title: tip.title || `Tip ${globalIndex + 1}`,
          subtitle: tip.subtitle || '',
          category: tip.category || 'health',
          subcategory: tip.subcategory || '',
          difficulty: tip.difficulty || 'Easy',
          description: tip.description || '',
          primary_benefit: tip.primaryBenefit || '',
          secondary_benefit: tip.secondaryBenefit || '',
          tertiary_benefit: tip.tertiaryBenefit || '',
          implementation_time: tip.implementationTime || '',
          frequency: tip.frequency || '',
          cost: tip.cost || 'Free',
          scientific_backing: tip.scientificBacking || false,
          tags: Array.isArray(tip.tags) ? tip.tags : [],
          status: 'published',
          view_count: 0,
          download_count: 0,
          is_featured: false
        };

        const { data, error } = await this.supabase
          .from('bdbt_tips')
          .insert(tipData)
          .select('id');

        if (error) {
          console.error(`❌ Error importing tip ${globalIndex + 1} (${tip.title}):`, error.message);
          results.push({ 
            success: false, 
            index: globalIndex + 1,
            tip: tip.title, 
            error: error.message 
          });
        } else {
          const newId = data[0].id;
          if ((globalIndex + 1) % 50 === 0 || globalIndex < 20) {
            console.log(`✅ Imported tip ${globalIndex + 1}: ${tip.title} (ID: ${newId})`);
          }
          results.push({ 
            success: true, 
            index: globalIndex + 1,
            tip: tip.title, 
            id: newId 
          });
        }

        // Small delay to avoid rate limiting
        if (i % 5 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (err) {
        console.error(`❌ Exception importing tip ${globalIndex + 1}:`, err.message);
        results.push({ 
          success: false, 
          index: globalIndex + 1,
          tip: tip.title, 
          error: err.message 
        });
      }
    }

    return results;
  }

  async importAllTips() {
    try {
      console.log('🚀 Starting full BDBT tips import...');

      // Load tips data
      const tipsDataPath = path.join(__dirname, 'data', 'bdbt-1000-tips.json');
      if (!fs.existsSync(tipsDataPath)) {
        throw new Error('Tips data not found at: ' + tipsDataPath);
      }

      const tipsData = JSON.parse(fs.readFileSync(tipsDataPath, 'utf8'));
      const allTips = tipsData.tips;
      
      console.log(`📊 Found ${allTips.length} tips to import`);

      // Check current count
      const currentCount = await this.getCurrentTipCount();
      console.log(`📈 Current tips in database: ${currentCount}`);

      // Skip already imported tips
      const startFrom = currentCount;
      const tipsToImport = allTips.slice(startFrom);
      
      if (tipsToImport.length === 0) {
        console.log('✅ All tips already imported!');
        return { success: true, message: 'No new tips to import' };
      }

      console.log(`📝 Will import ${tipsToImport.length} new tips (starting from tip ${startFrom + 1})`);

      // Import in batches
      const allResults = [];
      const totalBatches = Math.ceil(tipsToImport.length / this.batchSize);

      for (let i = 0; i < tipsToImport.length; i += this.batchSize) {
        const batch = tipsToImport.slice(i, i + this.batchSize);
        const batchResults = await this.importTipsBatch(batch, startFrom + i);
        allResults.push(...batchResults);

        const currentBatch = Math.floor(i / this.batchSize) + 1;
        const successCount = batchResults.filter(r => r.success).length;
        const errorCount = batchResults.filter(r => !r.success).length;

        console.log(`📊 Batch ${currentBatch}/${totalBatches} complete: ${successCount} success, ${errorCount} errors`);

        // Longer pause between batches
        if (i + this.batchSize < tipsToImport.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Summary
      const totalSuccess = allResults.filter(r => r.success).length;
      const totalErrors = allResults.filter(r => !r.success).length;
      const finalCount = await this.getCurrentTipCount();

      console.log('\n🎉 Import Summary:');
      console.log(`✅ Successfully imported: ${totalSuccess} tips`);
      console.log(`❌ Errors: ${totalErrors} tips`);
      console.log(`📊 Total tips in database: ${finalCount}`);

      if (totalErrors > 0) {
        console.log('\n❌ Tips with errors:');
        allResults.filter(r => !r.success).forEach(r => {
          console.log(`   ${r.index}. ${r.tip}: ${r.error}`);
        });
      }

      return {
        success: true,
        imported: totalSuccess,
        errors: totalErrors,
        totalInDatabase: finalCount,
        results: allResults
      };

    } catch (err) {
      console.error('❌ Import failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Utility function to check for duplicates
  async checkForDuplicates() {
    try {
      const { data, error } = await this.supabase
        .from('bdbt_tips')
        .select('title, count(*)')
        .group('title')
        .having('count(*) > 1');

      if (error) throw new Error(error.message);
      
      return { success: true, duplicates: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Run the import
async function main() {
  const importer = new FullTipsImporter();
  const result = await importer.importAllTips();
  
  if (result.success) {
    console.log('\n🔍 Checking for duplicates...');
    const dupCheck = await importer.checkForDuplicates();
    if (dupCheck.success && dupCheck.duplicates.length > 0) {
      console.log('⚠️  Found duplicates:', dupCheck.duplicates);
    } else {
      console.log('✅ No duplicates found!');
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FullTipsImporter;