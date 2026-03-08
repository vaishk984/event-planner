# Database Setup Instructions

## Option 1: Using Supabase Dashboard (Recommended for First Time)

1. **Log in to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your `planner-os` project

2. **Run Migrations**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into the editor
   - Click "Run" button
   - Wait for success message

3. **Set Up RLS Policies**
   - Create another new query
   - Copy the contents of `supabase/migrations/002_rls_policies.sql`
   - Paste and run

4. **Verify Tables Created**
   - Click on "Table Editor" in the left sidebar
   - You should see all 28 tables listed

## Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Tables Created (28 Total)

### Lead Management (2)
- ✅ leads
- ✅ lead_activities

### User & Access (3)
- ✅ roles
- ✅ user_profiles
- ✅ (auth.users - managed by Supabase)

### Event Management (3)
- ✅ events
- ✅ event_requirements
- ✅ event_concepts

### Planning & Packages (6)
- ✅ package_templates
- ✅ template_items
- ✅ services
- ✅ packages
- ✅ package_items
- ✅ revision_requests

### Checklist Management (2)
- ✅ checklists
- ✅ checklist_items

### Vendor & Services (3)
- ✅ vendors
- ✅ vendor_services
- ✅ vendor_availability

### Execution (2)
- ✅ event_tasks
- ✅ proof_of_work

### Finance (3)
- ✅ invoices
- ✅ payments
- ✅ vendor_payouts

### Feedback & System (4)
- ✅ feedback
- ✅ vendor_performance
- ✅ notifications
- ✅ audit_logs

## Security Features

✅ **Row Level Security (RLS) Enabled** on all tables
✅ **Role-based access control**:
- Planners: Full access to their leads and events
- Clients: View-only access to their events
- Vendors: Access to assigned tasks only

✅ **Indexes created** for optimal query performance

## Next Steps

After running the migrations:
1. Configure environment variables in `.env.local`
2. Test database connection
3. Begin building authentication module
