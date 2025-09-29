import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Download, Maximize2 } from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RewardDataPoint {
  date: string;
  stakingRewards: number;
  validatorRewards: number;
  totalRewards: number;
}

interface EnhancedRewardChartProps {
  data: RewardDataPoint[];
  timeframe: '7d' | '30d' | '90d' | '1y';
  onTimeframeChange: (timeframe: '7d' | '30d' | '90d' | '1y') => void;
  onExport?: () => void;
  onExpand?: () => void;
}

export default function EnhancedRewardChart({ 
  data, 
  timeframe, 
  onTimeframeChange, 
  onExport, 
  onExpand 
}: EnhancedRewardChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (timeframe === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ] as const;

  // Prepare chart data
  const chartData = {
    labels: data.map(point => formatDate(point.date)),
    datasets: [
      {
        label: 'Staking Rewards',
        data: data.map(point => point.stakingRewards),
        borderColor: 'hsl(var(--chart-1))',
        backgroundColor: 'hsl(var(--chart-1) / 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'hsl(var(--chart-1))',
        pointBorderColor: 'hsl(var(--background))',
        pointBorderWidth: 2,
      },
      {
        label: 'Validator Rewards',
        data: data.map(point => point.validatorRewards),
        borderColor: 'hsl(var(--chart-2))',
        backgroundColor: 'hsl(var(--chart-2) / 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'hsl(var(--chart-2))',
        pointBorderColor: 'hsl(var(--background))',
        pointBorderWidth: 2,
      },
      {
        label: 'Total Rewards',
        data: data.map(point => point.totalRewards),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.05)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: 'hsl(var(--primary))',
        pointBorderColor: 'hsl(var(--background))',
        pointBorderWidth: 3,
        borderWidth: 3,
        borderDash: [5, 5],
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: 'hsl(var(--foreground))',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            const date = data[context[0].dataIndex]?.date;
            return date ? new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : '';
          },
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.parsed.y);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'hsl(var(--border) / 0.3)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: 'hsl(var(--border) / 0.3)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          callback: function(value: any) {
            return formatCurrency(value);
          }
        },
        beginAtZero: true
      }
    },
    elements: {
      point: {
        hoverRadius: 8,
      }
    }
  };

  // Calculate statistics
  const totalRewards = data.reduce((sum, point) => sum + point.totalRewards, 0);
  const avgDailyReward = totalRewards / data.length;
  const bestDay = data.reduce((max, point) => 
    point.totalRewards > max.totalRewards ? point : max, data[0] || { totalRewards: 0 }
  );

  return (
    <Card className="col-span-2" data-testid="card-enhanced-reward-chart">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg font-medium">Reward Analytics</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.length} data points
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Timeframe Selection */}
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
          
          {/* Action Buttons */}
          <div className="flex space-x-1">
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                data-testid="button-export-chart"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            {onExpand && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExpand}
                data-testid="button-expand-chart"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistics Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold" data-testid="text-total-period-rewards">
              {formatCurrency(totalRewards)}
            </div>
            <div className="text-xs text-muted-foreground">Total Rewards</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" data-testid="text-avg-daily-reward">
              {formatCurrency(avgDailyReward)}
            </div>
            <div className="text-xs text-muted-foreground">Daily Average</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" data-testid="text-best-day-reward">
              {formatCurrency(bestDay?.totalRewards || 0)}
            </div>
            <div className="text-xs text-muted-foreground">Best Day</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          {data.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No reward data available for the selected timeframe</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}