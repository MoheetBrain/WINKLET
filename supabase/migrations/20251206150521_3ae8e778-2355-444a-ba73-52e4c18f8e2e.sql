-- Function to check for matching winks and create matches
CREATE OR REPLACE FUNCTION public.check_for_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matching_wink RECORD;
  earth_radius CONSTANT float := 6371000; -- Earth radius in meters
BEGIN
  -- Find overlapping winks from other users
  FOR matching_wink IN
    SELECT w.*
    FROM winks w
    WHERE w.user_id != NEW.user_id
      AND w.expires_at > now()
      -- Check if winks are within the smaller of the two radii using Haversine formula
      AND (
        earth_radius * 2 * ASIN(
          SQRT(
            POWER(SIN(RADIANS(NEW.lat - w.lat) / 2), 2) +
            COS(RADIANS(w.lat)) * COS(RADIANS(NEW.lat)) *
            POWER(SIN(RADIANS(NEW.lng - w.lng) / 2), 2)
          )
        )
      ) <= LEAST(NEW.radius, w.radius)
      -- Check time overlap: winks within 10 minutes of each other (accounting for time_offset)
      AND ABS(
        EXTRACT(EPOCH FROM (NEW.created_at + (NEW.time_offset || ' minutes')::interval)) -
        EXTRACT(EPOCH FROM (w.created_at + (w.time_offset || ' minutes')::interval))
      ) <= 600
      -- Ensure no existing match between these users
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE (m.user_a = NEW.user_id AND m.user_b = w.user_id)
           OR (m.user_a = w.user_id AND m.user_b = NEW.user_id)
      )
  LOOP
    -- Create a match
    INSERT INTO matches (user_a, user_b, wink_id)
    VALUES (
      LEAST(NEW.user_id, matching_wink.user_id),
      GREATEST(NEW.user_id, matching_wink.user_id),
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run match detection after each wink insert
DROP TRIGGER IF EXISTS trigger_check_matches ON winks;
CREATE TRIGGER trigger_check_matches
  AFTER INSERT ON winks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_for_matches();