
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceCreate() {
    const logPath = path.resolve(process.cwd(), 'force_create.log');
    const credPath = path.resolve(process.cwd(), 'vendor_credentials.txt');
    const logs: string[] = [];
    const creds: string[] = [];

    const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    log('🚀 Starting Force Create...');

    const { data: vendors, error } = await supabase.from('vendors').select('*');
    if (error) {
        log(`❌ Error fetching vendors: ${error.message}`);
        fs.writeFileSync(logPath, logs.join('\n'));
        return;
    }

    log(`📊 Found ${vendors.length} vendors.`);

    for (const vendor of vendors) {
        log(`\nProcessing ${vendor.company_name} (${vendor.id})`);

        // Ensure email
        let email = vendor.email;
        if (!email) {
            email = `${vendor.company_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@planneros.com`;
            log(`   ⚠️ Generated email: ${email}`);
            await supabase.from('vendors').update({ email }).eq('id', vendor.id);
        }

        const password = 'PlannerOS@123';
        let userId = vendor.user_id;

        log(`   🔍 DEBUG: initial userId: '${userId}'`);

        if (userId) {
            // Verify if user actually exists
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
            if (userError || !user) {
                log(`   ⚠️ Stale user_id detected (User not found in Auth). Clearing local userId to force recreation.`);
                userId = null;
            } else {
                log(`   ✅ Existing user_id is valid.`);
            }
        }

        if (!userId) {
            log(`   ℹ️ No valid user_id. Creating Auth User...`);
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: 'vendor', company_name: vendor.company_name }
            });

            if (createError) {
                log(`   ❌ Auth Create Failed: ${createError.message}`);
                // Try to find if exists
                const { data: { users } } = await supabase.auth.admin.listUsers();
                const existing = users.find(u => u.email === email);
                if (existing) {
                    userId = existing.id;
                    log(`   ✅ Found existing user ID via email: ${userId}`);
                }
            } else {
                userId = data.user.id;
                log(`   ✅ Created New Auth User: ${userId}`);
            }

            if (userId) {
                const { error: updateError } = await supabase
                    .from('vendors')
                    .update({ user_id: userId })
                    .eq('id', vendor.id);

                if (updateError) {
                    log(`   ❌ Link Failed: ${updateError.message}`);
                } else {
                    log(`   🔗 Linked successfully.`);
                }
                creds.push(`Vendor: ${vendor.company_name}\nEmail: ${email}\nPassword: ${password}\n-------------------`);
            }
        } else {
            log(`   ✓ Already linked: ${userId}`);
            creds.push(`Vendor: ${vendor.company_name}\nEmail: ${email}\nPassword: PlannerOS@123\n-------------------`);
        }
    }

    fs.writeFileSync(logPath, logs.join('\n'));
    fs.writeFileSync(credPath, creds.join('\n'));
    log(`\n🎉 Done. Log saved to ${logPath}, Credentials to ${credPath}`);
}

forceCreate();
