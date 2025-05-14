import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess?: () => void;
}

const WITHDRAW_AMOUNTS = [50, 100, 200, 500, 1000];

const WithdrawDialog: React.FC<WithdrawDialogProps> = ({ 
  open, 
  onOpenChange, 
  balance,
  onSuccess 
}) => {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);
    
    setError('');
    
    if (value === '') {
      setCustomAmount('');
      setAmount(0);
      return;
    }

    if (numericValue > balance) {
      setError(`O valor máximo para saque é R$ ${balance.toFixed(2)}`);
      setCustomAmount(balance.toString());
      setAmount(0);
      return;
    }

    if (numericValue < 10) {
      setError('O valor mínimo para saque é R$ 10,00');
    }

    setCustomAmount(value);
    setAmount(0);
  };

  const getCurrentAmount = () => {
    if (customAmount) {
      const parsedAmount = parseFloat(customAmount);
      return isNaN(parsedAmount) ? 0 : parsedAmount;
    }
    return amount;
  };

  const isValidAmount = () => {
    const currentAmount = getCurrentAmount();
    return currentAmount >= 10 && currentAmount <= balance && !loading;
  };

  const handleWithdraw = async () => {
    try {
      const withdrawAmount = getCurrentAmount();
      
      if (withdrawAmount > balance) {
        setError('Saldo insuficiente');
        return;
      }

      if (withdrawAmount < 10) {
        setError('O valor mínimo para saque é R$ 10,00');
        return;
      }

      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      onOpenChange(false);
      if (onSuccess) onSuccess();
      alert('Solicitação de saque realizada com sucesso! O valor será depositado em sua conta em até 2 dias úteis.');
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar saque. Tente novamente.');
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
            Sacar Saldo
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escolha um valor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WITHDRAW_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    className={`p-3 text-center rounded-lg border ${
                      amount === value && !customAmount
                        ? 'border-black bg-black text-white'
                        : value > balance
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setAmount(value);
                      setCustomAmount('');
                      setError('');
                    }}
                    disabled={value > balance}
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
                  max={balance}
                  step="0.01"
                  className={`pl-8 pr-4 py-2 w-full border rounded-lg focus:ring-black focus:border-black ${
                    error ? 'border-red-500' : 'border-gray-200'
                  }`}
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Digite o valor"
                />
              </div>
              {error && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Saldo disponível</span>
                <span className="font-medium">R$ {balance.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Valor do saque</span>
                <span className="font-medium">
                  R$ {getCurrentAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              onClick={handleWithdraw}
              className="flex-1"
              disabled={!isValidAmount()}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              {loading ? 'Processando...' : 'Confirmar saque'}
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

export default WithdrawDialog;