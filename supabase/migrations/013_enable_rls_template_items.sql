-- Enable RLS on template_items table
-- This fixes the Supabase security warning

-- Enable RLS
ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read template items (they're shared templates)
CREATE POLICY "Anyone can read template items"
ON public.template_items
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete template items
CREATE POLICY "Admins can manage template items"
ON public.template_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.user_id = auth.uid() AND r.name = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        JOIN public.roles r ON up.role_id = r.id
        WHERE up.user_id = auth.uid() AND r.name = 'admin'
    )
);
