import * as fs from 'fs';
import * as path from 'path';
import { generateCompleteTipDatabase } from '../data/realTipsCollection';
import { canvaService } from '../services/canvaIntegration';
import { tipsDatabaseService } from '../services/tipsDatabaseService';

// Command line interface for managing tips
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'export-json':
      await exportTipsToJSON();
      break;
    case 'export-csv':
      await exportTipsToCSV();
      break;
    case 'import-db':
      await importTipsToDatabase();
      break;
    case 'generate-canva':
      await generateCanvaDesigns();
      break;
    case 'stats':
      await showTipsStatistics();
      break;
    default:
      console.log(`
BDBT Tips Management CLI

Commands:
  export-json     - Export all tips to JSON file
  export-csv      - Export all tips to CSV file
  import-db       - Import all tips to Supabase database
  generate-canva  - Generate Canva designs for tips
  stats           - Show tips statistics

Usage: npm run manage-tips [command]
      `);
  }
}

// Export tips to JSON
async function exportTipsToJSON() {
  console.log('Exporting tips to JSON...');
  
  const tips = generateCompleteTipDatabase();
  const exportData = {
    metadata: {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalTips: tips.length,
      categories: {
        health: tips.filter(t => t.category === 'health').length,
        wealth: tips.filter(t => t.category === 'wealth').length,
        happiness: tips.filter(t => t.category === 'happiness').length
      }
    },
    tips: tips
  };

  const outputPath = path.join(__dirname, '../../data/tips-database.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  
  console.log(`✅ Exported ${tips.length} tips to ${outputPath}`);
}

// Export tips to CSV
async function exportTipsToCSV() {
  console.log('Exporting tips to CSV...');
  
  const tips = generateCompleteTipDatabase();
  
  // CSV headers
  const headers = [
    'Title',
    'Subtitle',
    'Category',
    'Subcategory',
    'Difficulty',
    'Description',
    'Primary Benefit',
    'Secondary Benefit',
    'Tertiary Benefit',
    'Implementation Time',
    'Frequency',
    'Cost',
    'Scientific Backing',
    'Tags',
    'What\'s Included (1)',
    'What\'s Included (2)',
    'What\'s Included (3)',
    'What\'s Included (4)',
    'What\'s Included (5)'
  ];

  const csvRows = [headers.join(',')];

  tips.forEach(tip => {
    const row = [
      `"${tip.title.replace(/"/g, '""')}"`,
      `"${tip.subtitle.replace(/"/g, '""')}"`,
      tip.category,
      tip.subcategory,
      tip.difficulty,
      `"${tip.description.replace(/"/g, '""')}"`,
      `"${tip.benefits.primary.replace(/"/g, '""')}"`,
      `"${tip.benefits.secondary.replace(/"/g, '""')}"`,
      `"${tip.benefits.tertiary.replace(/"/g, '""')}"`,
      tip.implementation.time,
      tip.implementation.frequency,
      tip.implementation.cost,
      tip.scientificBacking ? 'Yes' : 'No',
      `"${tip.tags.join(', ')}"`,
      tip.whatsIncluded[0] ? `"${tip.whatsIncluded[0].replace(/"/g, '""')}"` : '',
      tip.whatsIncluded[1] ? `"${tip.whatsIncluded[1].replace(/"/g, '""')}"` : '',
      tip.whatsIncluded[2] ? `"${tip.whatsIncluded[2].replace(/"/g, '""')}"` : '',
      tip.whatsIncluded[3] ? `"${tip.whatsIncluded[3].replace(/"/g, '""')}"` : '',
      tip.whatsIncluded[4] ? `"${tip.whatsIncluded[4].replace(/"/g, '""')}"` : ''
    ];
    csvRows.push(row.join(','));
  });

  const outputPath = path.join(__dirname, '../../data/tips-database.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'));
  
  console.log(`✅ Exported ${tips.length} tips to ${outputPath}`);
}

