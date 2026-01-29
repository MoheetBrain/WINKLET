-- Drop existing delete policy
DROP POLICY IF EXISTS "Users can delete their own winks" ON public.winks;

-- Create new delete policy that prevents deletion if a match exists
CREATE POLICY "Users can delete their own winks without matches"
ON public.winks
FOR DELETE
USING (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.wink_id = winks.id
  )
);