import RewardChart from '../RewardChart';
import { useState } from 'react';

export default function RewardChartExample() {
  // todo: remove mock functionality
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const mockData = [
    { date: '2024-01-01', stakingRewards: 120, validatorRewards: 80 },
    { date: '2024-01-05', stakingRewards: 135, validatorRewards: 95 },
    { date: '2024-01-10', stakingRewards: 142, validatorRewards: 88 },
    { date: '2024-01-15', stakingRewards: 128, validatorRewards: 102 },
    { date: '2024-01-20', stakingRewards: 155, validatorRewards: 110 },
    { date: '2024-01-25', stakingRewards: 148, validatorRewards: 98 },
    { date: '2024-01-30', stakingRewards: 162, validatorRewards: 115 }
  ];

  const handleTimeframeChange = (newTimeframe: '7d' | '30d' | '90d' | '1y') => {
    console.log('Timeframe changed:', newTimeframe);
    setTimeframe(newTimeframe);
  };

  return (
    <RewardChart
      data={mockData}
      timeframe={timeframe}
      onTimeframeChange={handleTimeframeChange}
    />
  );
}