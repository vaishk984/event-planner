/**
 * Detailed Error Diagnosis Script
 * Gets full error responses from failing endpoints
 */

const http = require('http');

async function diagnoseEndpoint(path) {
    return new Promise((resolve) => {
        const url = new URL(path, 'http://localhost:3000');

        http.get(url, (res) => {
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
        }).on('error', (error) => {
            resolve({ status: 'ERROR', error: error.message });
        });
    });
}

async function runDiagnosis() {
    console.log('DETAILED ERROR DIAGNOSIS\n');

    const endpoints = [
        '/api/v1/leads',
        '/api/v1/vendors',
        '/api/v1/tasks/overdue',
    ];

    for (const endpoint of endpoints) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Endpoint: ${endpoint}`);
        console.log('='.repeat(60));

        const result = await diagnoseEndpoint(endpoint);
        console.log(`Status: ${result.status}`);
        console.log('Response:');
        console.log(JSON.stringify(result.data, null, 2));
    }
}

runDiagnosis().catch(console.error);
