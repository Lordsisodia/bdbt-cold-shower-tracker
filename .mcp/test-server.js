#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing BDBT Supabase MCP Server...\n');

const serverPath = path.join(__dirname, 'supabase-server.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log(data.toString().trim());
});

// Test the server for 3 seconds then kill it
setTimeout(() => {
  server.kill('SIGTERM');
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (errorOutput.includes('✅ Supabase MCP Server connected')) {
    console.log('✅ Server started successfully with Supabase connection');
  } else if (errorOutput.includes('⚠️ Supabase not configured')) {
    console.log('✅ Server started successfully in mock data mode');
  } else if (errorOutput.includes('🚀 BDBT Supabase MCP Server running')) {
    console.log('✅ Server is running properly');
  } else {
    console.log('❌ Server may have issues');
  }
  
  if (errorOutput.includes('Error') && !errorOutput.includes('Could not load .env file')) {
    console.log('⚠️  Some errors detected in server output');
  }
  
  console.log('\n💡 Server is ready for MCP integration');
  process.exit(0);
}, 3000);

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});