import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { PhysicalSaleProposal as PhysicalSaleProposalType } from '../types';

interface ProposalProps {
  proposal: PhysicalSaleProposalType;
  userShares: number;
  onVote: (vote: 'yes' | 'no') => void;
}

const PhysicalSaleProposal: React.FC<ProposalProps> = ({ proposal, userShares, onVote }) => {
  const votingPower = (userShares / proposal.votes.totalEligible) * 100;
  const timeLeft = new Date(proposal.expiresAt).getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-yellow-900">
            Proposta de Compra da Obra Original
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            {proposal.buyerName} ofereceu R$ {proposal.proposedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
            pela obra original. Esta proposta requer aprovação dos cotistas.
          </p>
          
          <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Seu poder de voto</span>
                <span className="font-medium">{votingPower.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tempo restante</span>
                <span className="font-medium">{daysLeft} dias</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Votos a favor</span>
                <span className="font-medium text-green-600">
                  {((proposal.votes.yes / proposal.votes.totalEligible) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Votos contra</span>
                <span className="font-medium text-red-600">
                  {((proposal.votes.no / proposal.votes.totalEligible) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {userShares > 0 && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => onVote('yes')}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aprovar venda
                </button>
                <button
                  onClick={() => onVote('no')}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeitar venda
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalSaleProposal;