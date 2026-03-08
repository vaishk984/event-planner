/**
 * Simple SQL-based vendor booking query
 * Run this with: psql or through Supabase SQL editor
 */

-- Get all booking requests and their details
SELECT 
    br.id as booking_id,
    br.vendor_id,
    br.event_id,
    br.status,
    br.service,
    br.budget,
    br.quoted_amount,
    br.created_at,
    v.name as vendor_name,
    v.user_id as vendor_user_id,
    e.name as event_name,
    e.event_date
FROM booking_requests br
LEFT JOIN vendors v ON br.vendor_id = v.id
LEFT JOIN events e ON br.event_id = e.id
ORDER BY br.created_at DESC
LIMIT 20;

-- Check if there are booking requests pointing to a specific vendor
-- Replace 'VENDOR_ID_HERE' with actual vendor ID
-- SELECT * FROM booking_requests WHERE vendor_id = 'VENDOR_ID_HERE';

-- Get vendor by user_id (if you know the logged-in user's ID)
-- Replace 'USER_ID_HERE' with actual user ID
-- SELECT * FROM vendors WHERE user_id = 'USER_ID_HERE';
