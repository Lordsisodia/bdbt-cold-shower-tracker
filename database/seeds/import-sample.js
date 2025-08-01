import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/bdbt-1000-tips.json'), 'utf8'));

// Take first 50 tips as a sample
const sampleTips = jsonData.tips.slice(0, 50);

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

// Generate batch INSERT
console.log('-- Sample BDBT Tips Import (First 50 tips)');
console.log('-- Use with mcp__supabase__execute_sql');
console.log('');

// Break into chunks of 10 for MCP
const chunkSize = 10;
for (let i = 0; i < sampleTips.length; i += chunkSize) {
    const chunk = sampleTips.slice(i, i + chunkSize);
    
    console.log(`-- Chunk ${Math.floor(i / chunkSize) + 1}: Tips ${i + 1}-${Math.min(i + chunkSize, sampleTips.length)}`);
    console.log('INSERT INTO bdbt_tips (');
    console.log('    title, subtitle, category, subcategory, difficulty,');
    console.log('    description, primary_benefit, secondary_benefit, tertiary_benefit,');
    console.log('    implementation_time, frequency, cost, scientific_backing, tags, status');
    console.log(') VALUES');
    
    const values = chunk.map((tip, idx) => {
        return `(${escapeSql(tip.title)}, ${escapeSql(tip.subtitle)}, ${escapeSql(tip.category.toLowerCase())}, ${escapeSql(tip.subcategory)}, ${escapeSql(tip.difficulty)}, ${escapeSql(tip.description)}, ${escapeSql(tip.primaryBenefit)}, ${escapeSql(tip.secondaryBenefit)}, ${escapeSql(tip.tertiaryBenefit)}, ${escapeSql(tip.implementationTime)}, ${escapeSql(tip.frequency)}, ${escapeSql(tip.cost)}, ${tip.scientificBacking ? 'true' : 'false'}, ${formatArray(tip.tags)}, 'published')`;
    });
    
    console.log(values.join(',\n'));
    console.log(';');
    console.log('');
}

console.log('-- Verify import');
console.log('SELECT COUNT(*) as total_tips, category FROM bdbt_tips GROUP BY category;');