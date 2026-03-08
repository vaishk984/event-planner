// Error Monitor - Watches for issues during testing
// Periodically checks the app health and reports any problems

const http = require('http');

const endpoints = [
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/api/health', name: 'API Health' },
];

let checkCount = 0;
const errors = [];

function checkEndpoint(path, name) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                // Check for error patterns in response
                const hasError = /error|exception|failed/i.test(data) &&
                    !/no error/i.test(data);
                const hasServerError = res.statusCode >= 500;

                if (hasServerError) {
                    errors.push({ time: new Date().toISOString(), endpoint: name, error: `HTTP ${res.statusCode}` });
                    console.log(`❌ ${name}: HTTP ${res.statusCode}`);
                } else if (hasError && data.includes('Error:')) {
                    errors.push({ time: new Date().toISOString(), endpoint: name, error: 'Error in response' });
                    console.log(`⚠️  ${name}: Possible error detected`);
                } else {
                    console.log(`✓ ${name}: OK`);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            errors.push({ time: new Date().toISOString(), endpoint: name, error: e.message });
            console.log(`❌ ${name}: ${e.message}`);
            resolve();
        });

        req.on('timeout', () => {
            errors.push({ time: new Date().toISOString(), endpoint: name, error: 'Timeout' });
            console.log(`⏱️  ${name}: Timeout`);
            req.destroy();
            resolve();
        });

        req.end();
    });
}

async function runCheck() {
    checkCount++;
    console.log(`\n📊 Health Check #${checkCount} - ${new Date().toLocaleTimeString()}`);
    console.log('─'.repeat(40));

    for (const endpoint of endpoints) {
        await checkEndpoint(endpoint.path, endpoint.name);
    }

    if (errors.length > 0) {
        console.log(`\n⚠️  Total errors detected: ${errors.length}`);
    }
}

console.log('🔍 Error Monitor Started');
console.log('Watching for issues while you test...\n');
console.log('Press Ctrl+C to stop\n');

// Initial check
runCheck();

// Check every 30 seconds
setInterval(runCheck, 30000);
