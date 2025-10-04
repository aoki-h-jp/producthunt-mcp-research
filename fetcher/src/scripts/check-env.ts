#!/usr/bin/env node
import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

const ENV_FILE_PATH = resolve(process.cwd(), '../.env');

// Check if .env file exists
if (!existsSync(ENV_FILE_PATH)) {
  console.error('\n❌ Error: Environment file not found\n');
  console.error('📝 Please create a .env file in the project root directory.');
  console.error('   You can copy .env.example as a starting point:\n');
  console.error('   $ cp .env.example .env\n');
  console.error('🔑 Then, set your ProductHunt API token:');
  console.error('   PH_API_TOKEN=your_developer_token_here\n');
  console.error('📖 Get your token from: https://api.producthunt.com/v2/oauth/applications\n');
  process.exit(1);
}

// Load environment variables
config({ path: ENV_FILE_PATH });

// Check if required environment variable is set
if (!process.env.PH_API_TOKEN || process.env.PH_API_TOKEN === 'your_developer_token_here') {
  console.error('\n❌ Error: PH_API_TOKEN is not configured\n');
  console.error('🔑 Please set your ProductHunt API token in the .env file:');
  console.error('   PH_API_TOKEN=your_actual_token_here\n');
  console.error('📖 Get your token from: https://api.producthunt.com/v2/oauth/applications\n');
  console.error('⚠️  Make sure to replace "your_developer_token_here" with your actual API token!\n');
  process.exit(1);
}

console.log('✅ Environment variables are properly configured');
console.log('🔑 Using API token: ' + process.env.PH_API_TOKEN.substring(0, 10) + '...');
