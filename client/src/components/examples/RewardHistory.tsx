import RewardHistory from '../RewardHistory';

export default function RewardHistoryExample() {
  // todo: remove mock functionality
  const mockRewards = [
    {
      id: '1',
      date: '2024-01-30T10:30:00Z',
      walletAddress: '0x742d35Cc6634C0532925a3b8D3Ac19C7C1C3a67e',
      walletLabel: 'Main Staking Wallet',
      type: 'staking' as const,
      amount: 142.50,
      transactionHash: '0xabc123def456789012345678901234567890abcdef123456789012345678901234'
    },
    {
      id: '2',
      date: '2024-01-29T15:45:00Z',
      walletAddress: '0x8f3c7a9e2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
      walletLabel: 'Validator Node 1',
      type: 'validator' as const,
      amount: 89.75,
      transactionHash: '0xdef456789012345678901234567890abcdef123456789012345678901234abc123'
    },
    {
      id: '3',
      date: '2024-01-29T08:20:00Z',
      walletAddress: '0x742d35Cc6634C0532925a3b8D3Ac19C7C1C3a67e',
      walletLabel: 'Main Staking Wallet',
      type: 'staking' as const,
      amount: 127.25,
      transactionHash: '0x123456789012345678901234567890abcdef123456789012345678901234def456'
    },
    {
      id: '4',
      date: '2024-01-28T14:15:00Z',
      walletAddress: '0x5e2f8b7c1a9d3e6f4a8b2c5d9e1f7a3b6c8d4e9f',
      walletLabel: 'Secondary Wallet',
      type: 'validator' as const,
      amount: 203.80,
      transactionHash: '0x789012345678901234567890abcdef123456789012345678901234abc123def456'
    }
  ];

  const handleExport = () => {
    console.log('Export rewards data');
  };

  return (
    <RewardHistory 
      rewards={mockRewards}
      onExport={handleExport}
    />
  );
}