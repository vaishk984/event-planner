-- Allow vendors to view and manage their own booking requests
-- This enables vendor dashboards to display assignments made by planners

-- Add policy for vendors to view their booking requests
DROP POLICY IF EXISTS "Vendors can view own bookings" ON booking_requests;
CREATE POLICY "Vendors can view own bookings"
    ON booking_requests FOR SELECT
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

-- Add policy for vendors to update their booking request status
DROP POLICY IF EXISTS "Vendors can update own booking status" ON booking_requests;
CREATE POLICY "Vendors can update own booking status"
    ON booking_requests FOR UPDATE
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );
