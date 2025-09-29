import WalletLeaderboard from '../WalletLeaderboard';

export default function WalletLeaderboardExample() {
  // todo: remove mock functionality
  const mockWallets = [
    {
      id: '1',
      address: '0x742d35Cc6634C0532925a3b8D3Ac19C7C1C3a67e',
      label: 'Main Staking Wallet',
      totalRewards: 18543.21,
      totalRewardsUsd: 8344.44,
      stakingRewards: 18543.21,
      validatorRewards: 0,
      rank: 1,
      rewardChange24h: 15.3
    },
    {
      id: '2',
      address: '0x8f3c7a9e2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
      label: 'Validator Node 1',
      totalRewards: 17233.12,
      totalRewardsUsd: 7754.90,
      stakingRewards: 5245.67,
      validatorRewards: 11987.45,
      rank: 2,
      rewardChange24h: 22.7
    },
    {
      id: '3',
      address: '0x5e2f8b7c1a9d3e6f4a8b2c5d9e1f7a3b6c8d4e9f',
      label: 'Secondary Wallet',
      totalRewards: 8408.56,
      totalRewardsUsd: 3783.85,
      stakingRewards: 7876.44,
      validatorRewards: 532.12,
      rank: 3,
      rewardChange24h: 8.2
    },
    {
      id: '4',
      address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      label: 'DeFi Staking Pool',
      totalRewards: 6234.89,
      totalRewardsUsd: 2805.70,
      stakingRewards: 6234.89,
      validatorRewards: 0,
      rank: 4,
      rewardChange24h: -2.1
    },
    {
      id: '5',
      address: '0x9f8e7d6c5b4a39281706e5d4c3b2a1908f7e6d5c',
      label: 'Validator Node 2',
      totalRewards: 4567.23,
      totalRewardsUsd: 2055.25,
      stakingRewards: 1234.56,
      validatorRewards: 3332.67,
      rank: 5,
      rewardChange24h: 5.8
    }
  ];

  return (
    <WalletLeaderboard 
      wallets={mockWallets}
      showTop={5}
    />
  );
}