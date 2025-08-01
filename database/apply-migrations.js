import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ID = 'fnkdtnmlyxcwrptdbmqy'; // From .env file
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SEEDS_DIR = path.join(__dirname, 'seeds');

console.log('🚀 BDBT Database Setup');
console.log('======================');
console.log(`Project ID: ${PROJECT_ID}`);
console.log('');

// Instructions for manual application
console.log('📋 Instructions:');
console.log('1. Use Claude Code with MCP Supabase to apply these migrations');
console.log('2. Run migrations in order:');
console.log('   - 001_initial_schema.sql');
console.log('   - 002_row_level_security.sql');
console.log('   - 003_views.sql');
console.log('3. Then run the seed data:');
console.log('   - bdbt-tips-seed.sql');
console.log('');

// List migration files
console.log('📁 Migration files:');
const migrations = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

migrations.forEach(file => {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const stats = fs.statSync(filePath);
    console.log(`   ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
});

console.log('');
console.log('📁 Seed files:');
const seeds = fs.readdirSync(SEEDS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

seeds.forEach(file => {
    const filePath = path.join(SEEDS_DIR, file);
    const stats = fs.statSync(filePath);
    console.log(`   ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
});

console.log('');
console.log('🔧 To apply with MCP:');
console.log('1. mcp__supabase__apply_migration with each migration file');
console.log('2. mcp__supabase__execute_sql with seed data in chunks');
console.log('');
console.log('✅ Database files ready for import!');