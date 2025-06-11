export const WALLET_CONNECT_OPTIONS = [
  { id: 'metamask', name: 'MetaMask', iconEmoji: '🦊' },
  { id: 'walletconnect', name: 'WalletConnect', iconEmoji: '🔗' },
  { id: 'coinbase', name: 'Coinbase Wallet', iconEmoji: '🏦' },
];

export const NETWORK_OPTIONS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'bsc', label: 'Binance Smart Chain' },
  { value: 'avalanche', label: 'Avalanche' },
  { value: 'fantom', label: 'Fantom' },
  { value: 'cronos', label: 'Cronos' },
  { value: 'base', label: 'Base' },
  { value: 'solana', label: 'Solana' },
];

export const BORROWING_PROTOCOL_OPTIONS = [
  { value: 'balancer-v2', label: 'Balancer V2' },
  { value: 'balancer-v3', label: 'Balancer V3' },
  { value: 'balancer', label: 'Balancer (Generic)' },
  { value: 'aave-ark', label: 'Aave ARK' },
  { value: 'aave-v2', label: 'Aave V2' },
  { value: 'aave-v3', label: 'Aave V3' },
  { value: 'uniswap-v1', label: 'Uniswap V1 (Lending)' }, // Assuming for lending context
  { value: 'uniswap-v2', label: 'Uniswap V2 (Lending)' },
  { value: 'uniswap-v3', label: 'Uniswap V3 (Lending)' },
  { value: 'uniswap-v4', label: 'Uniswap V4 (Lending)' },
  { value: 'compound', label: 'Compound' }, // Added from original PRD
  { value: 'makerdao', label: 'MakerDAO' }, // Added from original PRD
  { value: 'sparklend', label: 'SparkLend' }, // Added from original PRD
];

export const ARBITRAGE_FROM_SWAP_OPTIONS = [
  { value: 'uniswap', label: 'Uniswap' },
  { value: 'sushiswap', label: 'Sushiswap' },
  { value: 'kyberswap', label: 'Kyberswap' },
  { value: 'pancakeswap', label: 'Pancakeswap' },
  { value: 'curve', label: 'Curve Finance' }, // Added from original PRD
  { value: 'balancer', label: 'Balancer' }, // Added from original PRD
];

export const ARBITRAGE_TO_SWAP_OPTIONS = [
  { value: 'sushiswap', label: 'Sushiswap' },
  { value: 'coreswap', label: 'Coreswap' },
  { value: 'linxswap', label: 'Linxswap' },
  { value: 'doxswap', label: 'Doxswap' },
  { value: 'optimumswap', label: 'Optimumswap' },
  { value: 'uniswap', label: 'Uniswap' }, // Added for more pairs
  { value: 'pancakeswap', label: 'Pancakeswap' }, // Added for more pairs
];

export const COIN_OPTIONS = [
  { value: 'USDT', label: 'USDT' },
  { value: 'USDC', label: 'USDC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'WETH', label: 'WETH' },
  { value: 'WBTC', label: 'WBTC' },
  { value: 'BTC', label: 'BTC' },
  { value: 'DOX', label: 'DOX' },
  { value: 'LINX', label: 'LINX' },
  { value: 'MAGIC', label: 'MAGIC' },
  { value: 'DAI', label: 'DAI' }, // Added from original PRD
  { value: 'LINK', label: 'LINK' }, // Added from original PRD
  { value: 'MATIC', label: 'MATIC' }, // Added from original PRD
];

// Merging old DEX_OPTIONS and TOKEN_PAIR_OPTIONS for reference, will be superseded by new specific ones
export const LEGACY_DEX_OPTIONS = [
  { id: 'uniswap', label: 'Uniswap' },
  { id: 'sushiswap', label: 'Sushiswap' },
  { id: 'pancakeswap', label: 'PancakeSwap' },
  { id: 'curve', label: 'Curve Finance' },
  { id: 'balancer', label: 'Balancer' },
];

export const LEGACY_TOKEN_PAIR_OPTIONS = [
  { value: 'ETH/USDC', label: 'ETH/USDC' },
  { value: 'WBTC/ETH', label: 'WBTC/ETH' },
  { value: 'DAI/USDT', label: 'DAI/USDT' },
  { value: 'LINK/ETH', label: 'LINK/ETH' },
  { value: 'MATIC/USDC', label: 'MATIC/USDC' },
];
