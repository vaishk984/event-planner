// DOM Element Test Script
// Fetches pages and analyzes DOM structure

const http = require('http');

function fetchPage(path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.end();
    });
}

function analyzeDOM(html, pageName) {
    console.log(`\n📄 ${pageName}\n${'─'.repeat(40)}`);

    // Count elements
    const inputMatches = html.match(/<input/gi) || [];
    const buttonMatches = html.match(/<button/gi) || [];
    const formMatches = html.match(/<form/gi) || [];
    const linkMatches = html.match(/<a /gi) || [];

    console.log(`   Inputs: ${inputMatches.length}`);
    console.log(`   Buttons: ${buttonMatches.length}`);
    console.log(`   Forms: ${formMatches.length}`);
    console.log(`   Links: ${linkMatches.length}`);

    // Check for specific elements
    const hasEmail = /email|Email/i.test(html);
    const hasPassword = /password|Password/i.test(html);
    const hasSignup = /sign.?up|create.?account|register/i.test(html);
    const hasLogin = /log.?in|sign.?in/i.test(html);
    const hasRole = /role|planner|vendor/i.test(html);

    console.log(`\n   Features:`);
    if (hasEmail) console.log(`   ✓ Email field`);
    if (hasPassword) console.log(`   ✓ Password field`);
    if (hasLogin) console.log(`   ✓ Login option`);
    if (hasSignup) console.log(`   ✓ Signup option`);
    if (hasRole) console.log(`   ✓ Role selection`);

    return {
        inputs: inputMatches.length,
        buttons: buttonMatches.length,
        forms: formMatches.length,
        hasEmail, hasPassword, hasLogin, hasSignup, hasRole
    };
}

async function runTests() {
    console.log('\n🔍 DOM Element Analysis\n');
    console.log('='.repeat(50));

    try {
        // Test Login Page
        const loginHtml = await fetchPage('/login');
        const loginResult = analyzeDOM(loginHtml, 'Login Page (/login)');

        // Test Signup Page
        const signupHtml = await fetchPage('/signup');
        const signupResult = analyzeDOM(signupHtml, 'Signup Page (/signup)');

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('\n✅ DOM Analysis Complete\n');

        const allGood = loginResult.hasEmail && loginResult.hasPassword &&
            signupResult.hasEmail && signupResult.hasPassword;

        if (allGood) {
            console.log('🎉 All essential form elements found!');
        }

    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

runTests();
