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
    const { amount } = await req.json();
    
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

    // Verify user has enough balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError) throw walletError;
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Get stripe account ID using the secure function
    const { data: stripeData, error: stripeError } = await supabase
      .rpc('get_stripe_account_id', { user_id: user.id });

    if (stripeError || !stripeData) {
      throw new Error('Failed to get Stripe account');
    }

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'brl',
      destination: stripeData,
      metadata: {
        type: 'withdrawal',
        userId: user.id,
      },
    });

    // Process withdrawal in database
    const { error: withdrawalError } = await supabase.rpc('process_withdrawal', {
      p_user_id: user.id,
      p_amount: amount,
      p_transfer_id: transfer.id
    });

    if (withdrawalError) throw withdrawalError;

    return new Response(
      JSON.stringify({ success: true }),
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