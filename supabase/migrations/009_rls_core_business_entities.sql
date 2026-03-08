-- PlannerOS RLS Policies for New Entities
-- Migration: Row Level Security for Core Business Entities
-- Created: 2026-01-30

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================

-- Planners can manage their own clients
CREATE POLICY "Planners can view own clients"
    ON clients FOR SELECT
    USING (auth.uid() = planner_id);

CREATE POLICY "Planners can create clients"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = planner_id);

CREATE POLICY "Planners can update own clients"
    ON clients FOR UPDATE
    USING (auth.uid() = planner_id);

CREATE POLICY "Planners can delete own clients"
    ON clients FOR DELETE
    USING (auth.uid() = planner_id);

-- ============================================================================
-- EVENT FUNCTIONS POLICIES
-- ============================================================================

-- Planners can manage functions for their events
CREATE POLICY "Users can view event functions"
    ON event_functions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_functions.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can create event functions"
    ON event_functions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_functions.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can update event functions"
    ON event_functions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_functions.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can delete event functions"
    ON event_functions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_functions.event_id 
            AND events.planner_id = auth.uid()
        )
    );

-- ============================================================================
-- BOOKING REQUESTS POLICIES
-- ============================================================================

-- Planners can view their booking requests
CREATE POLICY "Planners can view own booking requests"
    ON booking_requests FOR SELECT
    USING (auth.uid() = planner_id);

-- Vendors can view booking requests sent to them
CREATE POLICY "Vendors can view booking requests for them"
    ON booking_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE vendors.id = booking_requests.vendor_id 
            AND vendors.user_id = auth.uid()
        )
    );

-- Planners can create booking requests
CREATE POLICY "Planners can create booking requests"
    ON booking_requests FOR INSERT
    WITH CHECK (auth.uid() = planner_id);

-- Planners can update their booking requests
CREATE POLICY "Planners can update own booking requests"
    ON booking_requests FOR UPDATE
    USING (auth.uid() = planner_id);

-- Vendors can update booking requests (for quote submission)
CREATE POLICY "Vendors can update booking requests"
    ON booking_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE vendors.id = booking_requests.vendor_id 
            AND vendors.user_id = auth.uid()
        )
    );

-- ============================================================================
-- BUDGET ITEMS POLICIES
-- ============================================================================

-- Planners can manage budget items for their events
CREATE POLICY "Planners can view budget items"
    ON budget_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = budget_items.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can create budget items"
    ON budget_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = budget_items.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can update budget items"
    ON budget_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = budget_items.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can delete budget items"
    ON budget_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = budget_items.event_id 
            AND events.planner_id = auth.uid()
        )
    );

-- ============================================================================
-- FINANCIAL PAYMENTS POLICIES
-- ============================================================================

-- Planners can manage payments for their events
CREATE POLICY "Planners can view payments"
    ON financial_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = financial_payments.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can create payments"
    ON financial_payments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = financial_payments.event_id 
            AND events.planner_id = auth.uid()
        )
    );

CREATE POLICY "Planners can update payments"
    ON financial_payments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = financial_payments.event_id 
            AND events.planner_id = auth.uid()
        )
    );

-- ============================================================================
-- BOOKING MESSAGES POLICIES
-- ============================================================================

-- Planners can view messages on their booking requests
CREATE POLICY "Planners can view booking messages"
    ON booking_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM booking_requests 
            WHERE booking_requests.id = booking_messages.booking_request_id 
            AND booking_requests.planner_id = auth.uid()
        )
    );

-- Vendors can view messages on their booking requests
CREATE POLICY "Vendors can view booking messages"
    ON booking_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM booking_requests br
            JOIN vendors v ON br.vendor_id = v.id
            WHERE br.id = booking_messages.booking_request_id 
            AND v.user_id = auth.uid()
        )
    );

-- Planners can send messages
CREATE POLICY "Planners can send messages"
    ON booking_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM booking_requests 
            WHERE booking_requests.id = booking_messages.booking_request_id 
            AND booking_requests.planner_id = auth.uid()
        )
    );

-- Vendors can send messages
CREATE POLICY "Vendors can send messages"
    ON booking_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM booking_requests br
            JOIN vendors v ON br.vendor_id = v.id
            WHERE br.id = booking_messages.booking_request_id 
            AND v.user_id = auth.uid()
        )
    );

-- Users can update messages (mark as read)
CREATE POLICY "Users can update messages"
    ON booking_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM booking_requests br
            WHERE br.id = booking_messages.booking_request_id 
            AND (
                br.planner_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM vendors v 
                    WHERE v.id = br.vendor_id AND v.user_id = auth.uid()
                )
            )
        )
    );
