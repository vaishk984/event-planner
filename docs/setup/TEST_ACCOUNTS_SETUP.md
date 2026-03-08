# Test Accounts Setup Guide

## Quick Fix: Disable Email Confirmation

### Step 1: Disable Email Confirmation in Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your `planner-os` project
3. Navigate to **Authentication** → **Providers**
4. Click on **Email** provider
5. Scroll down to **"Confirm email"**
6. **Toggle it OFF**
7. Click **Save**

This allows instant login without email verification!

---

## Option A: Use Seed Script (Recommended)

### Run the Seed Script
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase/migrations/005_seed_test_accounts.sql`
4. Click **Run**

### Test Accounts Created
```
Planner Account:
Email: planner@test.com
Password: password123
Dashboard: /planner

Client Account:
Email: client@test.com
Password: password123
Dashboard: /client

Vendor Account:
Email: vendor@test.com
Password: password123
Dashboard: /vendor
```

---

## Option B: Manual Signup (After Disabling Email Confirmation)

If you prefer to create accounts manually:

1. Visit http://localhost:3000/signup
2. Fill in:
   - Email: `planner@test.com`
   - Password: `password123`
   - Confirm: `password123`
   - Role: `Event Planner`
3. Click "Create Account"
4. Should work instantly (no email confirmation needed)

Repeat for client and vendor roles.

---

## Troubleshooting

### "Email not confirmed" Error
**Cause**: Email confirmation is still enabled in Supabase

**Fix**: 
1. Disable email confirmation (see Step 1 above)
2. Delete existing unconfirmed users:
   - Go to **Authentication** → **Users**
   - Delete any test users
   - Try signup again

### "Failed to create user profile" Error
**Cause**: RLS policy blocking profile creation

**Fix**: Already fixed in code! Using service_role key now.

---

## Current Status

✅ Email confirmation: **Needs to be disabled**  
✅ Test accounts script: **Ready to run**  
✅ Profile creation: **Fixed**  

**Next Step**: Disable email confirmation in Supabase, then either:
- Run seed script (faster), OR
- Manually signup (more control)

---

**After setup, you'll have 3 ready-to-use test accounts!** 🚀
