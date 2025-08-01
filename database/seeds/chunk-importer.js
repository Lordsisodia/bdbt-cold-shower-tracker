import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the seed SQL file
const seedFile = path.join(__dirname, 'bdbt-tips-seed.sql');
const sqlContent = fs.readFileSync(seedFile, 'utf8');

// Split into individual INSERT statements
const statements = sqlContent
    .split('\n')
    .filter(line => line.trim().startsWith('INSERT INTO bdbt_tips'))
    .map(line => {
        // Find the complete INSERT statement (multi-line)
        const startIndex = sqlContent.indexOf(line);
        const endIndex = sqlContent.indexOf(';', startIndex);
        return sqlContent.substring(startIndex, endIndex + 1);
    });

console.log(`Found ${statements.length} tip INSERT statements`);

// Create chunks of 10 tips each
const chunkSize = 10;
const chunks = [];

for (let i = 0; i < statements.length; i += chunkSize) {
    const chunk = statements.slice(i, i + chunkSize);
    chunks.push({
        name: `chunk_${Math.floor(i / chunkSize) + 1}_tips_${i + 1}_to_${Math.min(i + chunkSize, statements.length)}`,
        sql: chunk.join('\n\n')
    });
}

// Write chunks to separate files
chunks.forEach((chunk, index) => {
    const filename = `chunk-${String(index + 1).padStart(3, '0')}.sql`;
    const filepath = path.join(__dirname, 'chunks', filename);
    
    // Create chunks directory if it doesn't exist
    const chunksDir = path.join(__dirname, 'chunks');
    if (!fs.existsSync(chunksDir)) {
        fs.mkdirSync(chunksDir);
    }
    
    fs.writeFileSync(filepath, `-- BDBT Tips Import Chunk ${index + 1}
-- Tips ${(index * chunkSize) + 1} to ${Math.min((index + 1) * chunkSize, statements.length)}

${chunk.sql}
`);
});

console.log(`✅ Created ${chunks.length} chunk files in database/seeds/chunks/`);
console.log(`📁 Each chunk contains up to ${chunkSize} tips`);

// Output chunk information for manual import
console.log('\n📋 Import Order:');
chunks.forEach((chunk, index) => {
    console.log(`${index + 1}. chunk-${String(index + 1).padStart(3, '0')}.sql`);
});

console.log('\n🔧 To import with MCP:');
console.log('Use mcp__supabase__execute_sql with each chunk file content');