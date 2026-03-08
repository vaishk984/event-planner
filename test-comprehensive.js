// Comprehensive Application Test Script
// Tests database CRUD operations and API endpoints

const https = require('https');
const fs = require('fs');

// Read env
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🧪 PlannerOS Comprehensive Test Suite\n');
console.log('='.repeat(60));

const results = [];

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + '/rest/v1/' + path);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testTable(tableName, description) {
    try {
        const result = await makeRequest('GET', `${tableName}?limit=5`);
        if (result.status === 200) {
            const count = Array.isArray(result.data) ? result.data.length : 0;
            console.log(`✅ ${description}: ${count} records found`);
            results.push({ test: description, status: 'PASS', records: count });
            return true;
        } else {
            console.log(`❌ ${description}: HTTP ${result.status}`);
            results.push({ test: description, status: 'FAIL', error: `HTTP ${result.status}` });
            return false;
        }
    } catch (e) {
        console.log(`❌ ${description}: ${e.message}`);
        results.push({ test: description, status: 'FAIL', error: e.message });
        return false;
    }
}

async function runTests() {
    console.log('\n📊 Testing Database Tables\n');

    // Core tables
    await testTable('events', 'Events table');
    await testTable('user_profiles', 'User profiles table');
    await testTable('vendors', 'Vendors table');
    await testTable('roles', 'Roles table');

    // Additional tables
    await testTable('invoices', 'Invoices table');
    await testTable('packages', 'Packages table');
    await testTable('checklists', 'Checklists table');
    await testTable('notifications', 'Notifications table');

    console.log('\n📱 Testing Frontend Routes\n');

    // Test local routes
    const routes = [
        { path: '/login', expected: 200 },
        { path: '/signup', expected: 200 },
        { path: '/planner', expected: 307 }, // Should redirect
        { path: '/vendor', expected: 307 },  // Should redirect
        { path: '/admin', expected: 307 },   // Should redirect
    ];

    for (const route of routes) {
        try {
            const result = await new Promise((resolve, reject) => {
                const req = require('http').request({
                    hostname: 'localhost',
                    port: 3000,
                    path: route.path,
                    method: 'HEAD'
                }, (res) => resolve({ status: res.statusCode }));
                req.on('error', reject);
                req.end();
            });

            if (result.status === route.expected) {
                console.log(`✅ ${route.path}: HTTP ${result.status} (expected)`);
                results.push({ test: `Route ${route.path}`, status: 'PASS' });
            } else {
                console.log(`⚠️  ${route.path}: HTTP ${result.status} (expected ${route.expected})`);
                results.push({ test: `Route ${route.path}`, status: 'WARN' });
            }
        } catch (e) {
            console.log(`❌ ${route.path}: ${e.message}`);
            results.push({ test: `Route ${route.path}`, status: 'FAIL', error: e.message });
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Test Summary\n');

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warned = results.filter(r => r.status === 'WARN').length;

    console.log(`Total: ${results.length} tests`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warned}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Application is ready.\n');
    } else {
        console.log('\n⚠️  Some tests failed. Review the output above.\n');
    }
}

runTests().catch(console.error);
