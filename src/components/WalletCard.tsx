import React, { useState } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Button } from './ui/button';
import DepositDialog from './DepositDialog';
import WithdrawDialog from './WithdrawDialog';

interface WalletCardProps {
  balance: number;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance }) => {
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Carteira</h3>
          <Wallet className="h-5 w-5 text-gray-400" />
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-500">Saldo disponível</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(balance)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => setDepositDialogOpen(true)}
            className="flex items-center justify-center"
          >
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Depositar
          </Button>
          <Button 
            onClick={() => setWithdrawDialogOpen(true)}
            variant="outline"
            className="flex items-center justify-center"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Sacar
          </Button>
        </div>
      </div>

      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
      />

      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        balance={balance}
      />
    </>
  );
};

export default WalletCard;