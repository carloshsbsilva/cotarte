import { Artwork, PriceHistoryPoint, Transaction, Comment, UserInvestment } from '../types';

// Sample artwork data
export const mockArtworks: Artwork[] = [
  {
    id: '1',
    title: 'Convergência Abstrata',
    artist: 'Ana Mendes',
    description: 'Uma exploração de formas geométricas que representam a convergência entre o caos e a ordem. Criada com técnicas mistas sobre tela.',
    imageUrl: 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    additionalImages: [],
    pricePerShare: 350.00,
    initialPricePerShare: 250.00,
    percentageChange: 40.00,
    totalShares: 100,
    investorsCount: 47,
    createdAt: '2025-01-15T10:30:00Z',
    categories: ['Pintura', 'Abstrato'],
    originalPrice: 25000.00
  },
  {
    id: '2',
    title: 'Horizonte Digital',
    artist: 'Carlos Freitas',
    description: 'Uma obra digital que explora a intersecção entre paisagens naturais e ambientes virtuais, questionando os limites da realidade.',
    imageUrl: 'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    additionalImages: [],
    pricePerShare: 180.00,
    initialPricePerShare: 200.00,
    percentageChange: -10.00,
    totalShares: 200,
    investorsCount: 89,
    createdAt: '2025-02-03T14:20:00Z',
    categories: ['Digital', 'Paisagem'],
    originalPrice: 40000.00
  },
  {
    id: '3',
    title: 'Fragmentos de Memória',
    artist: 'Luísa Ribeiro',
    description: 'Uma série fotográfica que retrata objetos do cotidiano em estados de decomposição, refletindo sobre a impermanência e a memória.',
    imageUrl: 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    additionalImages: [],
    pricePerShare: 420.00,
    initialPricePerShare: 300.00,
    percentageChange: 40.00,
    totalShares: 50,
    investorsCount: 28,
    createdAt: '2025-01-22T09:15:00Z',
    categories: ['Fotografia', 'Conceitual'],
    originalPrice: 15000.00
  },
  {
    id: '4',
    title: 'Equilíbrio Urbano',
    artist: 'Marcelo Santos',
    description: 'Uma escultura que utiliza materiais reciclados da cidade para criar uma metáfora sobre o equilíbrio entre desenvolvimento urbano e sustentabilidade.',
    imageUrl: 'https://images.pexels.com/photos/2570059/pexels-photo-2570059.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    additionalImages: [],
    pricePerShare: 550.00,
    initialPricePerShare: 500.00,
    percentageChange: 10.00,
    totalShares: 40,
    investorsCount: 15,
    createdAt: '2025-02-10T11:45:00Z',
    categories: ['Escultura', 'Urbano'],
    originalPrice: 20000.00
  },
  {
    id: '5',
    title: 'Sinfonia das Cores',
    artist: 'Beatriz Almeida',
    description: 'Uma pintura vibrante que traduz elementos musicais em expressões visuais, explorando a sinestesia entre som e cor.',
    imageUrl: 'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    additionalImages: [],
    pricePerShare: 280.00,
    initialPricePerShare: 150.00,
    percentageChange: 86.67,
    totalShares: 80,
    investorsCount: 62,
    createdAt: '2025-01-05T16:30:00Z',
    categories: ['Pintura', 'Abstrato'],
    originalPrice: 12000.00
  },
  {
    id: '6',
    title: 'Reflexões Paralelas',
    artist: 'Fernando Costa',
    description: 'Uma instalação com espelhos e projeções que cria um ambiente imersivo, questionando percepções de realidade e identidade.',
    imageUrl: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    additionalImages: [],
    pricePerShare: 620.00,
    initialPricePerShare: 700.00,
    percentageChange: -11.43,
    totalShares: 30,
    investorsCount: 19,
    createdAt: '2025-02-18T13:10:00Z',
    categories: ['Instalação', 'Interativo'],
    originalPrice: 21000.00
  }
];

// Sample price history data
export const mockPriceHistory: PriceHistoryPoint[] = [
  { id: '1-1', artworkId: '1', date: '2025-01-15T00:00:00Z', price: 250.00 },
  { id: '1-2', artworkId: '1', date: '2025-01-20T00:00:00Z', price: 260.00 },
  { id: '1-3', artworkId: '1', date: '2025-01-25T00:00:00Z', price: 275.00 },
  { id: '1-4', artworkId: '1', date: '2025-01-30T00:00:00Z', price: 290.00 },
  { id: '1-5', artworkId: '1', date: '2025-02-05T00:00:00Z', price: 305.00 },
  { id: '1-6', artworkId: '1', date: '2025-02-10T00:00:00Z', price: 320.00 },
  { id: '1-7', artworkId: '1', date: '2025-02-15T00:00:00Z', price: 335.00 },
  { id: '1-8', artworkId: '1', date: '2025-02-20T00:00:00Z', price: 350.00 },
  
  { id: '2-1', artworkId: '2', date: '2025-02-03T00:00:00Z', price: 200.00 },
  { id: '2-2', artworkId: '2', date: '2025-02-08T00:00:00Z', price: 195.00 },
  { id: '2-3', artworkId: '2', date: '2025-02-13T00:00:00Z', price: 190.00 },
  { id: '2-4', artworkId: '2', date: '2025-02-18T00:00:00Z', price: 185.00 },
  { id: '2-5', artworkId: '2', date: '2025-02-23T00:00:00Z', price: 180.00 },
  
  { id: '3-1', artworkId: '3', date: '2025-01-22T00:00:00Z', price: 300.00 },
  { id: '3-2', artworkId: '3', date: '2025-01-27T00:00:00Z', price: 320.00 },
  { id: '3-3', artworkId: '3', date: '2025-02-01T00:00:00Z', price: 350.00 },
  { id: '3-4', artworkId: '3', date: '2025-02-06T00:00:00Z', price: 380.00 },
  { id: '3-5', artworkId: '3', date: '2025-02-11T00:00:00Z', price: 400.00 },
  { id: '3-6', artworkId: '3', date: '2025-02-16T00:00:00Z', price: 420.00 }
];

