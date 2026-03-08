// Database Connection Test Script
// Run with: node test-db-connection.js

const https = require('https');
const fs = require('fs');

// Read .env.local
let envContent = '';
try {
    envContent = fs.readFileSync('.env.local', 'utf8');
} catch (e) {
    console.log('❌ .env.local file not found');
    process.exit(1);
}

// Parse env variables
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Database Connection Test\n');
console.log('='.repeat(50));

// Check if placeholder values
if (supabaseUrl?.includes('placeholder')) {
    console.log('\n⚠️  WARNING: Using placeholder Supabase credentials!\n');
    console.log('Your .env.local contains:');
    console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
    console.log('\n📋 To fix this:');
    console.log('  1. Go to https://supabase.com/dashboard');
    console.log('  2. Create a project (or use existing)');
    console.log('  3. Go to Settings → API');
    console.log('  4. Copy the URL and anon key');
    console.log('  5. Update .env.local with real values\n');
    console.log('='.repeat(50));
    process.exit(0);
}

// Test connection
console.log(`Testing connection to: ${supabaseUrl}`);

const url = new URL(supabaseUrl + '/rest/v1/');
const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'GET',
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
    }
};

const req = https.request(options, (res) => {
    console.log(`\nHTTP Status: ${res.statusCode}`);

    if (res.statusCode === 200) {
        console.log('✅ Supabase connection successful!');
    } else if (res.statusCode === 401) {
        console.log('❌ Authentication failed - check your API key');
    } else {
        console.log('⚠️  Unexpected response');
    }

    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        if (data) {
            try {
                console.log('\nResponse:', JSON.parse(data));
            } catch {
                console.log('\nResponse:', data.substring(0, 200));
            }
        }
    });
});

req.on('error', (e) => {
    console.log(`\n❌ Connection failed: ${e.message}`);
});

req.end();
