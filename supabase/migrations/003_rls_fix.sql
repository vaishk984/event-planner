-- PlannerOS Row Level Security Policies (Simplified - No Circular Dependencies)
-- Migration: RLS Fix
-- Created: 2025-12-21

-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_of_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SIMPLIFIED POLICIES - NO CIRCULAR DEPENDENCIES
-- ============================================================================

-- LEADS: Only planner who created can access
CREATE POLICY "leads_select" ON leads FOR SELECT USING (planner_id = auth.uid());
CREATE POLICY "leads_insert" ON leads FOR INSERT WITH CHECK (planner_id = auth.uid());
CREATE POLICY "leads_update" ON leads FOR UPDATE USING (planner_id = auth.uid());
CREATE POLICY "leads_delete" ON leads FOR DELETE USING (planner_id = auth.uid());

-- LEAD ACTIVITIES: Access through lead ownership
CREATE POLICY "lead_activities_all" ON lead_activities FOR ALL USING (
  lead_id IN (SELECT id FROM leads WHERE planner_id = auth.uid())
);

-- USER PROFILES: Users can manage their own profile
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- EVENTS: Planner or Client can access
CREATE POLICY "events_select" ON events FOR SELECT USING (
  planner_id = auth.uid() OR client_id = auth.uid()
);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (planner_id = auth.uid());
CREATE POLICY "events_update" ON events FOR UPDATE USING (planner_id = auth.uid());
CREATE POLICY "events_delete" ON events FOR DELETE USING (planner_id = auth.uid());

-- EVENT REQUIREMENTS: Access through event ownership
CREATE POLICY "event_requirements_all" ON event_requirements FOR ALL USING (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid() OR client_id = auth.uid())
);

-- EVENT CONCEPTS: Access through event ownership
CREATE POLICY "event_concepts_all" ON event_concepts FOR ALL USING (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid() OR client_id = auth.uid())
);

-- PACKAGE TEMPLATES: Everyone can view active templates, planners can manage
CREATE POLICY "package_templates_select" ON package_templates FOR SELECT USING (is_active = true);
CREATE POLICY "package_templates_manage" ON package_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);

-- PACKAGES: Access through event ownership
CREATE POLICY "packages_all" ON packages FOR ALL USING (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid() OR client_id = auth.uid())
);

-- PACKAGE ITEMS: Access through package's event
CREATE POLICY "package_items_all" ON package_items FOR ALL USING (
  package_id IN (
    SELECT p.id FROM packages p 
    JOIN events e ON p.event_id = e.id 
    WHERE e.planner_id = auth.uid() OR e.client_id = auth.uid()
  )
);

-- REVISION REQUESTS: Access through event ownership
CREATE POLICY "revision_requests_all" ON revision_requests FOR ALL USING (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid() OR client_id = auth.uid())
);

-- CHECKLISTS: Access through event ownership
CREATE POLICY "checklists_all" ON checklists FOR ALL USING (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid() OR client_id = auth.uid())
);

-- CHECKLIST ITEMS: Access through checklist's event
CREATE POLICY "checklist_items_all" ON checklist_items FOR ALL USING (
  checklist_id IN (
    SELECT c.id FROM checklists c 
    JOIN events e ON c.event_id = e.id 
    WHERE e.planner_id = auth.uid() OR e.client_id = auth.uid() OR assigned_to = auth.uid()
  )
);

-- VENDORS: Vendors see own, planners see all
CREATE POLICY "vendors_select" ON vendors FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);
CREATE POLICY "vendors_update" ON vendors FOR UPDATE USING (user_id = auth.uid());

-- SERVICES: Everyone can view
CREATE POLICY "services_select" ON services FOR SELECT USING (true);
CREATE POLICY "services_manage" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);

-- VENDOR SERVICES: Vendor can manage own, planners can view
CREATE POLICY "vendor_services_select" ON vendor_services FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);
CREATE POLICY "vendor_services_manage" ON vendor_services FOR ALL USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- VENDOR AVAILABILITY: Vendor manages own, planners view
CREATE POLICY "vendor_availability_select" ON vendor_availability FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);
CREATE POLICY "vendor_availability_manage" ON vendor_availability FOR ALL USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- EVENT TASKS: Vendor sees assigned, planner sees event's tasks
CREATE POLICY "event_tasks_select" ON event_tasks FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) OR
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid())
);
CREATE POLICY "event_tasks_update" ON event_tasks FOR UPDATE USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) OR
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid())
);
CREATE POLICY "event_tasks_insert" ON event_tasks FOR INSERT WITH CHECK (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid())
);

-- PROOF OF WORK: Vendor uploads, planner/client views
CREATE POLICY "proof_of_work_select" ON proof_of_work FOR SELECT USING (
  task_id IN (
    SELECT et.id FROM event_tasks et
    JOIN events e ON et.event_id = e.id
    WHERE e.planner_id = auth.uid() OR e.client_id = auth.uid()
  ) OR
  task_id IN (
    SELECT et.id FROM event_tasks et
    JOIN vendors v ON et.vendor_id = v.id
    WHERE v.user_id = auth.uid()
  )
);
CREATE POLICY "proof_of_work_insert" ON proof_of_work FOR INSERT WITH CHECK (
  task_id IN (
    SELECT et.id FROM event_tasks et
    JOIN vendors v ON et.vendor_id = v.id
    WHERE v.user_id = auth.uid()
  )
);

-- INVOICES: Access through event ownership
CREATE POLICY "invoices_all" ON invoices FOR ALL USING (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid() OR client_id = auth.uid())
);

-- PAYMENTS: Access through invoice's event
CREATE POLICY "payments_all" ON payments FOR ALL USING (
  invoice_id IN (
    SELECT i.id FROM invoices i
    JOIN events e ON i.event_id = e.id
    WHERE e.planner_id = auth.uid() OR e.client_id = auth.uid()
  )
);

-- VENDOR PAYOUTS: Vendor sees own, planner sees all
CREATE POLICY "vendor_payouts_select" ON vendor_payouts FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);

-- FEEDBACK: Event participants can access
CREATE POLICY "feedback_all" ON feedback FOR ALL USING (
  event_id IN (SELECT id FROM events WHERE planner_id = auth.uid() OR client_id = auth.uid()) OR
  user_id = auth.uid()
);

-- VENDOR PERFORMANCE: Planners and rated vendor can view
CREATE POLICY "vendor_performance_select" ON vendor_performance FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);

-- NOTIFICATIONS: Users see their own
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- AUDIT LOGS: Planners can view all, users see their own
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name = 'planner'))
);
