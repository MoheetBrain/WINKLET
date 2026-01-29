import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadius = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { winkId, userId } = await req.json();
    
    if (!winkId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing winkId or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking matches for wink ${winkId} by user ${userId}`);

    // Get the newly created wink
    const { data: newWink, error: winkError } = await supabase
      .from('winks')
      .select('*')
      .eq('id', winkId)
      .single();

    if (winkError || !newWink) {
      console.error('Error fetching wink:', winkError);
      return new Response(
        JSON.stringify({ error: 'Wink not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all other active winks
    const { data: otherWinks, error: otherError } = await supabase
      .from('winks')
      .select('*')
      .neq('user_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (otherError) {
      console.error('Error fetching other winks:', otherError);
    }

    const nearMatches: any[] = [];
    const matches: any[] = [];

    // Check each wink for potential match
    for (const wink of (otherWinks || [])) {
      const distance = calculateDistance(newWink.lat, newWink.lng, wink.lat, wink.lng);
      const maxRadius = Math.min(newWink.radius, wink.radius);
      
      // Calculate time difference (accounting for time_offset)
      const newWinkTime = new Date(newWink.created_at).getTime() + (newWink.time_offset * 60000);
      const otherWinkTime = new Date(wink.created_at).getTime() + (wink.time_offset * 60000);
      const timeDiffMinutes = Math.abs(newWinkTime - otherWinkTime) / 60000;

      const isWithinRadius = distance <= maxRadius;
      const isWithinTime = timeDiffMinutes <= 10;

      // Add to near matches for debug (within 2km)
      if (distance <= 2000) {
        nearMatches.push({
          winkId: wink.id,
          userId: wink.user_id,
          distance: Math.round(distance),
          maxRadius,
          timeDiffMinutes: Math.round(timeDiffMinutes * 10) / 10,
          isWithinRadius,
          isWithinTime,
          isMatch: isWithinRadius && isWithinTime,
        });
      }

      // Check if this is a match
      if (isWithinRadius && isWithinTime) {
        // Check if match already exists (created by trigger)
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .or(`and(user_a.eq.${userId},user_b.eq.${wink.user_id}),and(user_a.eq.${wink.user_id},user_b.eq.${userId})`)
          .maybeSingle();

        if (existingMatch) {
          matches.push({
            matchId: existingMatch.id,
            otherUserId: wink.user_id,
            distance: Math.round(distance),
            timeDiffMinutes: Math.round(timeDiffMinutes * 10) / 10,
          });

          // Expire both winks so they can't create more matches
          const now = new Date().toISOString();
          await supabase
            .from('winks')
            .update({ expires_at: now })
            .in('id', [newWink.id, wink.id]);
          
          console.log(`Expired winks ${newWink.id} and ${wink.id} after match`);
        }
      }
    }

    console.log(`Found ${matches.length} matches and ${nearMatches.length} near winks`);

    return new Response(
      JSON.stringify({
        success: true,
        wink: {
          id: newWink.id,
          lat: newWink.lat,
          lng: newWink.lng,
          radius: newWink.radius,
        },
        matches,
        nearMatches: nearMatches.sort((a, b) => a.distance - b.distance),
        totalActiveWinks: otherWinks?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in check-wink-matches:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});