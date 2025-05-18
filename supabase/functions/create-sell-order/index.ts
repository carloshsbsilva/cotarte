import { stripe } from '../_shared/stripe.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artworkId, quantity } = await req.json();
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Get user's Stripe Connect account ID
    const { data: stripeAccount, error: stripeError } = await supabase.rpc(
      'get_stripe_account_id',
      { user_id: user.id }
    );

    if (stripeError || !stripeAccount) {
      throw new Error('Stripe account not found');
    }

    // Verify user has enough shares
    const { data: userShares, error: sharesError } = await supabase
      .from('user_shares')
      .select('shares')
      .eq('user_id', user.id)
      .eq('artwork_id', artworkId)
      .single();

    if (sharesError || !userShares || userShares.shares < quantity) {
      throw new Error('Insufficient shares');
    }

    // Get artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('price_per_share')
      .eq('id', artworkId)
      .single();

    if (artworkError) throw artworkError;

    // Calculate amount in cents
    const amount = Math.round(quantity * artwork.price_per_share * 100);
    const platformFee = Math.round(amount * 0.05); // 5% platform fee

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: amount - platformFee,
      currency: 'brl',
      destination: stripeAccount.stripe_account_id,
      metadata: {
        artworkId,
        userId: user.id,
        quantity: quantity.toString(),
      },
    });

    return new Response(
      JSON.stringify({ transferId: transfer.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});