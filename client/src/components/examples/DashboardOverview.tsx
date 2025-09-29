import DashboardOverview from '../DashboardOverview';

export default function DashboardOverviewExample() {
  // todo: remove mock functionality
  const mockData = {
    totalRewards: 15847.32,
    activeWallets: 4,
    lastUpdate: new Date().toISOString(),
    rewardChange: 12.5
  };

  return (
    <DashboardOverview 
      totalRewards={mockData.totalRewards}
      activeWallets={mockData.activeWallets}
      lastUpdate={mockData.lastUpdate}
      rewardChange={mockData.rewardChange}
    />
  );
}