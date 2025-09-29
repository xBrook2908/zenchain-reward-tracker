import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";

interface RewardDataPoint {
  date: string;
  stakingRewards: number;
  validatorRewards: number;
}

interface RewardChartProps {
  data: RewardDataPoint[];
  timeframe: '7d' | '30d' | '90d' | '1y';
  onTimeframeChange: (timeframe: '7d' | '30d' | '90d' | '1y') => void;
}

export default function RewardChart({ data, timeframe, onTimeframeChange }: RewardChartProps) {
  const maxValue = Math.max(
    ...data.map(d => d.stakingRewards + d.validatorRewards)
  );
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ] as const;

  return (
    <Card data-testid="card-reward-chart">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Reward Trends</CardTitle>
        </div>
        <div className="flex space-x-1">
          {timeframes.map(({ value, label }) => (
            <Badge
              key={value}
              variant={timeframe === value ? "default" : "outline"}
              className="cursor-pointer hover-elevate text-xs px-2 py-1"
              onClick={() => onTimeframeChange(value)}
              data-testid={`button-timeframe-${value}`}
            >
              {label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart visualization */}
          <div className="flex items-end space-x-1 h-32">
            {data.map((point, index) => {
              const totalRewards = point.stakingRewards + point.validatorRewards;
              const stakingHeight = (point.stakingRewards / maxValue) * 100;
              const validatorHeight = (point.validatorRewards / maxValue) * 100;
              
              return (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center space-y-1"
                  data-testid={`chart-bar-${index}`}
                >
                  <div className="w-full flex flex-col">
                    {/* Validator rewards (top) */}
                    <div 
                      className="w-full bg-chart-2 rounded-t"
                      style={{ height: `${validatorHeight}%` }}
                      title={`Validator: ${formatCurrency(point.validatorRewards)}`}
                    />
                    {/* Staking rewards (bottom) */}
                    <div 
                      className="w-full bg-chart-1 rounded-b"
                      style={{ height: `${stakingHeight}%` }}
                      title={`Staking: ${formatCurrency(point.stakingRewards)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground transform -rotate-45">
                    {formatDate(point.date)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-chart-1 rounded" />
              <span className="text-muted-foreground">Staking Rewards</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-chart-2 rounded" />
              <span className="text-muted-foreground">Validator Rewards</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}