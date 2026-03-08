-- PlannerOS Row Level Security Policies
-- Migration: RLS Setup
-- Created: 2025-12-20

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
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT r.name
  FROM user_profiles up
  JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- LEADS POLICIES
-- ============================================================================

-- Planners can view and manage their own leads
CREATE POLICY "Planners can view their own leads"
  ON leads FOR SELECT
  USING (planner_id = auth.uid());

CREATE POLICY "Planners can create leads"
  ON leads FOR INSERT
  WITH CHECK (planner_id = auth.uid());

CREATE POLICY "Planners can update their own leads"
  ON leads FOR UPDATE
  USING (planner_id = auth.uid());

-- Lead activities follow lead permissions
CREATE POLICY "Users can view lead activities for their leads"
  ON lead_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_activities.lead_id
      AND leads.planner_id = auth.uid()
    )
  );

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================================
-- EVENTS POLICIES
-- ============================================================================

-- Planners can view their own events
CREATE POLICY "Planners can view their events"
  ON events FOR SELECT
  USING (planner_id = auth.uid());

-- Clients can view their own events
CREATE POLICY "Clients can view their events"
  ON events FOR SELECT
  USING (client_id = auth.uid());

-- Vendors can view events they're assigned to
CREATE POLICY "Vendors can view assigned events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_tasks et
      JOIN vendors v ON et.vendor_id = v.id
      WHERE et.event_id = events.id
      AND v.user_id = auth.uid()
    )
  );

-- Planners can create events
CREATE POLICY "Planners can create events"
  ON events FOR INSERT
  WITH CHECK (planner_id = auth.uid());

-- Planners can update their events
CREATE POLICY "Planners can update their events"
  ON events FOR UPDATE
  USING (planner_id = auth.uid());

-- ============================================================================
-- EVENT REQUIREMENTS & CONCEPTS POLICIES
-- ============================================================================

CREATE POLICY "Event requirements follow event permissions"
  ON event_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_requirements.event_id
      AND (events.planner_id = auth.uid() OR events.client_id = auth.uid())
    )
  );

CREATE POLICY "Event concepts follow event permissions"
  ON event_concepts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_concepts.event_id
      AND (events.planner_id = auth.uid() OR events.client_id = auth.uid())
    )
  );

-- ============================================================================
-- PACKAGE TEMPLATES POLICIES
-- ============================================================================

-- Everyone can view active templates
CREATE POLICY "Anyone can view active package templates"
  ON package_templates FOR SELECT
  USING (is_active = true);

-- Only planners can manage templates
CREATE POLICY "Planners can manage package templates"
  ON package_templates FOR ALL
  USING (get_user_role(auth.uid()) = 'planner');

-- ============================================================================
-- PACKAGES & PACKAGE ITEMS POLICIES
-- ============================================================================

CREATE POLICY "Packages follow event permissions"
  ON packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = packages.event_id
      AND (events.planner_id = auth.uid() OR events.client_id = auth.uid())
    )
  );

CREATE POLICY "Package items follow package permissions"
  ON package_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM packages p
      JOIN events e ON p.event_id = e.id
      WHERE p.id = package_items.package_id
      AND (e.planner_id = auth.uid() OR e.client_id = auth.uid())
    )
  );

-- ============================================================================
-- CHECKLISTS POLICIES
-- ============================================================================

CREATE POLICY "Checklists follow event permissions"
  ON checklists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = checklists.event_id
      AND (events.planner_id = auth.uid() OR events.client_id = auth.uid())
    )
  );

CREATE POLICY "Checklist items follow checklist permissions"
  ON checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM checklists c
      JOIN events e ON c.event_id = e.id
      WHERE c.id = checklist_items.checklist_id
      AND (e.planner_id = auth.uid() OR e.client_id = auth.uid() OR checklist_items.assigned_to = auth.uid())
    )
  );

-- ============================================================================
-- VENDORS POLICIES
-- ============================================================================

-- Vendors can view their own profile
CREATE POLICY "Vendors can view own profile"
  ON vendors FOR SELECT
  USING (user_id = auth.uid());

-- Planners can view all vendors
CREATE POLICY "Planners can view all vendors"
  ON vendors FOR SELECT
  USING (get_user_role(auth.uid()) = 'planner');

-- Vendors can update their own profile
CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- SERVICES POLICIES
-- ============================================================================

-- Everyone can view services
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  USING (true);

-- Only planners can manage services
CREATE POLICY "Planners can manage services"
  ON services FOR ALL
  USING (get_user_role(auth.uid()) = 'planner');

-- ============================================================================
-- VENDOR AVAILABILITY POLICIES
-- ============================================================================

CREATE POLICY "Vendors can manage their own availability"
  ON vendor_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_availability.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY "Planners can view vendor availability"
  ON vendor_availability FOR SELECT
  USING (get_user_role(auth.uid()) = 'planner');

-- ============================================================================
-- EVENT TASKS POLICIES
-- ============================================================================

-- Vendors can view their assigned tasks
CREATE POLICY "Vendors can view assigned tasks"
  ON event_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = event_tasks.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Planners can view tasks for their events
CREATE POLICY "Planners can view event tasks"
  ON event_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_tasks.event_id
      AND events.planner_id = auth.uid()
    )
  );

-- Vendors can update their assigned tasks
CREATE POLICY "Vendors can update assigned tasks"
  ON event_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = event_tasks.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PROOF OF WORK POLICIES
-- ============================================================================

CREATE POLICY "Proof of work follows task permissions"
  ON proof_of_work FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM event_tasks et
      JOIN vendors v ON et.vendor_id = v.id
      WHERE et.id = proof_of_work.task_id
      AND v.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM event_tasks et
      JOIN events e ON et.event_id = e.id
      WHERE et.id = proof_of_work.task_id
      AND (e.planner_id = auth.uid() OR e.client_id = auth.uid())
    )
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- INVOICES & PAYMENTS POLICIES
-- ============================================================================

CREATE POLICY "Invoices follow event permissions"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = invoices.event_id
      AND (events.planner_id = auth.uid() OR events.client_id = auth.uid())
    )
  );

CREATE POLICY "Payments follow invoice permissions"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN events e ON i.event_id = e.id
      WHERE i.id = payments.invoice_id
      AND (e.planner_id = auth.uid() OR e.client_id = auth.uid())
    )
  );

-- ============================================================================
-- FEEDBACK POLICIES
-- ============================================================================

CREATE POLICY "Feedback follows event permissions"
  ON feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = feedback.event_id
      AND (events.planner_id = auth.uid() OR events.client_id = auth.uid() OR feedback.user_id = auth.uid())
    )
  );
