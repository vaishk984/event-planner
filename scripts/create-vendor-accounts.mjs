/**
 * Script: Create Auth Accounts for All Showroom Vendors
 * 
 * Usage:
 *   1. Get your SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard > Settings > API
 *   2. Run: node scripts/create-vendor-accounts.mjs
 * 
 * This script:
 *   - Fetches all vendors that don't have a user_id
 *   - Creates an auth user for each   (email: vendor email, password: Vendor@123)
 *   - Links the auth user to the vendor record
 *   - Creates a user_profile with role=vendor
 */

import { createClient } from '@supabase/supabase-js'

// ─── CONFIG ──────────────────────────────────────────────────────
const SUPABASE_URL = 'https://lhweubswsepknmpzliio.supabase.co'
// ⚠️  Paste your SERVICE ROLE KEY here (from Supabase Dashboard > Settings > API)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE'

const DEFAULT_PASSWORD = 'Vendor@123'
// ─────────────────────────────────────────────────────────────────

if (SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY before running.')
    console.error('   You can find it in Supabase Dashboard > Settings > API > service_role key')
    console.error('   Run: SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/create-vendor-accounts.mjs')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
    console.log('\n🔧 Creating auth accounts for showroom vendors...\n')

    // 1. Fetch all vendors without a user_id
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, company_name, email, category, contact_name')
        .is('user_id', null)
        .eq('status', 'active')
        .order('category')

    if (error) {
        console.error('❌ Failed to fetch vendors:', error.message)
        process.exit(1)
    }

    if (!vendors || vendors.length === 0) {
        console.log('✅ All vendors already have auth accounts!')
        return
    }

    console.log(`📋 Found ${vendors.length} vendors without accounts:\n`)

    const results = []
    let successCount = 0
    let skipCount = 0
    let failCount = 0

    for (const vendor of vendors) {
        const email = vendor.email || `${vendor.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@vendor.plannerOS.com`
        const displayName = vendor.company_name || vendor.contact_name || 'Vendor'

        process.stdout.write(`  Creating account for ${displayName} (${email})... `)

        // Check if email already exists in auth
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email)

        if (existingUser) {
            // User already exists — just link
            const { error: linkError } = await supabase
                .from('vendors')
                .update({ user_id: existingUser.id })
                .eq('id', vendor.id)

            if (linkError) {
                console.log(`⚠️  Link failed: ${linkError.message}`)
                failCount++
            } else {
                console.log('🔗 Linked to existing user')
                skipCount++
                results.push({ vendor: displayName, email, password: '(existing user)', status: 'linked' })
            }
            continue
        }

        // Create new auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: DEFAULT_PASSWORD,
            email_confirm: true, // Skip email verification
            user_metadata: {
                display_name: displayName,
                role: 'vendor',
                company_name: displayName,
                category_id: vendor.category,
            }
        })

        if (authError) {
            console.log(`❌ ${authError.message}`)
            failCount++
            continue
        }

        // Link auth user to vendor record
        const { error: updateError } = await supabase
            .from('vendors')
            .update({ user_id: authData.user.id })
            .eq('id', vendor.id)

        if (updateError) {
            console.log(`⚠️  Account created but link failed: ${updateError.message}`)
        } else {
            console.log('✅ Created!')
            successCount++
            results.push({
                vendor: displayName,
                email,
                password: DEFAULT_PASSWORD,
                category: vendor.category,
                status: 'created'
            })
        }

        // Also ensure user_profile exists
        try {
            await supabase.from('user_profiles').upsert({
                id: authData.user.id,
                role: 'vendor',
                display_name: displayName,
            }, { onConflict: 'id' })
        } catch (_) { }
    }

    // Summary
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`\n📊 SUMMARY:`)
    console.log(`   ✅ Created: ${successCount}`)
    console.log(`   🔗 Linked:  ${skipCount}`)
    console.log(`   ❌ Failed:  ${failCount}`)

    if (results.length > 0) {
        console.log(`\n📝 VENDOR CREDENTIALS:`)
        console.log(`${'─'.repeat(60)}`)
        console.log(`${'Vendor'.padEnd(30)} ${'Email'.padEnd(35)} Password`)
        console.log(`${'─'.repeat(60)}`)
        for (const r of results) {
            console.log(`${r.vendor.substring(0, 29).padEnd(30)} ${r.email.substring(0, 34).padEnd(35)} ${r.password}`)
        }
        console.log(`${'─'.repeat(60)}`)
        console.log(`\n⚠️  Default password for all vendors: ${DEFAULT_PASSWORD}`)
        console.log('   Vendors should change their password after first login.\n')
    }
}

main().catch(console.error)
