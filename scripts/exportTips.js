const { generateTips } = require('./src/data/tipGenerator');
const fs = require('fs');
const path = require('path');

// Generate all tips
const tips = generateTips();

// Create export data structure
const exportData = {
  metadata: {
    totalTips: tips.length,
    generatedAt: new Date().toISOString(),
    categories: {
      health: tips.filter(t => t.category === 'health').length,
      wealth: tips.filter(t => t.category === 'wealth').length,
      happiness: tips.filter(t => t.category === 'happiness').length
    },
    difficulties: {
      easy: tips.filter(t => t.difficulty === 'Easy').length,
      moderate: tips.filter(t => t.difficulty === 'Moderate').length,
      advanced: tips.filter(t => t.difficulty === 'Advanced').length
    }
  },
  tips: tips.map(tip => ({
    id: tip.id,
    category: tip.category,
    difficulty: tip.difficulty,
    title: tip.content.title,
    subtitle: tip.content.subtitle,
    description: tip.content.description,
    benefits: tip.content.benefits,
    whatsIncluded: tip.content.whatsIncluded,
    readTime: tip.content.readTime,
    tags: tip.tags,
    imageUrl: tip.imageUrl
  }))
};

// Write to JSON file
const outputDir = path.join(__dirname, 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'tips-catalogue.json'),
  JSON.stringify(exportData, null, 2)
);

console.log(`✅ Exported ${tips.length} tips to: ${path.join(outputDir, 'tips-catalogue.json')}

Summary:
- Total tips: ${tips.length}
- Health tips: ${exportData.metadata.categories.health}
- Wealth tips: ${exportData.metadata.categories.wealth}
- Happiness tips: ${exportData.metadata.categories.happiness}
- Easy: ${exportData.metadata.difficulties.easy}
- Moderate: ${exportData.metadata.difficulties.moderate}
- Advanced: ${exportData.metadata.difficulties.advanced}
`);