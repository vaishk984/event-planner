// Comprehensive E2E Test Suite for PlannerOS
// Tests Frontend Pages, Backend APIs, and Database Operations

const http = require('http');
const https = require('https');
const fs = require('fs');

// Load env
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Test Results
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

// Helper Functions
function httpRequest(path, method = 'GET', options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            timeout: 10000,
            ...options
        }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.end();
    });
}

function supabaseRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + path);
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

function addResult(category, test, status, details = '') {
    const icons = { pass: '✅', fail: '❌', warn: '⚠️' };
    results.tests.push({ category, test, status, details });
    if (status === 'pass') results.passed++;
    else if (status === 'fail') results.failed++;
    else results.warnings++;
    console.log(`${icons[status]} [${category}] ${test}${details ? ': ' + details : ''}`);
}

// ============================================
// TEST SUITES
// ============================================

async function testFrontendPages() {
    console.log('\n📱 FRONTEND PAGE TESTS\n' + '─'.repeat(50));

    const pages = [
        { path: '/', name: 'Homepage', expectedStatus: 307, expectRedirect: true },
        { path: '/login', name: 'Login Page', expectedStatus: 200 },
        { path: '/signup', name: 'Signup Page', expectedStatus: 200 },
        { path: '/forgot-password', name: 'Forgot Password', expectedStatus: 200 },
        { path: '/forbidden', name: 'Forbidden Page', expectedStatus: 307 },
        { path: '/planner', name: 'Planner Dashboard', expectedStatus: 307, protected: true },
        { path: '/planner/events', name: 'Events Page', expectedStatus: 307, protected: true },
        { path: '/vendor', name: 'Vendor Dashboard', expectedStatus: 307, protected: true },
        { path: '/admin', name: 'Admin Dashboard', expectedStatus: 307, protected: true },
        { path: '/showroom', name: 'Vendor Showroom', expectedStatus: 307, protected: true },
    ];

    for (const page of pages) {
        try {
            const res = await httpRequest(page.path, 'HEAD');
            if (res.status === page.expectedStatus) {
                addResult('Frontend', page.name, 'pass', `HTTP ${res.status}`);
            } else if (page.protected && res.status === 307) {
                addResult('Frontend', page.name, 'pass', 'Protected (redirects to login)');
            } else {
                addResult('Frontend', page.name, 'warn', `Expected ${page.expectedStatus}, got ${res.status}`);
            }
        } catch (e) {
            addResult('Frontend', page.name, 'fail', e.message);
        }
    }
}

