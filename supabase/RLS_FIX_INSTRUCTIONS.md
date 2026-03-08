# RLS Policy Fix Instructions

## Issue
The initial RLS policies (002_rls_policies.sql) had circular dependencies causing "infinite recursion" errors.

## Solution
Created simplified policies (003_rls_fix.sql) that:
- Remove all circular policy checks
- Use direct user ID comparisons
- Maintain security without nested EXISTS clauses

## How to Apply

### In Supabase Dashboard:
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `003_rls_fix.sql`
4. Click **Run**
5. Wait for success message

### What This Does:
- Drops all existing policies
- Re-enables RLS on all tables
- Creates simplified, non-circular policies
- Maintains role-based access control

## After Running:
Run the test again to verify:
```bash
npm run test:db
```

All 27 tables should now work without errors.

## Policy Summary:
- **Leads**: Only creating planner
- **Events**: Planner or Client
- **Vendors**: Own profile + planners view all
- **Tasks**: Assigned vendor + event planner
- **Notifications**: Own notifications only

All policies are now direct checks without circular dependencies.
