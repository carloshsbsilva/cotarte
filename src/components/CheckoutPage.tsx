import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { PaymentFormWrapper } from './PaymentForm';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutPageProps {
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    pricePerShare: number;
  };
  quantity: number;
  type: 'buy' | 'sell';
  onBack: () => void;
  onSuccess: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  artwork,
  quantity,
  type,
  onBack,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalAmount = artwork.pricePerShare * quantity;
  const platformFee = totalAmount * 0.05; // 5% platform fee
  const finalAmount = type === 'buy' ? totalAmount + platformFee : totalAmount - platformFee;

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            artworkId: artwork.id,
            quantity,
            type,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    if (type === 'buy') {
      initializePayment();
    }
  }, [artwork.id, quantity, type]);

  const handleSellConfirmation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the sell order endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-sell-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          artworkId: artwork.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle successful sale
      handlePaymentSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process sale');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    onSuccess();
    navigate(`/artwork/${artwork.id}`);
  };

  const handlePaymentError = (error: Error) => {
    setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {type === 'buy' ? 'Finalizar Compra' : 'Finalizar Venda'}
          </h1>

          <div className="flex items-center mb-6">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="ml-4">
              <h2 className="font-medium text-gray-900">{artwork.title}</h2>
              <p className="text-sm text-gray-500">{quantity} cotas</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Valor por cota</span>
              <span className="font-medium">
                R$ {artwork.pricePerShare.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantidade</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">
                R$ {totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxa da plataforma (5%)</span>
              <span className="font-medium">
                R$ {platformFee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>{type === 'buy' ? 'Total a pagar' : 'Total a receber'}</span>
              <span>R$ {finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {type === 'buy' ? (
          clientSecret ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Informações de Pagamento
                </h2>
              </div>
              <PaymentFormWrapper
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
              ) : (
                <Button onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              )}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Wallet className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Confirmar Venda
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Ao confirmar a venda, suas cotas serão listadas no mercado e o valor será
              depositado em sua conta assim que a venda for concluída.
            </p>
            <Button
              onClick={handleSellConfirmation}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar Venda'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;