import Stripe from 'npm:stripe@14.18.0';

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});