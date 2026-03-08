# Testing Vendor Assignment Sync

## Steps to Test

### 1. Apply RLS Migration
Run in Supabase SQL Editor:
```sql
-- File: 040_vendor_booking_access.sql
DROP POLICY IF EXISTS "Vendors can view own bookings" ON booking_requests;
CREATE POLICY "Vendors can view own bookings"
    ON booking_requests FOR SELECT
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

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
```

### 2. Test Planner Assigns Vendor
1. Login as planner
2. Go to an event
3. Navigate to Vendors tab
4. Click "Assign Vendor"
5. Select the test vendor (Vikram Singh / vendor@gmail.com)
6. Fill in service category and notes
7. Click "Assign Vendor"

### 3. Verify Vendor Dashboard
1. Logout
2. Login as vendor (vendor@gmail.com)
3. Check dashboard - should see:
   - New booking request in "New Booking Requests" section
   - Event name, date, city, venue
   - Service category
   - Accept/Decline buttons

### 4. Test Accept Flow
1. Click "Accept" on booking
2. Should see success message
3. Booking moves to "Upcoming Events" section
4. Logout and login as planner
5. Verify booking shows as "accepted" in planner view
