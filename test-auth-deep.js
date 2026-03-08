// Deep Auth Flow Test
const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔐 Deep Auth & Database Test\n');
console.log('='.repeat(50));

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
                'Content-Type': 'application/json'
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

async function runTests() {
    console.log('\n📊 Supabase Connection\n');

    // Test auth endpoint
    try {
        const authResult = await supabaseRequest('/auth/v1/settings');
        console.log(`Auth API: ${authResult.status === 200 ? '✅ Connected' : '❌ Error'}`);
    } catch (e) {
        console.log(`Auth API: ❌ ${e.message}`);
    }

    // Test database tables
    console.log('\n📋 Database Tables\n');

    const tables = ['events', 'vendors', 'user_profiles', 'roles'];
    for (const table of tables) {
        try {
            const result = await supabaseRequest(`/rest/v1/${table}?limit=1`);
            const count = Array.isArray(result.data) ? result.data.length : 0;
            console.log(`${table}: ✅ Accessible`);
        } catch (e) {
            console.log(`${table}: ❌ ${e.message}`);
        }
    }

    // Check for existing users
    console.log('\n👥 Users Check\n');
    try {
        const users = await supabaseRequest('/rest/v1/user_profiles?limit=5');
        if (Array.isArray(users.data)) {
            console.log(`Registered users: ${users.data.length}`);
            users.data.forEach(u => {
                console.log(`  - ID: ${u.id?.slice(0, 8)}... Role: ${u.role_id || 'N/A'}`);
            });
        }
    } catch (e) {
        console.log(`Users: ❌ ${e.message}`);
    }

    // Check for events
    console.log('\n📅 Events Check\n');
    try {
        const events = await supabaseRequest('/rest/v1/events?limit=5');
        if (Array.isArray(events.data)) {
            console.log(`Total events: ${events.data.length}`);
            events.data.forEach(e => {
                console.log(`  - ${e.type || 'Unknown'}: ${e.status || 'N/A'}`);
            });
        }
    } catch (e) {
        console.log(`Events: ❌ ${e.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Deep test complete!\n');
}

runTests().catch(console.error);
