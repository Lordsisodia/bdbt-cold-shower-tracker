const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please add:');
  console.log('SUPABASE_URL=your_project_url');
  console.log('SUPABASE_SERVICE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importTips() {
  console.log('📚 Starting BDBT Tips Import to Supabase...\n');

  // Load tips from JSON
  const tipsDataPath = path.join(__dirname, 'data', 'bdbt-1000-tips.json');
  
  if (!fs.existsSync(tipsDataPath)) {
    console.error('❌ Tips data not found. Run "node exportAllTips.cjs" first.');
    process.exit(1);
  }

  const tipsData = JSON.parse(fs.readFileSync(tipsDataPath, 'utf8'));
  const tips = tipsData.tips;

  console.log(`📊 Found ${tips.length} tips to import\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process tips in batches
  const batchSize = 10;
  for (let i = 0; i < tips.length; i += batchSize) {
    const batch = tips.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tips.length/batchSize)}...`);

    for (const tip of batch) {
      try {
        // Insert main tip
        const { data: insertedTip, error: tipError } = await supabase
          .from('tips')
          .insert({
            title: tip.title,
            subtitle: tip.subtitle,
            category: tip.category,
            subcategory: tip.subcategory,
            difficulty: tip.difficulty,
            description: tip.description,
            primary_benefit: tip.primaryBenefit,
            secondary_benefit: tip.secondaryBenefit,
            tertiary_benefit: tip.tertiaryBenefit,
            implementation_time: tip.implementationTime,
            frequency: tip.frequency,
            cost: tip.cost,
            scientific_backing: tip.scientificBacking || false,
            tags: tip.tags,
            status: 'published'
          })
          .select()
          .single();

        if (tipError) throw tipError;

        // Insert what's included items
        if (tip.whatsIncluded && tip.whatsIncluded.length > 0) {
          const includes = tip.whatsIncluded.map((item, index) => ({
            tip_id: insertedTip.id,
            item: item,
            order_index: index
          }));

          const { error: includesError } = await supabase
            .from('tip_includes')
            .insert(includes);

          if (includesError) throw includesError;
        }

        // Insert sample resources (you can expand this)
        const sampleResources = getSampleResources(tip);
        if (sampleResources.length > 0) {
          const resources = sampleResources.map(resource => ({
            tip_id: insertedTip.id,
            ...resource
          }));

          const { error: resourcesError } = await supabase
            .from('tip_resources')
            .insert(resources);

          if (resourcesError) console.warn(`Resource insert warning for tip ${insertedTip.id}:`, resourcesError);
        }

        successCount++;
        process.stdout.write(`✅`);
      } catch (error) {
        errorCount++;
        errors.push({ tip: tip.title, error: error.message });
        process.stdout.write(`❌`);
      }
    }
    console.log(''); // New line after batch
  }

  // Print summary
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} tips`);
  console.log(`❌ Failed: ${errorCount} tips`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.slice(0, 5).forEach(err => {
      console.log(`- ${err.tip}: ${err.error}`);
    });
    if (errors.length > 5) {
      console.log(`... and ${errors.length - 5} more errors`);
    }
  }

  // Verify import
  const { count } = await supabase
    .from('tips')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Total tips in database: ${count}`);
}

// Helper function to generate sample resources based on tip category
function getSampleResources(tip) {
  const resources = [];

  // Add books based on category
  if (tip.category === 'health') {
    resources.push({
      resource_type: 'book',
      title: 'Atomic Habits by James Clear',
      description: 'The definitive guide to building good habits and breaking bad ones',
      is_free: false,
      author: 'James Clear',
      url: 'https://www.amazon.com/Atomic-Habits-James-Clear/dp/0735211299'
    });
  } else if (tip.category === 'wealth') {
    resources.push({
      resource_type: 'book',
      title: 'The Psychology of Money by Morgan Housel',
      description: 'Timeless lessons on wealth, greed, and happiness',
      is_free: false,
      author: 'Morgan Housel',
      url: 'https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681'
    });
  } else if (tip.category === 'happiness') {
    resources.push({
      resource_type: 'book',
      title: 'The Happiness Hypothesis by Jonathan Haidt',
      description: 'Finding modern truth in ancient wisdom',
      is_free: false,
      author: 'Jonathan Haidt',
      url: 'https://www.amazon.com/Happiness-Hypothesis-Finding-Modern-Ancient/dp/0465028020'
    });
  }

  // Add a free resource
  resources.push({
    resource_type: 'website',
    title: 'BDBT Resource Center',
    description: 'Free guides and tools for implementing this tip',
    is_free: true,
    url: 'https://bdbt.com/resources',
    platform: 'BDBT'
  });

  // Add a tool/app if applicable
  if (tip.subcategory === 'meditation' || tip.subcategory === 'mindfulness') {
    resources.push({
      resource_type: 'app',
      title: 'Headspace',
      description: 'Guided meditation and mindfulness app',
      is_free: false,
      platform: 'iOS/Android',
      url: 'https://www.headspace.com'
    });
  }

  return resources.slice(0, 3); // Limit to 3 resources per tip
}

// Run import
importTips().catch(console.error);