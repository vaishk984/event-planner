
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Handle both common variable names for service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
    console.error('   Please ensure SUPABASE_SERVICE_ROLE_KEY is set.');
    process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function generateVendorAccounts() {
    console.log('🚀 Starting Vendor Account Generation...');

    // 1. Fetch all vendors
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, company_name, email, user_id, category')
        .order('company_name');

    if (error) {
        console.error('❌ Error fetching vendors:', error);
        return;
    }

    console.log(`📊 Found ${vendors.length} vendors.`);

    const credentials: string[] = [];
    const updates: any[] = [];
    const errors: any[] = [];

    for (const vendor of vendors) {
        console.log(`\nProcessing: ${vendor.company_name} (${vendor.id})`);

        // Check if email exists
        let email = vendor.email;
        if (!email) {
            // Generate placeholder email if missing
            const sanitizedName = vendor.company_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            email = `${sanitizedName}@planneros.com`; // Placeholder domain
            console.log(`   ⚠️ No email found. Generated placeholder: ${email}`);

            // Update vendor with generated email
            await supabase.from('vendors').update({ email }).eq('id', vendor.id);
        }

        // Check if user already exists in Auth
        // Note: admin.listUsers() is paginated, but for now we try creation first
        // If exact check needed, we'd use admin.listUsers()

        // Deterministic password for simplicity in this demo context, or random?
        // User asked for "passwords for all vendors". Let's use a standard format for ease of testing:
        // "VendorName@2024!" (sanitized) to make it easy for the user to remember/distribute.
        // OR just "PlannerOS@123" for dev environment.
        // Let's go with "PlannerOS@123" for simplicity unless user wants specific ones.
        const password = 'PlannerOS@123';

        let userId = vendor.user_id;

        if (!userId) {
            // Create Auth User
            const { data: userData, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    role: 'vendor',
                    company_name: vendor.company_name,
                    full_name: vendor.company_name // Map company name to name
                }
            });

            if (createError) {
                // If user already exists, try to get their ID by email (we can't get password)
                if (createError.message.includes('already been registered')) {
                    console.log(`   ℹ️ User already exists in Auth. Fetching ID...`);
                    // We'd ideally need to list users to find ID, or just trust if we can't search by email directly via admin api easily without listing.
                    // admin.listUsers() is the way.
                    const { data: userList } = await supabase.auth.admin.listUsers();
                    const existingUser = userList.users.find(u => u.email === email);
                    if (existingUser) {
                        userId = existingUser.id;
                        console.log(`   ✅ Found existing Auth User ID: ${userId}`);
                    } else {
                        console.error(`   ❌ Could not find existing user ID for ${email}`);
                        errors.push({ vendor: vendor.company_name, error: "Auth exists but ID not found" });
                        continue;
                    }
                } else {
                    console.error(`   ❌ Failed to create auth user:`, createError.message);
                    errors.push({ vendor: vendor.company_name, error: createError.message });
                    continue;
                }
            } else {
                userId = userData.user.id;
                console.log(`   ✅ Created new Auth User: ${userId}`);
                credentials.push(`Vendor: ${vendor.company_name}\nEmail: ${email}\nPassword: ${password}\n-------------------`);
            }

            // Link to Vendor Record
            const { error: updateError } = await supabase
                .from('vendors')
                .update({ user_id: userId })
                .eq('id', vendor.id);

            if (updateError) {
                console.error(`   ❌ Failed to link vendor record:`, updateError);
                errors.push({ vendor: vendor.company_name, error: "Failed to update vendor record" });
            } else {
                console.log(`   🔗 Linked Auth ID to Vendor Record.`);
            }
        } else {
            console.log(`   ✓ Already linked to User ID: ${userId}`);
            // Optionally reset password if requested? No, safer not to unless asked.
            credentials.push(`Vendor: ${vendor.company_name}\nEmail: ${email}\nPassword: (Use existing or reset)\n-------------------`);
        }
    }

    // Save credentials to file
    const credentialsPath = path.resolve(process.cwd(), 'vendor_credentials.txt');
    fs.writeFileSync(credentialsPath, credentials.join('\n'));

    console.log(`\n🎉 Process Complete!`);
    console.log(`✅ Success: ${vendors.length - errors.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`\n📄 Credentials saved to: ${credentialsPath}`);
}

generateVendorAccounts();