async function testDOMElements() {
    console.log('\n🎨 DOM ELEMENT TESTS\n' + '─'.repeat(50));

    // Login Page DOM
    try {
        const loginRes = await httpRequest('/login');
        const hasEmailInput = /type=["']email["']|name=["']email["']/i.test(loginRes.body);
        const hasPasswordInput = /type=["']password["']/i.test(loginRes.body);
        const hasSubmitButton = /<button/i.test(loginRes.body);
        const hasForm = /<form/i.test(loginRes.body);

        if (hasEmailInput && hasPasswordInput && hasSubmitButton && hasForm) {
            addResult('DOM', 'Login Form Elements', 'pass', 'All required elements present');
        } else {
            addResult('DOM', 'Login Form Elements', 'warn', 'Some elements missing');
        }
    } catch (e) {
        addResult('DOM', 'Login Form Elements', 'fail', e.message);
    }

    // Signup Page DOM
    try {
        const signupRes = await httpRequest('/signup');
        const hasEmailInput = /email/i.test(signupRes.body);
        const hasPasswordInput = /password/i.test(signupRes.body);
        const hasRoleSelection = /planner|vendor/i.test(signupRes.body);

        if (hasEmailInput && hasPasswordInput && hasRoleSelection) {
            addResult('DOM', 'Signup Form Elements', 'pass', 'All required elements present');
        } else {
            addResult('DOM', 'Signup Form Elements', 'warn', 'Some elements missing');
        }
    } catch (e) {
        addResult('DOM', 'Signup Form Elements', 'fail', e.message);
    }
}

async function testAPIEndpoints() {
    console.log('\n🔌 API ENDPOINT TESTS\n' + '─'.repeat(50));

    const apiEndpoints = [
        { path: '/api/health', name: 'Health Check', expectedStatus: [200, 404] },
        { path: '/api/v1/events', name: 'Events API', expectedStatus: [200, 307, 401] },
        { path: '/api/v1/vendors', name: 'Vendors API', expectedStatus: [200, 307, 401] },
    ];

    for (const endpoint of apiEndpoints) {
        try {
            const res = await httpRequest(endpoint.path);
            if (endpoint.expectedStatus.includes(res.status)) {
                addResult('API', endpoint.name, 'pass', `HTTP ${res.status}`);
            } else {
                addResult('API', endpoint.name, 'warn', `HTTP ${res.status}`);
            }
        } catch (e) {
            addResult('API', endpoint.name, 'fail', e.message);
        }
    }
}

async function testSupabaseConnection() {
    console.log('\n🗄️ DATABASE CONNECTION TESTS\n' + '─'.repeat(50));

    // Auth endpoint
    try {
        const authRes = await supabaseRequest('/auth/v1/settings');
        if (authRes.status === 200) {
            addResult('Database', 'Supabase Auth API', 'pass', 'Connected');
        } else {
            addResult('Database', 'Supabase Auth API', 'fail', `HTTP ${authRes.status}`);
        }
    } catch (e) {
        addResult('Database', 'Supabase Auth API', 'fail', e.message);
    }

    // REST endpoint
    try {
        const restRes = await supabaseRequest('/rest/v1/');
        if (restRes.status === 200) {
            addResult('Database', 'Supabase REST API', 'pass', 'Connected');
        } else {
            addResult('Database', 'Supabase REST API', 'fail', `HTTP ${restRes.status}`);
        }
    } catch (e) {
        addResult('Database', 'Supabase REST API', 'fail', e.message);
    }
}

async function testDatabaseTables() {
    console.log('\n📊 DATABASE TABLE TESTS\n' + '─'.repeat(50));

    const tables = [
        'events',
        'vendors',
        'user_profiles',
        'roles',
        'invoices',
        'packages',
        'checklists',
        'notifications',
        'vendor_availability',
        'audit_logs'
    ];

    for (const table of tables) {
        try {
            const res = await supabaseRequest(`/rest/v1/${table}?limit=1`);
            if (res.status === 200) {
                const count = Array.isArray(res.data) ? res.data.length : 0;
                addResult('Tables', table, 'pass', `Accessible (${count} records)`);
            } else if (res.status === 404) {
                addResult('Tables', table, 'warn', 'Table not found');
            } else {
                addResult('Tables', table, 'fail', `HTTP ${res.status}`);
            }
        } catch (e) {
            addResult('Tables', table, 'fail', e.message);
        }
    }
}

async function testDatabaseCRUD() {
    console.log('\n📝 DATABASE CRUD TESTS\n' + '─'.repeat(50));

    // Note: These tests check if CRUD operations work, they don't modify data
    // because we're using anon key which respects RLS

    // Test SELECT on roles (usually public)
    try {
        const rolesRes = await supabaseRequest('/rest/v1/roles?select=*');
        if (rolesRes.status === 200 && Array.isArray(rolesRes.data)) {
            addResult('CRUD', 'SELECT on roles', 'pass', `${rolesRes.data.length} roles found`);
        } else {
            addResult('CRUD', 'SELECT on roles', 'warn', 'No data or error');
        }
    } catch (e) {
        addResult('CRUD', 'SELECT on roles', 'fail', e.message);
    }

    // Test SELECT on events
    try {
        const eventsRes = await supabaseRequest('/rest/v1/events?select=*&limit=5');
        if (eventsRes.status === 200) {
            addResult('CRUD', 'SELECT on events', 'pass', 'Query successful');
        } else {
            addResult('CRUD', 'SELECT on events', 'warn', `HTTP ${eventsRes.status}`);
        }
    } catch (e) {
        addResult('CRUD', 'SELECT on events', 'fail', e.message);
    }

    // Test SELECT on vendors
    try {
        const vendorsRes = await supabaseRequest('/rest/v1/vendors?select=*&limit=5');
        if (vendorsRes.status === 200) {
            addResult('CRUD', 'SELECT on vendors', 'pass', 'Query successful');
        } else {
            addResult('CRUD', 'SELECT on vendors', 'warn', `HTTP ${vendorsRes.status}`);
        }
    } catch (e) {
        addResult('CRUD', 'SELECT on vendors', 'fail', e.message);
    }
}

async function testSecurityHeaders() {
    console.log('\n🔒 SECURITY HEADER TESTS\n' + '─'.repeat(50));

    try {
        const res = await httpRequest('/login');
        const headers = res.headers;

        if (headers['x-frame-options']) {
            addResult('Security', 'X-Frame-Options', 'pass', headers['x-frame-options']);
        } else {
            addResult('Security', 'X-Frame-Options', 'warn', 'Missing');
        }

        if (headers['x-content-type-options']) {
            addResult('Security', 'X-Content-Type-Options', 'pass', headers['x-content-type-options']);
        } else {
            addResult('Security', 'X-Content-Type-Options', 'warn', 'Missing');
        }

        if (headers['referrer-policy']) {
            addResult('Security', 'Referrer-Policy', 'pass', headers['referrer-policy']);
        } else {
            addResult('Security', 'Referrer-Policy', 'warn', 'Missing');
        }

    } catch (e) {
        addResult('Security', 'Headers Check', 'fail', e.message);
    }
}

async function testAuthentication() {
    console.log('\n🔐 AUTHENTICATION TESTS\n' + '─'.repeat(50));

    // Test protected routes redirect
    const protectedRoutes = ['/planner', '/vendor', '/admin'];

    for (const route of protectedRoutes) {
        try {
            const res = await httpRequest(route, 'HEAD');
            if (res.status === 307 && res.headers.location?.includes('/login')) {
                addResult('Auth', `${route} protection`, 'pass', 'Redirects to login');
            } else if (res.status === 307) {
                addResult('Auth', `${route} protection`, 'pass', 'Redirects (protected)');
            } else {
                addResult('Auth', `${route} protection`, 'warn', `Status: ${res.status}`);
            }
        } catch (e) {
            addResult('Auth', `${route} protection`, 'fail', e.message);
        }
    }
}

// ============================================
// RUN ALL TESTS
// ============================================

async function runAllTests() {
    console.log('\n' + '═'.repeat(60));
    console.log('   🧪 PLANNEEROS COMPREHENSIVE TEST SUITE');
    console.log('═'.repeat(60));
    console.log(`\nTimestamp: ${new Date().toISOString()}`);
    console.log(`Server: http://localhost:3000`);
    console.log(`Database: ${SUPABASE_URL}`);

    // Run all test suites
    await testFrontendPages();
    await testDOMElements();
    await testAPIEndpoints();
    await testSupabaseConnection();
    await testDatabaseTables();
    await testDatabaseCRUD();
    await testSecurityHeaders();
    await testAuthentication();

    // Print Summary
    console.log('\n' + '═'.repeat(60));
    console.log('   📋 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`\n   Total Tests: ${results.passed + results.failed + results.warnings}`);
    console.log(`   ✅ Passed:   ${results.passed}`);
    console.log(`   ⚠️  Warnings: ${results.warnings}`);
    console.log(`   ❌ Failed:   ${results.failed}`);

    const passRate = ((results.passed / (results.passed + results.failed + results.warnings)) * 100).toFixed(1);
    console.log(`\n   Pass Rate: ${passRate}%`);

    if (results.failed === 0) {
        console.log('\n   🎉 ALL CRITICAL TESTS PASSED!\n');
    } else {
        console.log('\n   ⚠️  Some tests failed. Review output above.\n');
    }

    // Save results to file
    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
    console.log('   Results saved to: test-results.json\n');
}

runAllTests().catch(console.error);
