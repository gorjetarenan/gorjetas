import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try to parse body - could be JSON or form-urlencoded
    let params: Record<string, string> = {};
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const urlParams = new URLSearchParams(text);
      urlParams.forEach((value, key) => { params[key] = value; });
    } else if (contentType.includes('application/json') || req.method === 'POST') {
      try {
        params = await req.json();
      } catch {
        // If JSON parse fails, try URL params from body
        const text = await req.text();
        if (text) {
          const urlParams = new URLSearchParams(text);
          urlParams.forEach((value, key) => { params[key] = value; });
        }
      }
    }

    // Detect postback: if player_id is present OR action is 'postback'
    const playerId = params.player_id || params.playerid || params['Player ID'];
    const isPostback = playerId || params.action === 'postback';

    if (isPostback) {
      if (!playerId) {
        return new Response(
          JSON.stringify({ error: 'player_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('validated_players')
        .upsert(
          {
            player_id: playerId,
            currency: params.currency || params.Currency || null,
            registration_date: params.registration_date || params['Registration Date'] || null,
            type: params.type || params.Type || null,
          },
          { onConflict: 'player_id' }
        );

      if (error) {
        console.error('Error inserting validated player:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to store player' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Validated player:', playerId);
      return new Response(
        JSON.stringify({ success: true, player_id: playerId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: Send winner email (original functionality)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { to, subject, body: emailBody, fromName } = params as any;

    if (!to || !subject || !emailBody) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const htmlBody = (emailBody as string).replace(/\n/g, '<br>');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <noreply@renanpeterlini.com.br>`,
        to: [to],
        subject,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: data }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
