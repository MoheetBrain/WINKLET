-- Add UPDATE policy for winks so they can be expired after matches
CREATE POLICY "Service can update winks" 
ON public.winks 
FOR UPDATE 
USING (true)
WITH CHECK (true);