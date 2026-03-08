-- Allow vendors to view events they have a booking request for
-- Fixes "Unknown Event" issue in Vendor Dashboard

CREATE POLICY "Vendors can view events they are booked for"
ON events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM booking_requests br
    JOIN vendors v ON br.vendor_id = v.id
    WHERE br.event_id = events.id
    AND v.user_id = auth.uid()
  )
);
