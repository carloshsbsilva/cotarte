import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import stripePromise from '../lib/stripe';

interface BuySharesDialogProps {
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    pricePerShare: number;
    totalShares: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentForm: React.FC<{
  onSuccess: () => void;
  onError: (error: Error) => void;
  loading: boolean;
}> = ({ onSuccess, onError, loading }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(error);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      onError(err as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full"
      >
        {loading ? 'Processando...' : 'Pagar'}
      </Button>
    </form>
  );
};

const BuySharesDialog: React.FC<BuySharesDialogProps> = ({ artwork, open, onOpenChange }) => {
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setShowPayment(false);
    setQuantity(1);
    setClientSecret(null);
    setError(null);
    onOpenChange(false);
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          artworkId: artwork.id,
          quantity,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    handleClose();
    // You might want to refresh the artwork data or show a success message
  };

  const handlePaymentError = (error: Error) => {
    setError(error.message);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            {showPayment ? 'Pagamento' : 'Comprar Cotas'}
          </Dialog.Title>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {showPayment && clientSecret ? (
            <Elements stripe={stripePromise} options={{ 
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#000000',
                },
              },
            }}>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Resumo da compra</p>
                <p className="font-medium">{quantity} cotas de {artwork.title}</p>
                <p className="text-lg font-bold mt-1">
                  Total: R$ {(quantity * artwork.pricePerShare).toFixed(2)}
                </p>
              </div>

              <PaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                loading={loading}
              />
            </Elements>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Obra</p>
                <p className="font-medium">{artwork.title}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Quantidade de cotas
                </label>
                <input
                  type="number"
                  min="1"
                  max={artwork.totalShares}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Valor por cota</p>
                <p className="font-medium">
                  R$ {artwork.pricePerShare.toFixed(2)}
                </p>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">
                  R$ {(quantity * artwork.pricePerShare).toFixed(2)}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleContinue}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Continuar para pagamento'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BuySharesDialog;