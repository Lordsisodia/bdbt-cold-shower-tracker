import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/bdbt-1000-tips.json'), 'utf8'));

// Function to escape single quotes for SQL
function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
}

// Function to format array for PostgreSQL
function formatArray(arr) {
    if (!arr || arr.length === 0) return 'ARRAY[]::TEXT[]';
    return `ARRAY[${arr.map(item => escapeSql(item)).join(', ')}]`;
}

// Start building the SQL file
let sql = `-- BDBT Tips Seed Data
-- Generated from bdbt-1000-tips.json
-- Total tips: ${jsonData.metadata.totalTips}
-- Generated on: ${new Date().toISOString()}

-- Clear existing data (optional - comment out in production)
-- TRUNCATE TABLE bdbt_tip_resources, bdbt_tip_includes, bdbt_tips RESTART IDENTITY CASCADE;

-- Insert tips
`;

// Process each tip
jsonData.tips.forEach((tip, index) => {
    // Main tip insert
    sql += `
-- Tip ${tip.id}: ${tip.title}
INSERT INTO bdbt_tips (
    title, subtitle, category, subcategory, difficulty,
    description, primary_benefit, secondary_benefit, tertiary_benefit,
    implementation_time, frequency, cost, scientific_backing, tags, status
) VALUES (
    ${escapeSql(tip.title)},
    ${escapeSql(tip.subtitle)},
    ${escapeSql(tip.category.toLowerCase())},
    ${escapeSql(tip.subcategory)},
    ${escapeSql(tip.difficulty)},
    ${escapeSql(tip.description)},
    ${escapeSql(tip.primaryBenefit)},
    ${escapeSql(tip.secondaryBenefit)},
    ${escapeSql(tip.tertiaryBenefit)},
    ${escapeSql(tip.implementationTime)},
    ${escapeSql(tip.frequency)},
    ${escapeSql(tip.cost)},
    ${tip.scientificBacking ? 'true' : 'false'},
    ${formatArray(tip.tags)},
    'published'
);

`;

    // Insert includes if they exist
    if (tip.includes && tip.includes.length > 0) {
        sql += `-- Insert includes for tip ${tip.id}
INSERT INTO bdbt_tip_includes (tip_id, item_text, item_order)
VALUES
`;
        const includeValues = tip.includes.map((include, idx) => 
            `    ((SELECT id FROM bdbt_tips WHERE title = ${escapeSql(tip.title)} ORDER BY id DESC LIMIT 1), ${escapeSql(include)}, ${idx + 1})`
        );
        sql += includeValues.join(',\n') + ';\n\n';
    }

    // Insert resources if they exist
    if (tip.resources && tip.resources.length > 0) {
        sql += `-- Insert resources for tip ${tip.id}
INSERT INTO bdbt_tip_resources (tip_id, resource_type, title, url, description, resource_order)
VALUES
`;
        const resourceValues = tip.resources.map((resource, idx) => {
            // Determine resource type
            let resourceType = 'other';
            if (resource.toLowerCase().includes('book')) resourceType = 'book';
            else if (resource.toLowerCase().includes('video') || resource.toLowerCase().includes('youtube')) resourceType = 'video';
            else if (resource.toLowerCase().includes('article')) resourceType = 'article';
            else if (resource.toLowerCase().includes('app')) resourceType = 'app';
            else if (resource.toLowerCase().includes('tool')) resourceType = 'tool';
            else if (resource.toLowerCase().includes('website') || resource.toLowerCase().includes('.com') || resource.toLowerCase().includes('.org')) resourceType = 'website';
            
            return `    ((SELECT id FROM bdbt_tips WHERE title = ${escapeSql(tip.title)} ORDER BY id DESC LIMIT 1), ${escapeSql(resourceType)}, ${escapeSql(resource)}, NULL, NULL, ${idx + 1})`;
        });
        sql += resourceValues.join(',\n') + ';\n\n';
    }
});

// Add summary at the end
sql += `
-- Summary
SELECT 
    'Import completed' as status,
    COUNT(*) as total_tips,
    COUNT(CASE WHEN category = 'health' THEN 1 END) as health_tips,
    COUNT(CASE WHEN category = 'wealth' THEN 1 END) as wealth_tips,
    COUNT(CASE WHEN category = 'happiness' THEN 1 END) as happiness_tips
FROM bdbt_tips;
`;

// Write the SQL file
const outputPath = path.join(__dirname, 'bdbt-tips-seed.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ SQL seed file generated: ${outputPath}`);
console.log(`📊 Total tips processed: ${jsonData.tips.length}`);
console.log(`📁 File size: ${(sql.length / 1024).toFixed(2)} KB`);