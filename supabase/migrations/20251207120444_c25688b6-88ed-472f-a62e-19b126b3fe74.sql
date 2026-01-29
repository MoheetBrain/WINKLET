-- Add DELETE policy for matches
CREATE POLICY "Users can delete their matches"
ON public.matches
FOR DELETE
USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Add DELETE policy for messages (delete messages in user's matches)
CREATE POLICY "Users can delete messages in their matches"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.user_a = auth.uid() OR matches.user_b = auth.uid())
  )
);