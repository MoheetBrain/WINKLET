-- Drop the existing restrictive SELECT policy on winks
DROP POLICY IF EXISTS "Users can view their own winks" ON public.winks;

-- Create a new policy that allows users to view their own winks OR winks associated with their matches
CREATE POLICY "Users can view own or matched winks" 
ON public.winks 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.wink_id = winks.id
    AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
  )
);