#!/usr/bin/env node

/**
 * Security Audit Script for BDBT Application
 * Checks for exposed API keys and security vulnerabilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns that indicate potential security issues
const SECURITY_PATTERNS = [
  // API keys in environment variables (client-side exposure)
  /VITE_.*_API_KEY/g,
  /REACT_APP_.*_API_KEY/g,
  /VITE_.*_SECRET/g,
  /REACT_APP_.*_SECRET/g,
  
  // Direct API key assignments
  /apiKey\s*[:=]\s*['"`][a-zA-Z0-9_-]{20,}['"`]/g,
  /api_key\s*[:=]\s*['"`][a-zA-Z0-9_-]{20,}['"`]/g,
  
  // Common API key prefixes
  /sk_[a-zA-Z0-9_-]{20,}/g,  // Stripe secret keys
  /pk_[a-zA-Z0-9_-]{20,}/g,  // Stripe public keys
  /AIza[a-zA-Z0-9_-]{35}/g,  // Google API keys
  /Bearer\s+[a-zA-Z0-9_-]{20,}/g,  // Bearer tokens
  
  // Database connection strings with credentials
  /postgres:\/\/[^:]+:[^@]+@/g,
  /mysql:\/\/[^:]+:[^@]+@/g,
  
  // Hardcoded secrets (common patterns)
  /password\s*[:=]\s*['"`][^'"`]{8,}['"`]/gi,
  /secret\s*[:=]\s*['"`][^'"`]{8,}['"`]/gi,
];

// File extensions to check
const EXTENSIONS_TO_CHECK = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.env'];

// Directories to skip
const SKIP_DIRECTORIES = ['node_modules', '.git', 'dist', 'build', '.vscode', '.idea'];

function scanDirectory(dirPath) {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.includes(entry.name)) {
          results.push(...scanDirectory(fullPath));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (EXTENSIONS_TO_CHECK.includes(ext) || entry.name.startsWith('.env')) {
          const fileResults = scanFile(fullPath);
          if (fileResults.length > 0) {
            results.push(...fileResults);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return results;
}

function scanFile(filePath) {
  const results = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, lineNum) => {
      SECURITY_PATTERNS.forEach((pattern, patternIndex) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            results.push({
              file: filePath,
              line: lineNum + 1,
              issue: match,
              type: getIssueType(patternIndex),
              severity: getSeverity(patternIndex, filePath),
              recommendation: getRecommendation(patternIndex)
            });
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
  
  return results;
}

function getIssueType(patternIndex) {
  const types = [
    'Client-side API Key', 'Client-side API Key', 'Client-side Secret', 'Client-side Secret',
    'Hardcoded API Key', 'Hardcoded API Key', 'Stripe Secret Key', 'Stripe Public Key',
    'Google API Key', 'Bearer Token', 'Database Credentials', 'Database Credentials',
    'Hardcoded Password', 'Hardcoded Secret'
  ];
  return types[patternIndex] || 'Security Issue';
}

function getSeverity(patternIndex, filePath) {
  // High severity for actual secrets and API keys
  if (patternIndex <= 3 && filePath.includes('src/')) return 'HIGH';
  if (patternIndex >= 4 && patternIndex <= 9) return 'CRITICAL';
  if (patternIndex >= 10 && patternIndex <= 11) return 'CRITICAL';
  if (filePath.includes('.env') && !filePath.includes('.example')) return 'HIGH';
  return 'MEDIUM';
}

function getRecommendation(patternIndex) {
  const recommendations = [
    'Move API key to server-side code or Supabase Edge Functions',
    'Move API key to server-side code or Supabase Edge Functions',
    'Move secret to server-side environment variables',
    'Move secret to server-side environment variables',
    'Store in server-side environment variables only',
    'Store in server-side environment variables only',
    'Store in server-side environment variables only',
    'Public keys are OK, but verify they\'re actually public',
    'Store in server-side environment variables only',
    'Store in server-side environment variables only',
    'Use connection pooling service or environment variables',
    'Use connection pooling service or environment variables',
    'Use secure authentication system',
    'Use secure key management system'
  ];
  return recommendations[patternIndex] || 'Review and secure this credential';
}

// Main execution
console.log('🔍 Starting BDBT Security Audit...\n');

const projectRoot = path.resolve(__dirname, '..');
const issues = scanDirectory(projectRoot);

if (issues.length === 0) {
  console.log('✅ No security issues found!');
} else {
  console.log(`⚠️  Found ${issues.length} potential security issues:\n`);
  
  // Group by severity
  const grouped = issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) acc[issue.severity] = [];
    acc[issue.severity].push(issue);
    return acc;
  }, {});
  
  ['CRITICAL', 'HIGH', 'MEDIUM'].forEach(severity => {
    if (grouped[severity]) {
      console.log(`\n🚨 ${severity} SEVERITY (${grouped[severity].length} issues):`);
      grouped[severity].forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type}`);
        console.log(`   File: ${path.relative(projectRoot, issue.file)}:${issue.line}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Fix: ${issue.recommendation}`);
      });
    }
  });
  
  console.log('\n📋 Summary:');
  console.log(`   Critical: ${grouped.CRITICAL?.length || 0}`);
  console.log(`   High: ${grouped.HIGH?.length || 0}`);
  console.log(`   Medium: ${grouped.MEDIUM?.length || 0}`);
  console.log(`   Total: ${issues.length}`);
  
  console.log('\n💡 Security Best Practices:');
  console.log('   1. Never expose API keys in client-side code (VITE_ or REACT_APP_ variables)');
  console.log('   2. Use Supabase Edge Functions for secure API calls');
  console.log('   3. Store secrets in server-side environment variables only');
  console.log('   4. Use proper authentication and authorization');
  console.log('   5. Implement rate limiting for all API endpoints');
  console.log('   6. Validate and sanitize all user inputs');
  
  process.exit(issues.some(i => i.severity === 'CRITICAL' || i.severity === 'HIGH') ? 1 : 0);
}