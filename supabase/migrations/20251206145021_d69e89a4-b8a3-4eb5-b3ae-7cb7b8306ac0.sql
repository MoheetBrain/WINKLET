-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a security definer function to check if users are matched
CREATE OR REPLACE FUNCTION public.is_matched_with(_viewer_id uuid, _profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches
    WHERE (user_a = _viewer_id AND user_b = _profile_user_id)
       OR (user_b = _viewer_id AND user_a = _profile_user_id)
  )
$$;

-- Create restrictive policy: users can view their own profile OR profiles of matched users
CREATE POLICY "Users can view own or matched profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_matched_with(auth.uid(), user_id)
);