-- PlannerOS Database Schema Extension
-- Migration: Core Business Entities
-- Created: 2026-01-30

-- ============================================================================
-- CLIENTS (CRM)
-- ============================================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'prospect' CHECK (status IN ('prospect', 'active', 'past', 'inactive')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    preferences JSONB DEFAULT '{}',
    total_events INTEGER DEFAULT 0,
    total_spend DECIMAL(14, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    referral_source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EVENT FUNCTIONS (Sub-events / Functions)
-- ============================================================================

CREATE TABLE event_functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'wedding', 'reception', 'sangeet', 'mehendi', 'haldi', 
        'cocktail', 'after_party', 'ceremony', 'conference', 'dinner', 'custom'
    )),
    date DATE,
    start_time TIME,
    end_time TIME,
    venue_name VARCHAR(200),
    venue_address TEXT,
    guest_count INTEGER,
    budget DECIMAL(14, 2),
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BOOKING REQUESTS (Planner-Vendor Workflow)
-- ============================================================================

CREATE TABLE booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    function_id UUID REFERENCES event_functions(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    planner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'quote_requested', 'quote_received', 'negotiating',
        'confirmed', 'deposit_paid', 'in_progress', 'completed', 
        'cancelled', 'declined'
    )),
    service_category VARCHAR(100) NOT NULL,
    service_details TEXT,
    quoted_amount DECIMAL(14, 2),
    agreed_amount DECIMAL(14, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    payment_schedule JSONB DEFAULT '[]',
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_date TIMESTAMP WITH TIME ZONE,
    confirmation_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BUDGET ITEMS (Budget Management)
-- ============================================================================

CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    function_id UUID REFERENCES event_functions(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'venue', 'catering', 'decoration', 'photography', 'entertainment',
        'attire', 'makeup', 'transport', 'invitations', 'gifts', 'miscellaneous'
    )),
    description VARCHAR(200) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
    estimated_amount DECIMAL(14, 2) NOT NULL,
    actual_amount DECIMAL(14, 2),
    paid_amount DECIMAL(14, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS (Financial Transactions)
-- ============================================================================

CREATE TABLE financial_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
    budget_item_id UUID REFERENCES budget_items(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'client_payment', 'vendor_payment', 'refund', 'expense'
    )),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled'
    )),
    method VARCHAR(30) CHECK (method IN (
        'bank_transfer', 'cash', 'cheque', 'upi', 'card', 'other'
    )),
    amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    paid_by VARCHAR(100),
    paid_to VARCHAR(100),
    due_date DATE,
    paid_date DATE,
    reference VARCHAR(100),
    receipt_url TEXT,
    description VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MESSAGES (Planner-Vendor Communication)
-- ============================================================================

CREATE TABLE booking_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_request_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('planner', 'vendor', 'system')),
    sender_id VARCHAR(100) NOT NULL,
    type VARCHAR(30) DEFAULT 'text' CHECK (type IN ('text', 'file', 'quote', 'status_update')),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Clients indexes
CREATE INDEX idx_clients_planner ON clients(planner_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(name);

-- Event functions indexes
CREATE INDEX idx_event_functions_event ON event_functions(event_id);
CREATE INDEX idx_event_functions_date ON event_functions(date);
CREATE INDEX idx_event_functions_sort ON event_functions(event_id, sort_order);

-- Booking requests indexes
CREATE INDEX idx_booking_requests_event ON booking_requests(event_id);
CREATE INDEX idx_booking_requests_vendor ON booking_requests(vendor_id);
CREATE INDEX idx_booking_requests_planner ON booking_requests(planner_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_function ON booking_requests(function_id);

-- Budget items indexes
CREATE INDEX idx_budget_items_event ON budget_items(event_id);
CREATE INDEX idx_budget_items_function ON budget_items(function_id);
CREATE INDEX idx_budget_items_category ON budget_items(category);
CREATE INDEX idx_budget_items_vendor ON budget_items(vendor_id);

-- Financial payments indexes
CREATE INDEX idx_financial_payments_event ON financial_payments(event_id);
CREATE INDEX idx_financial_payments_booking ON financial_payments(booking_request_id);
CREATE INDEX idx_financial_payments_status ON financial_payments(status);
CREATE INDEX idx_financial_payments_due_date ON financial_payments(due_date);
CREATE INDEX idx_financial_payments_type ON financial_payments(type);

-- Messages indexes
CREATE INDEX idx_booking_messages_booking ON booking_messages(booking_request_id);
CREATE INDEX idx_booking_messages_unread ON booking_messages(booking_request_id, is_read) WHERE is_read = false;
CREATE INDEX idx_booking_messages_created ON booking_messages(booking_request_id, created_at DESC);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_functions_updated_at
    BEFORE UPDATE ON event_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_requests_updated_at
    BEFORE UPDATE ON booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
    BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_payments_updated_at
    BEFORE UPDATE ON financial_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_messages_updated_at
    BEFORE UPDATE ON booking_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
