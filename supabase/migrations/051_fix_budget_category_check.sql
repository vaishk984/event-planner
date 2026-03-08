-- Migration: Fix budget_items category check constraint
-- The UI sends categories that don't match the original DB constraint.
-- This migration drops the old constraint and adds one that accepts all UI categories.

ALTER TABLE budget_items DROP CONSTRAINT IF EXISTS budget_items_category_check;

ALTER TABLE budget_items ADD CONSTRAINT budget_items_category_check
CHECK (category IN (
    -- Original DB values
    'venue', 'food', 'decor', 'entertainment', 'photography',
    'bridal', 'logistics', 'guest', 'misc',
    -- UI values that were missing
    'catering', 'decoration', 'attire', 'makeup',
    'transport', 'invitations', 'gifts', 'miscellaneous'
));
