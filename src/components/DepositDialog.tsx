import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DEPOSIT_AMOUNTS = [50, 100, 200, 500, 1000];

const DepositDialog: React.FC<DepositDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: customAmount ? parseFloat(customAmount) : amount,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create deposit');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Failed to load Stripe');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) throw stripeError;

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating deposit:', error);
      setError(error instanceof Error ? error.message : 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Adicionar Saldo
          </Dialog.Title>
          
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escolha um valor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DEPOSIT_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    className={`p-3 text-center rounded-lg border ${
                      amount === value && !customAmount
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setAmount(value);
                      setCustomAmount('');
                    }}
                  >
                    R$ {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou digite um valor personalizado
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="number"
                  min="10"
                  step="0.01"
                  className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-black focus:border-black"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(0);
                  }}
                  placeholder="Digite o valor"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Valor do depósito</span>
                <span className="font-medium">
                  R$ {customAmount ? parseFloat(customAmount).toFixed(2) : amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              onClick={handleDeposit}
              className="flex-1"
              disabled={loading || (!amount && !customAmount)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? 'Processando...' : 'Continuar para pagamento'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
          
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

export default DepositDialog;