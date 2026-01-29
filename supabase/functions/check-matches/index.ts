import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting match check cron job...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all active winks (not expired)
    const { data: winks, error: winksError } = await supabase
      .from('winks')
      .select('*')
      .gt('expires_at', new Date().toISOString())

    if (winksError) {
      console.error('Error fetching winks:', winksError)
      throw winksError
    }

    console.log(`Found ${winks?.length || 0} active winks`)

    if (!winks || winks.length < 2) {
      console.log('Not enough winks to check for matches')
      return new Response(
        JSON.stringify({ message: 'Not enough winks to check for matches', matchesCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get existing matches to avoid duplicates
    const { data: existingMatches, error: matchesError } = await supabase
      .from('matches')
      .select('user_a, user_b')

    if (matchesError) {
      console.error('Error fetching existing matches:', matchesError)
      throw matchesError
    }

    const matchedPairs = new Set(
      (existingMatches || []).map(m => 
        [m.user_a, m.user_b].sort().join('-')
      )
    )

    const EARTH_RADIUS = 6371000 // meters
    let matchesCreated = 0

    // Check each pair of winks
    for (let i = 0; i < winks.length; i++) {
      for (let j = i + 1; j < winks.length; j++) {
        const w1 = winks[i]
        const w2 = winks[j]

        // Skip if same user
        if (w1.user_id === w2.user_id) continue

        // Check if already matched
        const pairKey = [w1.user_id, w2.user_id].sort().join('-')
        if (matchedPairs.has(pairKey)) continue

        // Calculate distance using Haversine formula
        const lat1 = w1.lat * Math.PI / 180
        const lat2 = w2.lat * Math.PI / 180
        const dLat = (w2.lat - w1.lat) * Math.PI / 180
        const dLng = (w2.lng - w1.lng) * Math.PI / 180

        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
        const distance = EARTH_RADIUS * 2 * Math.asin(Math.sqrt(a))

        // Check if within radius
        const maxRadius = Math.min(w1.radius, w2.radius)
        if (distance > maxRadius) continue

        // Check time overlap (within 10 minutes, accounting for time_offset)
        const time1 = new Date(w1.created_at).getTime() + (w1.time_offset * 60 * 1000)
        const time2 = new Date(w2.created_at).getTime() + (w2.time_offset * 60 * 1000)
        const timeDiff = Math.abs(time1 - time2) / 1000 // in seconds

        if (timeDiff > 600) continue // 10 minutes

        // Create match
        const userA = w1.user_id < w2.user_id ? w1.user_id : w2.user_id
        const userB = w1.user_id < w2.user_id ? w2.user_id : w1.user_id

        console.log(`Creating match between ${userA} and ${userB}`)

        const { error: insertError } = await supabase
          .from('matches')
          .insert({
            user_a: userA,
            user_b: userB,
            wink_id: w1.id
          })

        if (insertError) {
          console.error('Error creating match:', insertError)
        } else {
          matchesCreated++
          matchedPairs.add(pairKey)
        }
      }
    }

    console.log(`Match check complete. Created ${matchesCreated} new matches.`)

    return new Response(
      JSON.stringify({ 
        message: 'Match check complete', 
        winksChecked: winks.length,
        matchesCreated 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in check-matches function:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})