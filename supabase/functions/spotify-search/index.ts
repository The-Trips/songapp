import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 1. Get the search query from your React app
  const { query, type } = await req.json()

  // 2. Get your secret keys from Supabase environment
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')

  // 3. Ask Spotify for a temporary "Access Token"
  const authResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: 'grant_type=client_credentials',
  })
  const authData = await authResponse.json()
  const accessToken = authData.access_token

  // 4. Use that token to search for the song/album
  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=5`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )
  const data = await searchResponse.json()

  // 5. Send the result back to your app
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  })
})