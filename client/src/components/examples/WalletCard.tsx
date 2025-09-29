import WalletCard from '../WalletCard';

export default function WalletCardExample() {
  // todo: remove mock functionality
  const handleView = (id: string) => {
    console.log('View wallet details:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete wallet:', id);
  };

  return (
    <div className="max-w-sm">
      <WalletCard
        id="wallet-1"
        address="0x742d35Cc6634C0532925a3b8D3Ac19C7C1C3a67e"
        label="Main Staking Wallet"
        stakingRewards={8543.21}
        validatorRewards={2104.78}
        isConnected={true}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
}