import fs from 'fs';
import { execSync } from 'child_process';

// Get API Key from .env securely
const envFile = fs.readFileSync('.env', 'utf-8');
const keyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
const apiKey = keyLine ? keyLine.split('=')[1].trim() : '';

if (!apiKey) {
    console.error("API Error: No GEMINI_API_KEY found in .env");
    process.exit(1);
}

try {
    console.log("🚀 Starting Vercel deployment...");
    // 1. Initial Link to skip prompts locally
    execSync('npx vercel link --yes', { stdio: 'inherit' });

    // 2. Production Deploy with Environment Variable injected
    console.log("🚢 Pushing to Production Server...");
    execSync(`npx vercel --prod --yes --env GEMINI_API_KEY="${apiKey}"`, { stdio: 'inherit' });

    console.log("✅ Deployment Success!");
} catch (err) {
    console.error("❌ Deployment failed:", err.message);
    process.exit(1);
}
