// Public Mapbox token proxy. The token is a pk.* (public scope) key,
// safe to send to the browser, but we keep it server-side so it can be
// rotated without redeploying the client.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const token = Deno.env.get('MAPBOX_PUBLIC_TOKEN') ?? '';
  return new Response(JSON.stringify({ token }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});