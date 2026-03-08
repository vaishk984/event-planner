-- Cleanup: Remove duplicate booking_requests (keep only the first one per event+vendor)

DELETE FROM booking_requests
WHERE id NOT IN (
    SELECT MIN(id)
    FROM booking_requests
    GROUP BY event_id, vendor_id
);
