// Script to generate MCP commands for importing tips
const fs = require('fs');
const path = require('path');

// Load tips data
const tipsDataPath = path.join(__dirname, 'data', 'bdbt-1000-tips.json');
if (!fs.existsSync(tipsDataPath)) {
    console.error('❌ Tips data not found. Run "node exportAllTips.cjs" first.');
    process.exit(1);
}

const tipsData = JSON.parse(fs.readFileSync(tipsDataPath, 'utf8'));
const tips = tipsData.tips;

console.log('📚 Generating MCP import commands for', tips.length, 'tips\n');

// Project ID for your Supabase
// UPDATE THIS TO YOUR CORRECT PROJECT ID
const projectId = 'fnkdtnmlyxcwrptdbmqy'; // Replace with your actual project ID from Supabase dashboard

// Generate SQL commands file
const commands = [];

// First, let's clear existing test data (optional)
commands.push(`-- Clear existing data (optional)
mcp__supabase__execute_sql project_id="${projectId}" query="DELETE FROM bdbt_tips WHERE id > 1"

`);

// Generate insert commands for each tip
tips.forEach((tip, index) => {
    // Escape single quotes in text fields
    const escape = (str) => str ? str.replace(/'/g, "''") : '';
    
    // Main tip insert
    const tipInsert = `-- Tip ${index + 1}: ${tip.title}
mcp__supabase__execute_sql project_id="${projectId}" query="INSERT INTO bdbt_tips (title, subtitle, category, subcategory, difficulty, description, primary_benefit, secondary_benefit, tertiary_benefit, implementation_time, frequency, cost, scientific_backing, tags, status) VALUES ('${escape(tip.title)}', '${escape(tip.subtitle)}', '${tip.category}', '${escape(tip.subcategory)}', '${tip.difficulty}', '${escape(tip.description)}', '${escape(tip.primaryBenefit)}', '${escape(tip.secondaryBenefit)}', '${escape(tip.tertiaryBenefit)}', '${escape(tip.implementationTime)}', '${escape(tip.frequency)}', '${escape(tip.cost)}', ${tip.scientificBacking || false}, ARRAY[${tip.tags.map(t => `'${escape(t)}'`).join(',')}], 'published')"`;
    
    commands.push(tipInsert);
});

// Add note about remaining tips
if (tips.length > 10) {
    commands.push('\n-- ... (remaining ' + (tips.length - 10) + ' tips follow same pattern)');
}

// Write commands to file
const outputPath = path.join(__dirname, 'mcp-import-commands.txt');
fs.writeFileSync(outputPath, commands.join('\n\n'));

console.log(`✅ Generated MCP commands in: ${outputPath}`);
console.log('\n📋 To import tips:');
console.log('1. Copy commands from the file');
console.log('2. Paste into Claude to execute');
console.log('3. Or run them one by one\n');

// Also create a simpler batch import script
const batchScript = `// Batch import script for BDBT tips
const tips = ${JSON.stringify(tips.slice(0, 5), null, 2)};

// Use this data with MCP commands to import tips
console.log('First 5 tips ready for import');
console.log('Project ID: ${projectId}');
`;

fs.writeFileSync(path.join(__dirname, 'batch-import-sample.js'), batchScript);

// Create a SQL file for direct import
const sqlCommands = [];
tips.forEach((tip, index) => {
    const escape = (str) => str ? str.replace(/'/g, "''") : '';
    
    sqlCommands.push(`-- Tip ${index + 1}: ${tip.title}
INSERT INTO bdbt_tips (
    title, subtitle, category, subcategory, difficulty, 
    description, primary_benefit, secondary_benefit, tertiary_benefit,
    implementation_time, frequency, cost, scientific_backing, tags, status
) VALUES (
    '${escape(tip.title)}',
    '${escape(tip.subtitle)}',
    '${tip.category}',
    '${escape(tip.subcategory)}',
    '${tip.difficulty}',
    '${escape(tip.description)}',
    '${escape(tip.primaryBenefit)}',
    '${escape(tip.secondaryBenefit)}',
    '${escape(tip.tertiaryBenefit)}',
    '${escape(tip.implementationTime)}',
    '${escape(tip.frequency)}',
    '${escape(tip.cost)}',
    ${tip.scientificBacking || false},
    ARRAY[${tip.tags.map(t => `'${escape(t)}'`).join(',')}],
    'published'
);`);
});

// Write SQL file
const sqlPath = path.join(__dirname, 'bdbt-tips-import.sql');
fs.writeFileSync(sqlPath, sqlCommands.join('\n\n'));
console.log(`✅ Generated SQL file: ${sqlPath}`);
console.log('\nYou can also run this SQL directly in Supabase SQL Editor');