// Sample transaction data
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    artworkId: '1',
    artworkTitle: 'Convergência Abstrata',
    type: 'buy',
    shares: 5,
    pricePerShare: 250.00,
    totalAmount: 1250.00,
    platformFee: 62.50,
    date: '2025-01-15T10:45:00Z',
    buyer: {
      id: 'user1',
      name: 'Marina Silva',
      email: 'marina.silva@email.com'
    },
    seller: {
      id: 'platform',
      name: 'Cotarte Platform',
      email: 'sales@cotarte.com'
    }
  },
  {
    id: 'tx-002',
    artworkId: '1',
    artworkTitle: 'Convergência Abstrata',
    type: 'sell',
    shares: 2,
    pricePerShare: 320.00,
    totalAmount: 640.00,
    platformFee: 32.00,
    date: '2025-02-10T11:20:00Z',
    buyer: {
      id: 'user4',
      name: 'Carlos Andrade',
      email: 'carlos.andrade@email.com'
    },
    seller: {
      id: 'user1',
      name: 'Marina Silva',
      email: 'marina.silva@email.com'
    }
  },
  {
    id: 'tx-003',
    artworkId: '2',
    artworkTitle: 'Horizonte Digital',
    type: 'buy',
    shares: 7,
    pricePerShare: 200.00,
    totalAmount: 1400.00,
    platformFee: 70.00,
    date: '2025-02-03T15:10:00Z',
    buyer: {
      id: 'user2',
      name: 'João Pereira',
      email: 'joao.pereira@email.com'
    },
    seller: {
      id: 'platform',
      name: 'Cotarte Platform',
      email: 'sales@cotarte.com'
    }
  },
  {
    id: 'tx-004',
    artworkId: '2',
    artworkTitle: 'Horizonte Digital',
    type: 'physical_sale',
    shares: 200,
    pricePerShare: 195.00,
    totalAmount: 45000.00,
    platformFee: 2250.00,
    date: '2025-02-20T09:15:00Z',
    buyer: {
      id: 'collector1',
      name: 'Ricardo Monteiro',
      email: 'ricardo.monteiro@email.com'
    },
    seller: {
      id: 'platform',
      name: 'Cotarte Platform',
      email: 'sales@cotarte.com'
    }
  }
];

// Sample comment data
export const mockComments: Comment[] = [
  { 
    id: '1-c1', 
    artworkId: '1', 
    userId: 'user3', 
    userName: 'Ana Ferreira', 
    userAvatar: null, 
    content: 'A combinação de cores nesta obra é fascinante. Estou realmente impressionada com a técnica do artista em criar equilíbrio entre formas tão distintas.', 
    date: '2025-01-26T13:20:00Z', 
    likes: 8 
  },
  { 
    id: '1-c2', 
    artworkId: '1', 
    userId: 'user5', 
    userName: 'Lucia Santos', 
    userAvatar: null, 
    content: 'Essa obra me lembra muito o trabalho de Kandinsky, especialmente na maneira como as formas parecem dançar na tela. Incrível!', 
    date: '2025-02-01T09:45:00Z', 
    likes: 5 
  },
  { 
    id: '1-c3', 
    artworkId: '1', 
    userId: 'user2', 
    userName: 'João Pereira', 
    userAvatar: null, 
    content: 'Acabei de aumentar meu investimento nesta obra. O potencial de valorização é imenso considerando a trajetória da artista.', 
    date: '2025-02-12T16:30:00Z', 
    likes: 3 
  }
];

// Sample user investment data
export const mockUserInvestments: UserInvestment[] = [
  { 
    id: 'inv1', 
    userId: 'currentUser', 
    artworkId: '1', 
    artworkTitle: 'Convergência Abstrata', 
    artworkImageUrl: 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
    artistName: 'Ana Mendes', 
    shares: 3, 
    initialPricePerShare: 260.00, 
    currentPricePerShare: 350.00, 
    percentageChange: 34.62, 
    purchaseDate: '2025-01-20T14:30:00Z' 
  },
  { 
    id: 'inv2', 
    userId: 'currentUser', 
    artworkId: '3', 
    artworkTitle: 'Fragmentos de Memória', 
    artworkImageUrl: 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
    artistName: 'Luísa Ribeiro', 
    shares: 2, 
    initialPricePerShare: 350.00, 
    currentPricePerShare: 420.00, 
    percentageChange: 20.00, 
    purchaseDate: '2025-02-01T09:45:00Z' 
  },
  { 
    id: 'inv3', 
    userId: 'currentUser', 
    artworkId: '5', 
    artworkTitle: 'Sinfonia das Cores', 
    artworkImageUrl: 'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 
    artistName: 'Beatriz Almeida', 
    shares: 5, 
    initialPricePerShare: 200.00, 
    currentPricePerShare: 280.00, 
    percentageChange: 40.00, 
    purchaseDate: '2025-01-18T11:20:00Z' 
  }
];