export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistName?: string;
  description: string;
  imageUrl: string;
  additionalImages: string[];
  videoUrl?: string;
  artistStatement?: string;
  pricePerShare: number;
  originalPrice: number;
  marketValue: number;
  totalShares: number;
  sharesSold: number;
  investorsCount: number;
  createdAt: string;
  categories: string[];
  status: 'active' | 'inactive' | 'sold';
  ipoEndDate?: string;
  physicalSaleProposal?: PhysicalSaleProposal;
}

export interface PriceHistoryPoint {
  id: string;
  artworkId: string;
  date: string;
  price: number;
}

export interface Transaction {
  id: string;
  artworkId: string;
  artworkTitle: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'physical_sale_payout';
  shares?: number;
  pricePerShare?: number;
  amount?: number;
  totalAmount: number;
  platformFee: number;
  feeType: 'ipo' | 'secondary' | 'none';
  date: string;
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Comment {
  id: string;
  artworkId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  date: string;
  likes: number;
}

export interface UserInvestment {
  id: string;
  userId: string;
  artworkId: string;
  artworkTitle: string;
  artworkImageUrl: string;
  artistName: string;
  shares: number;
  initialPricePerShare: number;
  currentPricePerShare: number;
  percentageChange: number;
  purchaseDate: string;
}

export interface PhysicalSaleProposal {
  id: string;
  artworkId: string;
  buyerName: string;
  buyerEmail: string;
  proposedPrice: number;
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  votes: {
    yes: number;
    no: number;
    totalEligible: number;
  };
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalInvested: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}