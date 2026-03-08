/**
 * Comprehensive API Test Script
 * Tests all endpoints to ensure they work correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const results = [];

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function test(name, path, expectedStatus = 200) {
    try {
        console.log(`Testing: ${name}...`);
        const result = await makeRequest(path);
        const pass = result.status === expectedStatus;
        const status = pass ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${status} - Status: ${result.status}`);

        results.push({
            name,
            path,
            status: result.status,
            expectedStatus,
            pass,
            response: result.data
        });

        return result;
    } catch (error) {
        console.log(`  ❌ ERROR - ${error.message}`);
        results.push({
            name,
            path,
            status: 'ERROR',
            expectedStatus,
            pass: false,
            error: error.message
        });
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('PLANNER-OS API COMPREHENSIVE TESTING');
    console.log('='.repeat(60));
    console.log('');

    // Health Check
    console.log('--- HEALTH CHECK ---');
    await test('Health Endpoint', '/api/v1/health');
    console.log('');

    // Events API
    console.log('--- EVENTS API ---');
    await test('List Events', '/api/v1/events');
    await test('Event Stats', '/api/v1/events/stats');
    await test('Upcoming Events', '/api/v1/events/upcoming');
    console.log('');

    // Leads API
    console.log('--- LEADS API ---');
    await test('List Leads', '/api/v1/leads');
    await test('Hot Leads', '/api/v1/leads/hot');
    console.log('');

    // Vendors API
    console.log('--- VENDORS API ---');
    await test('List Vendors', '/api/v1/vendors');
    await test('Verified Vendors', '/api/v1/vendors/verified');
    console.log('');

    // Tasks API
    console.log('--- TASKS API ---');
    await test('List Tasks', '/api/v1/tasks');
    await test('Overdue Tasks', '/api/v1/tasks/overdue');
    console.log('');

    // Timeline API
    console.log('--- TIMELINE API ---');
    await test('Timeline Templates', '/api/v1/timeline/templates');
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
    console.log('');

    if (failed > 0) {
        console.log('FAILED TESTS:');
        results.filter(r => !r.pass).forEach(r => {
            console.log(`  - ${r.name} (${r.path})`);
            console.log(`    Expected: ${r.expectedStatus}, Got: ${r.status}`);
            if (r.error) console.log(`    Error: ${r.error}`);
        });
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
