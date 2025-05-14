import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import CheckoutPage from './CheckoutPage';

interface SellSharesDialogProps {
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    pricePerShare: number;
  };
  userShares: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SellSharesDialog: React.FC<SellSharesDialogProps> = ({
  artwork,
  userShares,
  open,
  onOpenChange,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleClose = () => {
    setShowCheckout(false);
    setQuantity(1);
    onOpenChange(false);
  };

  if (showCheckout) {
    return (
      <Dialog.Root open={open} onOpenChange={handleClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed inset-0 overflow-y-auto">
            <CheckoutPage
              artwork={artwork}
              quantity={quantity}
              type="sell"
              onBack={() => setShowCheckout(false)}
              onSuccess={handleClose}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Vender Cotas
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Obra</p>
              <p className="font-medium">{artwork.title}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Suas cotas disponíveis</p>
              <p className="font-medium">{userShares}</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Quantidade para vender
              </label>
              <input
                type="number"
                min="1"
                max={userShares}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(userShares, parseInt(e.target.value) || 1)))}
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
              <p className="text-sm text-gray-500">Total a receber</p>
              <p className="text-xl font-bold">
                R$ {(quantity * artwork.pricePerShare).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                *Taxa da plataforma de 5% será deduzida do valor total
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              onClick={() => setShowCheckout(true)}
              className="flex-1"
            >
              Continuar
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
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

export default SellSharesDialog;