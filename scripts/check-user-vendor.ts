/**
 * Check vendor record for anubhav.kus12@gmail.com
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkUser() {
    console.log('Checking user: anubhav.kus12@gmail.com')
    console.log('='.repeat(60))

    // 1. Find user by email in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    const user = authUsers?.users.find(u => u.email === 'anubhav.kus12@gmail.com')

    if (!user) {
        console.log('❌ User not found in auth.users')
        return
    }

    console.log('✅ Auth User Found:')
    console.log('   ID:', user.id)
    console.log('   Email:', user.email)
    console.log('   Created:', user.created_at)

    // 2. Check if vendor record exists
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    if (vendor) {
        console.log('\n✅ Vendor Record Found:')
        console.log('   ID:', vendor.id)
        console.log('   Company Name:', vendor.company_name)
        console.log('   Email:', vendor.email)
    } else {
        console.log('\n❌ NO Vendor Record Found!')
        console.log('   User exists in auth but not in vendors table')
        console.log('\n💡 SOLUTION: Create vendor record for this user')
        console.log(`
INSERT INTO vendors (user_id, company_name, email, status)
VALUES ('${user.id}', 'Your Company Name', '${user.email}', 'active');
        `)
    }

    // 3. Check by email directly
    const { data: vendorByEmail } = await supabase
        .from('vendors')
        .select('*')
        .eq('email', 'anubhav.kus12@gmail.com')
        .maybeSingle()

    if (vendorByEmail) {
        console.log('\n⚠️  Vendor exists with same email but different user_id!')
        console.log('   Vendor user_id:', vendorByEmail.user_id)
        console.log('   Auth user_id:', user.id)
        console.log('   MISMATCH - Need to update vendor.user_id')
    }

    // 4. Check user_profiles
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    if (profile) {
        console.log('\n✅ User Profile Found:')
        console.log('   Role:', profile.role)
        console.log('   Name:', profile.full_name)
    } else {
        console.log('\n⚠️  No user_profile record')
    }
}

checkUser().catch(console.error)
