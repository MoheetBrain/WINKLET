-- Create a security definer function to validate match creation
CREATE OR REPLACE FUNCTION public.can_create_match(_user_a uuid, _user_b uuid, _wink_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Verify the wink exists and belongs to one of the users
    SELECT 1
    FROM public.winks w
    WHERE w.id = _wink_id
      AND w.user_id IN (_user_a, _user_b)
      AND w.expires_at > now()
  )
$$;

-- Add INSERT policy: users can create matches only when they are a party and have valid winks
CREATE POLICY "Users can create valid matches"
ON public.matches
FOR INSERT
WITH CHECK (
  auth.uid() IN (user_a, user_b)
  AND public.can_create_match(user_a, user_b, wink_id)
);