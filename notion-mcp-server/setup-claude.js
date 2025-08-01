#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const claudeConfigPath = join(
  process.env.HOME,
  'Library',
  'Application Support',
  'Claude',
  'claude_desktop_config.json'
);

console.log('Setting up Notion MCP Server for Claude...\n');

// Read current config
let config;
try {
  config = JSON.parse(readFileSync(claudeConfigPath, 'utf8'));
} catch (error) {
  console.error('Error reading Claude config:', error.message);
  process.exit(1);
}

// Get Notion API key
const notionKey = process.env.NOTION_API_KEY || process.argv[2];
if (!notionKey) {
  console.error('Please provide your Notion API key:');
  console.error('  npm run setup YOUR_NOTION_API_KEY');
  console.error('  or set NOTION_API_KEY environment variable');
  process.exit(1);
}

// Add our server to the config
const serverPath = join(__dirname, 'server.js');
config.mcpServers = config.mcpServers || {};
config.mcpServers['notion-custom'] = {
  command: 'node',
  args: [serverPath],
  env: {
    NOTION_API_KEY: notionKey
  }
};

// Backup existing config
const backupPath = `${claudeConfigPath}.backup.${Date.now()}`;
writeFileSync(backupPath, readFileSync(claudeConfigPath));
console.log(`Backed up existing config to: ${backupPath}`);

// Write new config
writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2));
console.log(`Updated Claude config at: ${claudeConfigPath}`);

console.log('\nNotion MCP Server has been added to Claude!');
console.log('Please restart Claude for the changes to take effect.');
console.log('\nYour Notion integration must have access to the pages/databases you want to use.');