// Import tips to Supabase database
async function importTipsToDatabase() {
  console.log('Importing tips to database...');
  console.log('⚠️  Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env');
  
  try {
    const result = await tipsDatabaseService.importAllTips();
    
    if (result.success) {
      console.log(`✅ Successfully imported ${result.count} tips to database`);
    } else {
      console.error('❌ Import completed with errors:');
      result.errors.forEach(err => console.error(err));
      console.log(`✅ Successfully imported ${result.count} tips despite errors`);
    }
  } catch (error) {
    console.error('❌ Failed to import tips:', error);
  }
}

// Generate Canva designs
async function generateCanvaDesigns() {
  console.log('Generating Canva designs...');
  console.log('⚠️  This is a mock implementation. Actual Canva API integration requires partnership approval.');
  
  const tips = generateCompleteTipDatabase().slice(0, 10); // First 10 tips for demo
  const branding = canvaService.getBrandingData();
  
  const designs = [];
  
  for (const tip of tips) {
    const designData = {
      tipId: tips.indexOf(tip) + 1,
      title: tip.title,
      subtitle: tip.subtitle,
      category: tip.category,
      benefits: [
        tip.benefits.primary,
        tip.benefits.secondary,
        tip.benefits.tertiary
      ],
      whatsIncluded: tip.whatsIncluded,
      colors: getColorsByCategory(tip.category),
      branding
    };
    
    try {
      const design = await canvaService.createDesignFromTip(designData);
      designs.push({
        tip: tip.title,
        ...design
      });
      console.log(`✅ Created design for: ${tip.title}`);
    } catch (error) {
      console.error(`❌ Failed to create design for ${tip.title}:`, error);
    }
  }
  
  const outputPath = path.join(__dirname, '../../data/canva-designs.json');
  fs.writeFileSync(outputPath, JSON.stringify(designs, null, 2));
  
  console.log(`\n✅ Generated ${designs.length} Canva designs`);
  console.log(`📄 Design links saved to ${outputPath}`);
}

// Show tips statistics
async function showTipsStatistics() {
  const tips = generateCompleteTipDatabase();
  
  console.log('\n📊 BDBT Tips Database Statistics\n');
  console.log(`Total Tips: ${tips.length}`);
  console.log('\nBy Category:');
  console.log(`  Health:    ${tips.filter(t => t.category === 'health').length}`);
  console.log(`  Wealth:    ${tips.filter(t => t.category === 'wealth').length}`);
  console.log(`  Happiness: ${tips.filter(t => t.category === 'happiness').length}`);
  
  console.log('\nBy Difficulty:');
  console.log(`  Easy:      ${tips.filter(t => t.difficulty === 'Easy').length}`);
  console.log(`  Moderate:  ${tips.filter(t => t.difficulty === 'Moderate').length}`);
  console.log(`  Advanced:  ${tips.filter(t => t.difficulty === 'Advanced').length}`);
  
  console.log('\nBy Subcategory:');
  const subcategories = new Map<string, number>();
  tips.forEach(tip => {
    const key = `${tip.category} - ${tip.subcategory}`;
    subcategories.set(key, (subcategories.get(key) || 0) + 1);
  });
  
  Array.from(subcategories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([subcat, count]) => {
      console.log(`  ${subcat}: ${count}`);
    });
  
  console.log('\nScientific Backing:');
  const scientificCount = tips.filter(t => t.scientificBacking).length;
  console.log(`  With scientific backing: ${scientificCount} (${(scientificCount / tips.length * 100).toFixed(1)}%)`);
  console.log(`  Without scientific backing: ${tips.length - scientificCount} (${((tips.length - scientificCount) / tips.length * 100).toFixed(1)}%)`);
  
  console.log('\nImplementation Time Distribution:');
  const timeGroups = new Map<string, number>();
  tips.forEach(tip => {
    timeGroups.set(tip.implementation.time, (timeGroups.get(tip.implementation.time) || 0) + 1);
  });
  
  Array.from(timeGroups.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([time, count]) => {
      console.log(`  ${time}: ${count}`);
    });
}

// Helper function to get colors by category
function getColorsByCategory(category: string) {
  const colors = {
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
      gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)'
    },
    happiness: {
      primary: '#a855f7',
      secondary: '#d8b4fe',
      accent: '#7c3aed',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
    }
  };
  return colors[category as keyof typeof colors] || colors.health;
}

// Run the main function
main().catch(console.error);