-- Diagnostic Query: Check Booking Requests for Vendor
-- Run this in Supabase SQL Editor

-- 1. Check if this vendor exists and get their details
SELECT 
    'VENDOR INFO' as check_type,
    id,
    company_name,
    user_id,
    category,
    email
FROM vendors
WHERE id = 'ab6b6e93-1f3d-4585-9705-84439dad7edc';

-- 2. Check ALL booking requests in the system
SELECT 
    'ALL BOOKING REQUESTS' as check_type,
    id,
    vendor_id,
    event_id,
    planner_id,
    event_name,
    service,
    status,
    created_at
FROM booking_requests
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check booking requests for this specific vendor
SELECT 
    'BOOKINGS FOR THIS VENDOR' as check_type,
    br.id,
    br.vendor_id,
    br.event_id,
    br.event_name,
    br.service,
    br.status,
    v.company_name as vendor_name,
    br.created_at
FROM booking_requests br
LEFT JOIN vendors v ON br.vendor_id = v.id
WHERE br.vendor_id = 'ab6b6e93-1f3d-4585-9705-84439dad7edc';

-- 4. Check if there are any booking requests with NULL or mismatched vendor_id
SELECT 
    'UNMATCHED BOOKINGS' as check_type,
    br.id,
    br.vendor_id,
    br.event_name,
    br.service,
    br.status,
    CASE 
        WHEN br.vendor_id IS NULL THEN 'NULL vendor_id'
        WHEN NOT EXISTS (SELECT 1 FROM vendors WHERE id = br.vendor_id) THEN 'Invalid vendor_id'
        ELSE 'Valid'
    END as vendor_status
FROM booking_requests br
WHERE br.vendor_id IS NULL 
   OR NOT EXISTS (SELECT 1 FROM vendors WHERE id = br.vendor_id);

-- 5. Check all vendors and their booking counts
SELECT 
    'VENDOR SUMMARY' as check_type,
    v.id,
    v.company_name,
    v.category,
    COUNT(br.id) as booking_count
FROM vendors v
LEFT JOIN booking_requests br ON v.id = br.vendor_id
GROUP BY v.id, v.company_name, v.category
ORDER BY booking_count DESC;
